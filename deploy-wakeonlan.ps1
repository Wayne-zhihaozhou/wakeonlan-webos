<#
 =====================================================================
  Wake-on-LAN · webOS 电视部署脚本 (一键)
  ---------------------------------------------------------------------
  ⚠️ 重要：请先【断开 VPN】，否则连不到电视 192.168.1.4:9922。
  电视上请保持 Developer Mode 应用在前台（Key Server 生效）。

  用法（建议管理员 PowerShell）：
      powershell -ExecutionPolicy Bypass -File .\deploy-wakeonlan.ps1
  自定义：.\deploy-wakeonlan.ps1 -TvIp 192.168.1.4 -Device lg -Passphrase C30E73

  自动完成：连通行检查 → 修正novacom host → 取密钥 → 打包 → 安装 → 启动
  每步打印 [OK]/[FAIL]，末尾给汇总。
 =====================================================================
#>
[CmdletBinding()]
param(
    [string]$TvIp       = '192.168.1.4',
    [int]   $TvPort     = 9922,
    [string]$Device     = 'lg',
    [string]$Passphrase = 'C30E73',
    [string]$ProjectDir = '',
    [switch]$SkipLaunch,
    [switch]$TestWake
)

$ErrorActionPreference = 'Continue'
$summary = @()

if (-not $ProjectDir) { $ProjectDir = $PSScriptRoot }
if (-not $ProjectDir) { $ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Definition }
if (-not $ProjectDir) { $ProjectDir = (Get-Location).Path }

function Say($msg) { Write-Host $msg }
function Ok($msg)  { Write-Host ("  [OK]   " + $msg) -ForegroundColor Green }
function Fail($msg){ Write-Host ("  [FAIL] " + $msg) -ForegroundColor Red }
function Warn($msg){ Write-Host ("  [!!]   " + $msg) -ForegroundColor Yellow }

function Step-Port([string]$ip, [int]$port) {
    $c = New-Object System.Net.Sockets.TcpClient
    try {
        $ar = $c.BeginConnect($ip, $port, $null, $null)
        if ($ar.AsyncWaitHandle.WaitOne(1500, $false) -and $c.Connected) { return $true }
    } catch {}
    $c.Close()
    return $false
}

function Patch-NovacomHost {
    $cfg = Join-Path $env:APPDATA '.webos\tv\novacom-devices.json'
    if (-not (Test-Path $cfg)) { return $false }
    $json = Get-Content $cfg -Raw | ConvertFrom-Json
    $changed = $false
    foreach ($d in $json) {
        if ($d.name -eq $Device) {
            if ($d.host -ne $TvIp) { $d.host = $TvIp; $changed = $true }
            $d.default = $true
        }
    }
    if ($changed) { ($json | ConvertTo-Json -Depth 8) | Set-Content $cfg -Encoding UTF8 }
    return $true
}

function Get-Key {
    $out = & ares-novacom --device $Device --getkey --passphrase $Passphrase 2>&1 | Out-String
    if ($out -match 'ERR!|Failed|Error|denied|invalid|passphrase') {
        Fail "取密钥失败: $($out.Trim())"
        Fail "请确认电视 Developer Mode 左下角显示的 Passphrase 与 '$Passphrase' 完全一致（区分大小写），并保持应用在前台。"
        return $false
    }
    return $true
}

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host " Wake-on-LAN webOS 部署脚本"
Write-Host " 电视: $TvIp`:$TvPort   设备: $Device   项目: $ProjectDir"
Write-Host "==============================================" -ForegroundColor Cyan

Say "`n[1/7] 检查 ares CLI..."
if (Get-Command ares -ErrorAction SilentlyContinue) { Ok "ares 可用: $((ares -V) 2>&1)" ; $summary += 'OK ares' }
else { Fail "未找到 ares。先执行: npm install -g @webos-tools/cli"; exit 1 }

Say "`n[2/7] 检查电视连通性 $TvIp`:$TvPort ..."
if (-not (Test-Connection -ComputerName $TvIp -Count 1 -Quiet -ErrorAction SilentlyContinue)) {
    Fail "ping 不通 $TvIp。请确认：已断开 VPN / 电视在同一局域网。"; exit 1
}
if (Step-Port $TvIp $TvPort) { Ok "端口 $TvPort 开放" }
else {
    Fail "端口 $TvPort 不通！多半是 VPN 未断开，或电视 Developer Mode 应用未在前台 / Key Server 未开 / 会话过期。"
    Fail "请断开 VPN，并在电视上打开 Developer Mode 应用（保持前台，Dev Mode Status=ON、Key Server=ON），再重跑。"
    exit 1
}
$summary += 'OK 连通'

Say "`n[3/7] 修正 novacom host=$TvIp ..."
if (Patch-NovacomHost) { Ok "novacom 配置已更新 (device=$Device -> $TvIp)" ; $summary += 'OK host' }
else { Fail "未找到 novacom 配置"; $summary += 'FAIL host'; exit 1 }

Say "`n[4/7] 获取 SSH 密钥 ..."
if (Get-Key) { Ok "取密钥成功（已连上电视）"; $summary += 'OK key' }
else { $summary += 'FAIL key'; exit 1 }

Say "`n[5/7] 验证连接 (ares-device -i) ..."
$info = & ares-device -i --device $Device 2>&1 | Out-String
if ($info -match 'modelName|sdkVersion|boardType') {
    $line = ($info -split "`r?`n" | Where-Object { $_ -match 'modelName' } | Select-Object -First 1)
    Ok "连接成功: $($line.Trim())"; $summary += 'OK connect'
} else {
    Warn "ares-device -i 未能读取信息（可能命令格式不同，跳过，交由安装步骤验证）: $($info.Trim())"
}

# 6. 打包（必须同时传 app 目录 + 服务目录）
Say "`n[6/7] 打包应用 ..."
$svcDir = Join-Path $ProjectDir 'services\com.woltv.wakeonlan.service'
$dist   = Join-Path $ProjectDir 'dist'
New-Item -ItemType Directory -Force -Path $dist | Out-Null
Get-ChildItem "$dist\*.ipk" -ErrorAction SilentlyContinue | Remove-Item -Force
$pkgOut = & ares-package $ProjectDir $svcDir -o $dist 2>&1 | Out-String
$ipk = Get-ChildItem -Path $dist -Filter '*.ipk' | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if ($ipk) { Ok "打包完成: $($ipk.Name)"; $summary += 'OK package' }
else { Fail "打包失败: $pkgOut"; $summary += 'FAIL package'; exit 1 }

# 7. 安装
Say "`n[7/7] 安装应用到电视 ..."
$inst = & ares-install --device $Device $ipk.FullName 2>&1 | Out-String
if ($inst -match 'Connection timed out|ERR!') {
    Fail "安装失败（可能 VPN 又开了？）: $($inst.Trim())"; $summary += 'FAIL install'; exit 1
}
if ($inst -match 'Success|Installed|succeeded|already installed|existing') { Ok "安装成功: com.woltv.wakeonlan"; $summary += 'OK install' }
else { Fail "安装失败: $($inst.Trim())"; $summary += 'FAIL install'; exit 1 }

# 启动
if (-not $SkipLaunch) {
    Say "`n[额外] 启动应用 ..."
    $la = & ares-launch --device $Device com.woltv.wakeonlan 2>&1 | Out-String
    if ($la -match 'Success|launched|success') { Ok "应用已启动，请到电视上核对并保存配置"; $summary += 'OK launch' }
    else { Warn "启动返回: $($la.Trim())"; $summary += 'WARN launch' }
}

if ($TestWake) {
    Say "`n[额外] 尝试触发一次唤醒 (luna-send)..."
    $w = & ares-shell --device $Device "luna-send -n 1 luna://com.woltv.wakeonlan.service/wake '{}'" 2>&1 | Out-String
    Say "  $($w.Trim())"
}

Say "`n================ 结果汇总 ================" -ForegroundColor Cyan
$summary | ForEach-Object { Write-Host "  $_" }
if (-not ($summary | Where-Object { $_ -like 'FAIL*' })) {
    Say ">>> 全部成功！请到电视上打开「Wake on LAN」应用，核对 MAC/IP 并保存。" -ForegroundColor Green
} else {
    Say ">>> 存在失败项，请把上面输出发给我。" -ForegroundColor Yellow
}

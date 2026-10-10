<#
 =====================================================================
  Wake-on-LAN · Windows(Win11) 侧设置检查/修复脚本
  ---------------------------------------------------------------------
  WOL 无法唤醒电脑，绝大多数是 Win 侧设置不对。这个脚本帮你逐项检查；
  若发现问题，会【询问用户】，确认后才执行一键修复。需要管理员权限。

  用法：
     powershell -ExecutionPolicy Bypass -File .\check-wol-win.ps1        # 检查，发现问题后询问是否修复
     powershell -ExecutionPolicy Bypass -File .\check-wol-win.ps1 -Fix   # 检查并直接自动修复（不询问，供脚本调用）

  可自定义目标 MAC：  -Mac CC:28:AA:A7:B4:1F

  检查项：
     1. 目标网卡（有线）存在且活动、MAC 正确
     2. 网卡【允许此设备唤醒计算机】     (PnPCapabilities 不含 0x20)
     3. 网卡高级属性【Wake on Magic Packet】= Enabled
     4. 网卡【允许仅用魔术包唤醒】        (WakeOnMagicPacket 电源管理)
     5. Windows【快速启动】已关闭        (HiberbootEnabled = 0)
 =====================================================================
#>
[CmdletBinding()]
param(
    [string]$Mac = 'CC:28:AA:A7:B4:1F',
    [switch]$Fix
)

$ErrorActionPreference = 'Continue'
$targetMac = ($Mac -replace '[^0-9a-fA-F]', '').ToUpper()

# 收集检查发现的问题：每项含描述 Desc 与对应的修复动作 Action(scriptblock)
$problems = [System.Collections.Generic.List[object]]::new()

function Say($m) { Write-Host $m }
function Ok($m)  { Write-Host ("  [OK]   " + $m) -ForegroundColor Green }
function Fail($m){ Write-Host ("  [FAIL] " + $m) -ForegroundColor Red }
function Warn($m){ Write-Host ("  [!!]   " + $m) -ForegroundColor Yellow }

# 记录一个问题及其修复动作
function Add-Problem($desc, [scriptblock]$action) {
    $script:problems.Add([pscustomobject]@{ Desc = $desc; Action = $action })
}

# 判断“启用/关闭”值是否为“已启用”，兼容中英文（开启/Enabled/True/1/On）
function Is-Enabled($v) {
    if ($null -eq $v) { return $false }
    return ("$v" -match '^(?i:enabled?|true|1|on|开启|已开启)$')
}

Say "=============================================="
Say " Wake-on-LAN  Windows 设置检查   (目标MAC $Mac)"
Say "=============================================="

# 是否管理员
$principal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
$isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) { Warn "当前不是管理员。修复和注册表改动需要管理员权限；检查可继续。" }

# ---------- 1. 找目标网卡 ----------
Say "`n[1] 查找目标网卡 (MAC $Mac) ..."
$adapter = Get-NetAdapter -Physical -ErrorAction SilentlyContinue |
    Where-Object { ($_.MacAddress -replace '[^0-9a-fA-F]','').ToUpper() -eq $targetMac } |
    Select-Object -First 1
if (-not $adapter) {
    # 找不到就找第一个活动的有线网卡兜底
    $adapter = Get-NetAdapter -Physical -ErrorAction SilentlyContinue |
        Where-Object { $_.InterfaceDescription -notmatch 'Wi-?Fi|Wireless|Bluetooth' -and $_.Status -eq 'Up' } |
        Select-Object -First 1
    if ($adapter) { Warn "未按 MAC 找到目标卡，回退到活动有线网卡：$($adapter.Name) ($($adapter.MacAddress))" }
}
if (-not $adapter) { Fail "找不到有线网卡。请插好网线并确认驱动正常。"; exit 1 }
$name = $adapter.Name
Say "  目标网卡: $name"
Say "  描述: $($adapter.InterfaceDescription)"
Say "  MAC : $($adapter.MacAddress)"
Say "  状态: $($adapter.Status)  速度: $($adapter.LinkSpeed)"
if ($adapter.MacAddress -replace '[^0-9a-fA-F]','' -ne $targetMac) {
    Warn "网卡 MAC ($($adapter.MacAddress)) 与目标 $Mac 不一致！电视里要填的 MAC 应是这个网卡的 MAC。"
}
if ($adapter.InterfaceDescription -match 'Wi-?Fi|Wireless') { Warn "这是无线网卡，WOL 通常走有线才可靠！" }

# ---------- 2. 允许此设备唤醒计算机 ----------
Say "`n[2] 电源管理：允许此设备唤醒计算机 ..."
$pm = Get-NetAdapterPowerManagement -Name $name -ErrorAction SilentlyContinue
# “允许此设备唤醒计算机”由网卡注册表 PnPCapabilities 控制；bit 0x20 置位=禁止唤醒
$classRoot = 'HKLM:\SYSTEM\CurrentControlSet\Control\Class\{4d36e972-e325-11ce-bfc1-08002be10318}'
$classSub = Get-ChildItem $classRoot -ErrorAction SilentlyContinue |
    Where-Object { (Get-ItemProperty $_.PSPath -Name NetCfgInstanceId -ErrorAction SilentlyContinue).NetCfgInstanceId -eq "$($adapter.InterfaceGuid)" } |
    Select-Object -First 1
if ($classSub) {
    $classPath = $classSub.PSPath
    $pcRaw = (Get-ItemProperty $classPath -Name PnPCapabilities -ErrorAction SilentlyContinue).PnPCapabilities
    if ($null -eq $pcRaw) { $pcRaw = 0 }
    $intPc = [int]$pcRaw
    Say "  PnPCapabilities = 0x$($intPc.ToString('X'))"
    if (($intPc -band 0x20) -eq 0) { Ok "允许此设备唤醒计算机（唤醒未被禁用）" }
    else {
        Fail "此设备禁止唤醒计算机（PnPCapabilities 含 0x20 位）"
        Add-Problem "网卡禁止唤醒计算机" {
            $new = $script:intPc -band (-bnot 0x20)
            Set-ItemProperty -Path $script:classPath -Name PnPCapabilities -Value $new -Type DWord -ErrorAction Stop
        }
    }
} else {
    Warn "找不到网卡的注册表实例，跳过此项。"
}

# ---------- 3. 高级属性 Wake on Magic Packet ----------
Say "`n[3] 网卡高级属性：Wake on Magic Packet ..."
# 不同驱动关键字不同：优先按关键字，找不到就按“Magic”模糊匹配。
$womp = Get-NetAdapterAdvancedProperty -Name $name -RegistryKeyword WakeOnMagicPacket -ErrorAction SilentlyContinue
if (-not $womp) {
    $womp = Get-NetAdapterAdvancedProperty -Name $name -ErrorAction SilentlyContinue |
        Where-Object { $_.DisplayName -match 'Magic' -or $_.RegistryKeyword -match 'Magic' } |
        Select-Object -First 1
}
if ($womp) {
    Say "  项: $($womp.DisplayName)  当前值: $($womp.DisplayValue)"
    if (Is-Enabled $womp.DisplayValue) { Ok "Wake on Magic Packet 已启用" }
    else {
        Fail "Wake on Magic Packet 未启用"
        Add-Problem "网卡高级属性 Wake on Magic Packet 未启用" { Set-NetAdapterAdvancedProperty -Name $name -RegistryKeyword $womp.RegistryKeyword -RegistryValue "Enabled" -ErrorAction Stop }
    }
} else {
    Warn "该网卡没有 Magic Packet 高级项（部分驱动不提供），跳过。可到 设备管理器->网卡->高级 里手动确认。"
}

# ---------- 4. 电源管理 Wake on Magic Packet ----------
Say "`n[4] 电源管理：Wake on Magic Packet ..."
if ($pm) {
    Say "  当前值: $($pm.WakeOnMagicPacket)"
    if (Is-Enabled $pm.WakeOnMagicPacket) { Ok "电源管理魔术包唤醒已启用" }
    else {
        Fail "魔术包唤醒未启用"
        Add-Problem "电源管理魔术包唤醒未启用" { Set-NetAdapterPowerManagement -Name $name -WakeOnMagicPacket Enabled -ErrorAction Stop }
    }
} else {
    Warn "无法读取网卡电源管理信息，跳过此项。"
}

# ---------- 5. 快速启动 ----------
Say "`n[5] 关闭 Windows 快速启动 ..."
try {
    $hib = (Get-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Power' -Name HiberbootEnabled -ErrorAction Stop).HiberbootEnabled
    Say "  HiberbootEnabled = $hib"
    if ($hib -eq 0) { Ok "快速启动已关闭" }
    else {
        Fail "快速启动未关闭（这是 WOL 失效最常见原因）"
        Add-Problem "Windows 快速启动未关闭" { Set-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Power' -Name HiberbootEnabled -Value 0 -ErrorAction Stop }
    }
} catch {
    Fail "无法读取快速启动注册表项: $($_.Exception.Message)"
}

# ---------- 汇总 ----------
Say "`n================ 检查完成 ================" -ForegroundColor Cyan
if ($problems.Count -eq 0) {
    Say "  未发现问题，Windows WOL 设置正常，无需修复。" -ForegroundColor Green
} else {
    Say "  检测到 $($problems.Count) 个问题：" -ForegroundColor Yellow
    foreach ($p in $problems) { Say "    - $($p.Desc)" }

    if (-not $isAdmin) {
        Warn "发现问题，但当前不是管理员，无法修复。请以【管理员】身份重新运行本脚本。"
    }
    elseif ($Fix) {
        # -Fix：不询问，直接自动修复
        Say "`n  -Fix 模式：直接执行一键修复 ..." -ForegroundColor Yellow
        $confirmed = $true
    }
    else {
        # 询问用户是否执行一键修复
        $answer = Read-Host "`n  是否执行一键修复？(Y/N)"
        $confirmed = ($answer -match '^(?i:y|yes|是)$')
    }

    if ($confirmed) {
        Say "  正在执行一键修复 ..."
        $fixed = 0
        foreach ($p in $problems) {
            try {
                & $p.Action
                Say ("  [已修复] " + $p.Desc) -ForegroundColor Green
                $fixed++
            } catch {
                Say ("  [失败]   " + $p.Desc + " -> " + $_.Exception.Message) -ForegroundColor Red
            }
        }
        Say "`n  修复完成：成功 $fixed / 共 $($problems.Count)。" -ForegroundColor Cyan
        Say "  部分网卡设置需【重启电脑】或【重新插拔网线】才生效。" -ForegroundColor Green
    } else {
        Say "  已取消修复。以上问题仍需处理，否则 WOL 可能无法生效。" -ForegroundColor Yellow
    }
}

Say "  修复后到电视上点「立即唤醒（测试）」验证；再不行检查：电视与电脑同局域网、电视应用里 MAC/IP 正确。"
Say ""
Say "  ==============================================" -ForegroundColor Cyan
Say "  检查/修复已完成。按【回车】键关闭此窗口。" -ForegroundColor Yellow
$null = Read-Host

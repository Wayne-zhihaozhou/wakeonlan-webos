<#
 =====================================================================
  Wake-on-LAN · Windows(Win11) 侧设置检查/修复脚本
  ---------------------------------------------------------------------
  WOL 无法唤醒电脑，绝大多数是 Win 侧设置不对。这个脚本帮你逐项检查
  并在确认后一键修复。运行前请以【管理员】身份打开 PowerShell。

  用法：
      powershell -ExecutionPolicy Bypass -File .\check-wol-win.ps1       # 只检查
      powershell -ExecutionPolicy Bypass -File .\check-wol-win.ps1 -Fix   # 检查并自动修复

  可自定义目标 MAC：  -Mac CC:28:AA:A7:B4:1F

  检查项：
      1. 目标网卡（有线）存在且活动、MAC 正确
      2. 网卡【允许此设备唤醒计算机】     (AllowComputerToTurnOffDevice)
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

function Say($m) { Write-Host $m }
function Ok($m)  { Write-Host ("  [OK]   " + $m) -ForegroundColor Green }
function Fail($m){ Write-Host ("  [FAIL] " + $m) -ForegroundColor Red }
function Warn($m){ Write-Host ("  [!!]   " + $m) -ForegroundColor Yellow }

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
if (-not $isAdmin) { Warn "当前不是管理员。修复(-Fix)和注册表改动需要管理员权限；检查可继续。" }

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
$allowTurnOff = $pm.AllowComputerToTurnOffDevice
Say "  当前值: $allowTurnOff"
if (Is-Enabled $allowTurnOff) { Ok "允许此设备唤醒计算机" }
else { Fail "此设备未允许唤醒计算机"; if ($Fix -and $isAdmin) { Set-NetAdapterPowerManagement -Name $name -AllowComputerToTurnOffDevice Enabled -ErrorAction Stop; Say "  -> 已修复" } else { Warn "需要 -Fix 修复" } }

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
    else { Fail "Wake on Magic Packet 未启用"; if ($Fix -and $isAdmin) { Set-NetAdapterAdvancedProperty -Name $name -RegistryKeyword $womp.RegistryKeyword -RegistryValue "Enabled" -ErrorAction Stop; Say "  -> 已修复" } else { Warn "需要 -Fix 修复" } }
} else {
    Warn "该网卡没有 Magic Packet 高级项（部分驱动不提供），跳过。可到 设备管理器->网卡->高级 里手动确认。"
}

# ---------- 4. 电源管理 Wake on Magic Packet ----------
Say "`n[4] 电源管理：Wake on Magic Packet ..."
if ($pm) {
    Say "  当前值: $($pm.WakeOnMagicPacket)"
    if (Is-Enabled $pm.WakeOnMagicPacket) { Ok "电源管理魔术包唤醒已启用" }
    else { Fail "魔术包唤醒未启用"; if ($Fix -and $isAdmin) { Set-NetAdapterPowerManagement -Name $name -WakeOnMagicPacket Enabled -ErrorAction Stop; Say "  -> 已修复" } else { Warn "需要 -Fix 修复" } }
} else {
    Warn "无法读取网卡电源管理信息，跳过此项。"
}

# ---------- 5. 快速启动 ----------
Say "`n[5] 关闭 Windows 快速启动 ..."
try {
    $hib = (Get-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Power' -Name HiberbootEnabled -ErrorAction Stop).HiberbootEnabled
    Say "  HiberbootEnabled = $hib"
    if ($hib -eq 0) { Ok "快速启动已关闭" }
    else { Fail "快速启动未关闭（这是 WOL 失效最常见原因）"; if ($Fix -and $isAdmin) { Set-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Power' -Name HiberbootEnabled -Value 0 -ErrorAction Stop; Say "  -> 已修复（0）" } else { Warn "需要 -Fix 修复" } }
} catch {
    Fail "无法读取快速启动注册表项: $($_.Exception.Message)"
}

# ---------- 汇总 ----------
Say "`n================ 检查完成 ================" -ForegroundColor Cyan
if ($isAdmin -and $Fix) {
    Say "  -Fix 已执行，改动已应用。部分网卡设置需【重启电脑】或【重新插拔网线】才生效。" -ForegroundColor Green
} else {
    Say "  以上任一 [FAIL] 项都可能导致 WOL 失效。可用管理员身份加 -Fix 一键修复："
    Say "     powershell -ExecutionPolicy Bypass -File .\check-wol-win.ps1 -Fix" -ForegroundColor Yellow
}
Say "  修复后到电视上点「立即唤醒（测试）」验证；再不行检查：电视与电脑同局域网、电视应用里 MAC/IP 正确。"

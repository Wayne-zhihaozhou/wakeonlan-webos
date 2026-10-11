# probe-subscribe.ps1
# ------------------------------------------------------------------
# 探测电视上哪些 luna 服务方法可被「第三方应用 com.woltv.wakeonlan.service」订阅。
# 结果用于判断：Activity Manager 触发器还能用哪些事件源（当前 tvpower/displayStatus 被 ACG 拒绝，
# 只有 connectionmanager/getStatus 成功）。
#
# 前提：断开 VPN；电视 Developer Mode 的 Key Server 在线（9922 可通）。
# 用法：
#   powershell -ExecutionPolicy Bypass -File .\probe-subscribe.ps1
#
# 原理：用 ares-novacom 在电视上跑 luna-send，带 -a <appid> 模拟第三方调用方，
# 对每个候选方法发起订阅。用 -n 1 取首条返回后退出，并对每条命令做硬超时防挂死。
#
# 结果解读：
#   returnValue:true + subscribed:true  -> 第三方可订阅（可作为 Activity 触发器候选）
#   returnValue:false + errorText 含 rights -> 第三方无权限（Activity 触发器不可用）
# ------------------------------------------------------------------

$ErrorActionPreference = 'Continue'
$DEVICE = 'lg'
$CALLER = 'com.woltv.wakeonlan.service'
$HOST_TIMEOUT_S = 10   # 每条电视命令的硬超时（秒）

# 候选事件源方法清单（覆盖「屏幕亮起 / 开机 / 电源 / 网络 / 系统事件」）
$probes = @(
    @{ label = 'tvpower/powerState';              uri = 'luna://com.webos.service.tvpower/powerState';            payload = '{"subscribe":true}' },
    @{ label = 'tvpower/currentPowerState';       uri = 'luna://com.webos.service.tvpower/currentPowerState';      payload = '{}' },
    @{ label = 'tvpower/notifyPowerOn';           uri = 'luna://com.webos.service.tvpower/notifyPowerOn';          payload = '{"subscribe":true}' },
    @{ label = 'systemservice/displayStatus';     uri = 'luna://com.webos.service.systemservice/displayStatus';    payload = '{"subscribe":true}' },
    @{ label = 'systemservice/getPowerState';     uri = 'luna://com.webos.service.systemservice/getPowerState';    payload = '{"subscribe":true}' },
    @{ label = 'systemservice/activityManager';   uri = 'luna://com.webos.service.systemservice/activityManager';  payload = '{"subscribe":true}' },
    @{ label = 'systemmanager/displayStatus';     uri = 'luna://com.palm.systemmanager/displayStatus';             payload = '{"subscribe":true}' },
    @{ label = 'connectionmanager/getStatus';     uri = 'luna://com.webos.service.connectionmanager/getStatus';    payload = '{"subscribe":true}' },
    @{ label = 'applicationmanager/running';      uri = 'luna://com.webos.service.applicationmanager/running';     payload = '{"subscribe":true}' },
    @{ label = 'applicationManager/currentApp';   uri = 'luna://com.webos.service.applicationManager/currentApp';  payload = '{"subscribe":true}' },
    @{ label = 'appcatalogservice/devices';       uri = 'luna://com.webos.service.appcatalogservice/devices';      payload = '{"subscribe":true}' },
    @{ label = 'systemservice/tvScreenState';     uri = 'luna://com.webos.service.systemservice/tvScreenState';    payload = '{"subscribe":true}' }
)

# 执行一条电视命令，带超时（兼容 Windows PowerShell 5.1 与 7+）
function Invoke-TVCommand([string]$cmd, [int]$timeoutSec) {
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = 'ares-novacom'
    $psi.Arguments = "--device $DEVICE --run `"$cmd`""
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true
    $psi.UseShellExecute = $false
    $psi.CreateNoWindow = $true
    $proc = New-Object System.Diagnostics.Process
    $proc.StartInfo = $psi
    try { $proc.Start() | Out-Null } catch { return "START FAIL: $_" }
    if (-not $proc.WaitForExit($timeoutSec * 1000)) {
        try { $proc.Kill() } catch {}
        return "TIMEOUT (>$timeoutSec s)"
    }
    $so = $proc.StandardOutput.ReadToEnd()
    $se = $proc.StandardError.ReadToEnd()
    return ($so + $se).Trim()
}

Write-Host "== 探测第三方($CALLER)可订阅的 luna 方法 ==" -ForegroundColor Cyan
Write-Host "设备: $DEVICE @ 192.168.1.4:9922`n"

# 连接自检
$self = Invoke-TVCommand 'echo CONNECT_OK' $HOST_TIMEOUT_S
if ($self -notmatch 'CONNECT_OK') {
    Write-Host "!! 无法连接电视（ares-novacom 9922 不通）。" -ForegroundColor Red
    Write-Host "   请确认：已断开 VPN、电视 Developer Mode 的 Key Server 在线。输出：$self"
    exit 1
}
Write-Host "连接 OK`n" -ForegroundColor Green

# 确认 luna-send
$which = Invoke-TVCommand 'which luna-send' $HOST_TIMEOUT_S
Write-Host "luna-send 位置: $which`n" -ForegroundColor Green

foreach ($p in $probes) {
    $cmd = "luna-send -n 1 -a $CALLER $($p.uri) '$($p.payload)'"
    Write-Host "--- $($p.label) ---" -ForegroundColor Yellow
    Write-Host "CMD: $cmd" -ForegroundColor DarkGray
    $out = Invoke-TVCommand $cmd $HOST_TIMEOUT_S
    $out -split "`n" | ForEach-Object {
        if ($_ -match 'subscribed') { Write-Host "  $_" -ForegroundColor Green }
        elseif ($_ -match 'rights|denied|permission') { Write-Host "  $_" -ForegroundColor Red }
        else { Write-Host "  $_" }
    }
    Write-Host ""
}

Write-Host "== 探测完成。把输出贴回来即可。 ==" -ForegroundColor Cyan
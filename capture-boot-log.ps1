<#
 =====================================================================
  capture-boot-log.ps1 · 抓取电视冷开机后的 WoL 服务日志
  ---------------------------------------------------------------------
  用途：定位「电视冷开机 → 电脑不醒」断在哪一环。
  背景：手动打开应用能唤醒（包正确），但电视冷开机不自启。原因很可能
        是 webOS 26 冷开机时根本不会拉起 wol_service.js 进程
        （JS Service 懒启动）。本脚本把 ares-log 输出写进本地文件，
        方便你关机/开机电视后再回看。

  用法（在电脑上、确保已断开 VPN）：
      powershell -ExecutionPolicy Bypass -File .\capture-boot-log.ps1 -Device lg

  然后：① 保持本脚本跑着 → ② 完全关电视 → ③ 重新开机 → ④ 等 2~3 分钟
  → ⑤ 回到本窗口按 Ctrl+C 停止，输出会保存到 logs\boot-<时间戳>.log

  之后把 logs\ 下新生成的 .log 文件内容发给我分析即可。

  参数：
      -Device   ares 设备名（默认 lg）
      -Seconds  可选：自动停止前的抓取时长（秒）。默认不自动停，按 Ctrl+C。
 =====================================================================
#>
param(
    [string]$Device = 'lg',
    [int]$Seconds = 0
)

$ErrorActionPreference = 'Continue'
$logsDir = Join-Path $PSScriptRoot 'logs'
New-Item -ItemType Directory -Force -Path $logsDir | Out-Null
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$out   = Join-Path $logsDir "boot-$stamp.log"

Write-Host "开始抓取电视[$Device]的 com.woltv.wakeonlan.service 日志 ..." -ForegroundColor Cyan
Write-Host "  输出文件: $out"
Write-Host ""
Write-Host ">>> 请现在【完全关闭电视电源】，然后再【重新开机】。" -ForegroundColor Yellow
Write-Host ">>> 开机后等 2~3 分钟（覆盖 90 秒发送窗口 + 启动余量），再回来停止本脚本。" -ForegroundColor Yellow
if ($Seconds -gt 0) {
    Write-Host ">>> 将在 $Seconds 秒后自动停止。" -ForegroundColor Yellow
}
Write-Host ">>> 随时按 Ctrl+C 手动停止。" -ForegroundColor Yellow
Write-Host ""

if ($Seconds -gt 0) {
    Start-Job -Name areslog -ScriptBlock {
        param($Device)
        ares-log --device $Device com.woltv.wakeonlan.service 2>&1
    } -ArgumentList $Device | Out-Null
    Write-Host "后台抓取中（$Seconds 秒）..."
    Start-Sleep -Seconds $Seconds
    Stop-Job -Name areslog -ErrorAction SilentlyContinue
    $job = Get-Job -Name areslog -ErrorAction SilentlyContinue
    if ($job) {
        $job | Receive-Job | Set-Content $out -Encoding UTF8
        $job | Remove-Job -Force
    }
} else {
    ares-log --device $Device com.woltv.wakeonlan.service 2>&1 | Tee-Object -FilePath $out
}

Write-Host ""
Write-Host "日志已保存: $out" -ForegroundColor Green
Write-Host "请把这个 .log 文件内容发给我，我来判断断在哪一环。" -ForegroundColor Green

<#
 =====================================================================
  receive-log.ps1 · 电脑端接收电视推送的日志（UDP）
  ---------------------------------------------------------------------
  配合电视应用里「把日志转发到电脑」功能使用：
    电视上的服务每打一行 console.log，就通过 UDP 把该行推给本机。
  本脚本在电脑上监听指定端口，收到后实时显示并追加保存到本地文件，
  方便你舒舒服服地在电脑上看日志，不用在电视上翻。

  用法（电脑上、确保与电视同一局域网）：
      powershell -ExecutionPolicy Bypass -File .\receive-log.ps1

  参数：
      -Port         UDP 监听端口（默认 5555，须与电视设置里的端口一致）
      -Out         日志落盘目录（默认 项目目录\logs\received）
  ---------------------------------------------------------------------
  对应到电视应用：打开应用 → 勾选「把日志转发到电脑」→ 把「电脑 IP」
  填成这台电脑的局域网 IP（192.168.1.6）→ 端口保持 5555 → 保存。
  电视每次开机/服务启动后，日志就会源源不断推到这里。
 =====================================================================
#>
param(
    [int]$Port = 5555,
    [string]$Out = ''
)

$ErrorActionPreference = 'Continue'

if (-not $Out) { $Out = Join-Path $PSScriptRoot 'logs\received' }
New-Item -ItemType Directory -Force -Path $Out | Out-Null
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$file  = Join-Path $Out "wol-$stamp.log"

Write-Host "正在监听 UDP 端口 $Port，等待电视推送日志 ..." -ForegroundColor Cyan
Write-Host "  输出文件: $file"
Write-Host ""
Write-Host ">>> 电视侧需已勾选『把日志转发到电脑』，且把电脑 IP 指向本机、端口=$Port。" -ForegroundColor Yellow
Write-Host ">>> 本窗口保持开着；按 Ctrl+C 停止（已收到的日志会保存在文件里）。" -ForegroundColor Yellow
Write-Host ""

# 单播监听：只接收发往本机 IP 指定端口的数据包。
$udp = New-Object System.Net.Sockets.UdpClient($Port)
$udp.Client.ReceiveTimeout = 1000   # 1s 超时，让循环能及时响应 Ctrl+C
$remote = New-Object System.Net.IPEndPoint([System.Net.IPAddress]::Any, 0)

try {
    while ($true) {
        try {
            $data = $udp.Receive([ref]$remote)
        } catch {
            continue   # 超时（无人发）就继续等
        }
        $line = [System.Text.Encoding]::UTF8.GetString($data)
        $ts = Get-Date -Format 'HH:mm:ss.fff'
        $display = "[$ts] $line"
        # 实时回显到屏幕
        Write-Host $display
        # 追加落盘
        try { Add-Content -Path $file -Value $display -Encoding UTF8 } catch { }
    }
} finally {
    $udp.Close()
    Write-Host ""
    Write-Host "已停止。日志保存在: $file" -ForegroundColor Green
}

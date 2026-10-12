# listen-magic-packet.ps1
# 在 Windows 上开启一个 UDP 端口监视，接收电视应用发出的魔术包（Wake-on-LAN）。
# 用法（PowerShell 管理员或普通用户均可，端口 >1024 无需管理员；监听 9 端口可能需要管理员）：
#   .\listen-magic-packet.ps1
#   .\listen-magic-packet.ps1 -Port 9
#   .\listen-magic-packet.ps1 -Port 9 -Verbose
# 按 Ctrl+C 结束。

param(
    [int]$Port = 9,
    [switch]$VerboseLog
)

$ErrorActionPreference = 'Stop'

# 局域网 IP（用于提示）
$localIps = (Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
    Where-Object { $_.IPAddress -notlike '169.254.*' -and $_.IPAddress -ne '127.0.0.1' } |
    Select-Object -ExpandProperty IPAddress)

Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host "  魔术包 UDP 监听器" -ForegroundColor Cyan
Write-Host "  监听端口 : UDP $Port" -ForegroundColor Cyan
Write-Host "  本机 IP  : $($localIps -join ', ')" -ForegroundColor Cyan
Write-Host "  等待电视应用发送魔术包，按 Ctrl+C 退出..." -ForegroundColor Cyan
Write-Host "==============================================================" -ForegroundColor Cyan

# 使用 System.Net.Sockets.UdpClient 绑定到指定端口
$udp = New-Object System.Net.Sockets.UdpClient($Port)
# 允许接收广播/组播包（某些情况下需要，通常绑定后即可接收广播）
try { $udp.EnableBroadcast = $true } catch { }

# 把魔术包内容（6 字节 0xFF + MAC 重复 16 次，共 102 字节）转为可读字符串
function Format-MagicPacket([byte[]]$bytes) {
    if ($bytes.Length -ne 102) {
        return "长度不是标准的 102 字节 (实际 $($bytes.Length) 字节)"
    }
    # 前 6 字节应为 0xFF
    $headOk = $true
    for ($i = 0; $i -lt 6; $i++) {
        if ($bytes[$i] -ne 0xFF) { $headOk = $false; break }
    }
    $mac = ($bytes[6..11] | ForEach-Object { $_.ToString('X2') }) -join ':'
    $repeatOk = $true
    for ($r = 1; $r -lt 16; $r++) {
        for ($i = 0; $i -lt 6; $i++) {
            if ($bytes[6 + $i] -ne $bytes[6 + $r * 6 + $i]) { $repeatOk = $false; break }
        }
    }
    $valid = $headOk -and $repeatOk
    $status = if ($valid) { "有效魔术包" } else { "不是标准魔术包格式" }
    return "MAC=$mac | $status"
}

$count = 0
while ($true) {
    try {
        $remote = New-Object System.Net.IPEndPoint([System.Net.IPAddress]::Any, 0)
        $data = $udp.Receive([ref]$remote)
        $count++
        $stamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss.fff'
        $hex = ($data | ForEach-Object { $_.ToString('X2') }) -join ' '
        Write-Host ""
        Write-Host "[$stamp] 收到来自 $($remote.Address):$($remote.Port) 的数据报 (第 $count 个)" -ForegroundColor Green
        Write-Host "  长度 : $($data.Length) 字节"
        Write-Host "  内容 : $hex"
        Write-Host "  解析 : $(Format-MagicPacket $data)" -ForegroundColor Yellow
        if ($VerboseLog) {
            Write-Host "  源IP : $($remote.Address)" -ForegroundColor Gray
        }
    }
    catch {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] 接收出错: $_" -ForegroundColor Red
    }
}

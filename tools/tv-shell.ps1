[CmdletBinding()]
param(
    [string] $TvIp   = '192.168.1.4',
    [int]    $TvPort = 9922,
    [string] $Device = 'lg',
    [Parameter(Mandatory = $true, Position = 0)]
    [string[]] $AresArgs
)

$ErrorActionPreference = 'Continue'

$script:RelayListener = $null
$script:RelayPs       = $null
$script:RelayRs       = $null
$script:CfgPath       = $null
$script:CfgBackup     = $null
$script:Cleaned       = $false

function Ok($m)  { Write-Host ("  [OK]   " + $m) -ForegroundColor Green }
function Fail($m){ Write-Host ("  [FAIL] " + $m) -ForegroundColor Red }
function Warn($m){ Write-Host ("  [!!]   " + $m) -ForegroundColor Yellow }

function Invoke-Cleanup {
    if ($script:Cleaned) { return }
    $script:Cleaned = $true
    if ($script:RelayListener) {
        try { $script:RelayListener.Stop() } catch {}
        $script:RelayListener = $null
    }
    if ($script:RelayPs) {
        try { $null = $script:RelayPs.BeginStop($null, $null) } catch {}
        Start-Sleep -Milliseconds 150
        try { $script:RelayPs.Dispose() } catch {}
        $script:RelayPs = $null
    }
    if ($script:RelayRs) {
        try { $script:RelayRs.Close() } catch {}
        try { $script:RelayRs.Dispose() } catch {}
        $script:RelayRs = $null
    }
    if ($script:CfgPath -and $script:CfgBackup) {
        try {
            Copy-Item $script:CfgBackup $script:CfgPath -Force
            Remove-Item $script:CfgBackup -Force -ErrorAction SilentlyContinue
            Ok "已关闭中继并还原 ares 设备配置"
        } catch {
            Warn "还原 ares 配置失败: $script:CfgPath  (备份: $script:CfgBackup)"
        }
    }
}

trap { Invoke-Cleanup; Write-Host "未捕获错误: $_" -ForegroundColor Red; exit 1 }

function Get-LocalAddressFor([string]$TargetIp) {
    $target = $null
    try { $target = [System.Net.IPAddress]::Parse($TargetIp) } catch { return $null }
    if ($target.AddressFamily -ne [System.Net.Sockets.AddressFamily]::InterNetwork) { return $null }
    $tb = $target.GetAddressBytes()
    $cands = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue | Where-Object {
        $_.IPAddress -notlike '127.*' -and
        $_.IPAddress -notlike '169.254.*' -and
        $_.InterfaceAlias -notmatch 'SVN|VPN|Loopback|Virtual|TAP|VMware|Hyper-V|Bluetooth|WAN Miniport'
    }
    foreach ($c in $cands) {
        $ib = ([System.Net.IPAddress]::Parse($c.IPAddress)).GetAddressBytes()
        $pl = [int]$c.PrefixLength
        $same = $true
        for ($i = 0; $i -lt 4; $i++) {
            $bits = [Math]::Min(8, [Math]::Max(0, $pl - $i * 8))
            $mask = 0
            if ($bits -gt 0) { $mask = (0xFF -shl (8 - $bits)) -band 0xFF }
            if (($tb[$i] -band $mask) -ne ($ib[$i] -band $mask)) { $same = $false; break }
        }
        if ($same) { return $c }
    }
    return $null
}

function Test-TvPort([string]$SourceIp, [string]$TargetIp, [int]$Port, [int]$TimeoutMs = 2500) {
    $sock = $null
    try {
        $sock = New-Object System.Net.Sockets.Socket(
            [System.Net.Sockets.AddressFamily]::InterNetwork,
            [System.Net.Sockets.SocketType]::Stream,
            [System.Net.Sockets.ProtocolType]::Tcp)
        $sock.Bind((New-Object System.Net.IPEndPoint([System.Net.IPAddress]::Parse($SourceIp), 0)))
        $ar = $sock.BeginConnect($TargetIp, $Port, $null, $null)
        if ($ar.AsyncWaitHandle.WaitOne($TimeoutMs, $false) -and $sock.Connected) { return $true }
        return $false
    } catch { return $false }
    finally { if ($sock) { try { $sock.Close() } catch {} } }
}

function Get-RelayBanner([int]$Port, [int]$TimeoutMs = 5000) {
    $c = $null
    try {
        $c = New-Object System.Net.Sockets.TcpClient
        $ar = $c.BeginConnect('127.0.0.1', $Port, $null, $null)
        if (-not ($ar.AsyncWaitHandle.WaitOne($TimeoutMs, $false) -and $c.Connected)) { return $null }
        $c.ReceiveTimeout = 3000
        $ns = $c.GetStream()
        $buf = New-Object byte[] 128
        $n = $ns.Read($buf, 0, 128)
        if ($n -le 0) { return $null }
        return [System.Text.Encoding]::ASCII.GetString($buf, 0, $n).Trim()
    } catch { return $null }
    finally { if ($c) { try { $c.Close() } catch {} } }
}

function Start-TvRelay([string]$SourceIp, [string]$TargetIp, [int]$TargetPort) {
    $listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, 0)
    $listener.Start()
    $port = ([System.Net.IPEndPoint]$listener.LocalEndpoint).Port

    $rs = [runspacefactory]::CreateRunspace()
    $rs.ApartmentState = 'MTA'
    $rs.ThreadOptions = 'ReuseThread'
    $rs.Open()

    $ps = [powershell]::Create()
    $ps.Runspace = $rs

    $null = $ps.AddScript({
        param($listener, $srcIp, $dstIp, $dstPort)
        $src = [System.Net.IPAddress]::Parse($srcIp)
        $pending = New-Object System.Collections.ArrayList
        $accept = $listener.AcceptTcpClientAsync()
        while ($true) {
            try {
                if ($accept.Wait(150)) {
                    $client = $accept.Result
                    try {
                        $remote = New-Object System.Net.Sockets.TcpClient
                        $remote.Client.Bind((New-Object System.Net.IPEndPoint($src, 0)))
                        $remote.Connect($dstIp, $dstPort)
                        $cs = $client.GetStream()
                        $rw = $remote.GetStream()
                        $t1 = $cs.CopyToAsync($rw)
                        $t2 = $rw.CopyToAsync($cs)
                        [void]$pending.Add(@{ C = $client; R = $remote; T1 = $t1; T2 = $t2 })
                    } catch { try { $client.Close() } catch {} }
                    $accept = $listener.AcceptTcpClientAsync()
                }
            } catch { break }
            for ($i = $pending.Count - 1; $i -ge 0; $i--) {
                $p = $pending[$i]
                if ($p.T1.IsCompleted -or $p.T2.IsCompleted) {
                    try { $p.C.Close() } catch {}
                    try { $p.R.Close() } catch {}
                    $pending.RemoveAt($i)
                }
            }
        }
    }).AddArgument($listener).AddArgument($SourceIp).AddArgument($TargetIp).AddArgument($TargetPort)

    $null = $ps.BeginInvoke()
    $script:RelayListener = $listener
    $script:RelayPs       = $ps
    $script:RelayRs       = $rs
    return $port
}

function Get-ActiveNovacomConfig {
    $prof = (& ares-config -c 2>&1 | Out-String).Trim()
    if ($prof -match 'profile set to\s+(\S+)') { $prof = $Matches[1] }
    elseif ($prof -match '\b(ose|tv|signage|apollo)\b') { $prof = $Matches[1] }
    else { $prof = 'tv' }
    $cfg = Join-Path $env:APPDATA (".webos\$prof\novacom-devices.json")
    if (-not (Test-Path $cfg)) { $cfg = Join-Path $env:APPDATA '.webos\tv\novacom-devices.json' }
    return $cfg
}

function Read-AresDevices([string]$CfgPath) {
    if (-not (Test-Path $CfgPath)) { return $null }
    try { return (Get-Content $CfgPath -Raw | ConvertFrom-Json) } catch { return $null }
}

function Save-AresDevices([string]$CfgPath, $json) {
    $txt = $json | ConvertTo-Json -Depth 8
    [System.IO.File]::WriteAllText($CfgPath, $txt, (New-Object System.Text.UTF8Encoding($false)))
}

function Set-AresEndpoint([string]$CfgPath, [string]$DeviceName, [string]$HostName, [int]$Port) {
    $json = Read-AresDevices $CfgPath
    if (-not $json) { return $null }
    $found = $false
    foreach ($d in $json) {
        if ($d.name -eq $DeviceName) {
            $d.host = $HostName
            $d.port = "$Port"
            $d.default = $true
            $found = $true
        }
    }
    if (-not $found) { return $null }
    Save-AresDevices $CfgPath $json
    return $true
}

try {
    $addr = Get-LocalAddressFor $TvIp
    if (-not $addr) { Fail "找不到与 $TvIp 同网段的本地物理网卡"; exit 1 }
    $srcIp = $addr.IPAddress
    Ok "本地网卡: $srcIp/$($addr.PrefixLength) ($($addr.InterfaceAlias))"

    if (-not (Test-TvPort $srcIp $TvIp $TvPort)) { Fail "直连 $TvIp`:$TvPort 不通"; exit 1 }

    $cfgPath = Get-ActiveNovacomConfig
    if (-not (Test-Path $cfgPath)) { Fail "找不到 ares 设备配置: $cfgPath"; exit 1 }

    $script:CfgPath   = $cfgPath
    $script:CfgBackup = "$cfgPath.wolbak2"
    Copy-Item $cfgPath $script:CfgBackup -Force

    $relayPort = Start-TvRelay $srcIp $TvIp $TvPort
    if (-not (Set-AresEndpoint $cfgPath $Device '127.0.0.1' $relayPort)) { Fail "写入 ares 配置失败"; exit 1 }
    Ok "中继: 127.0.0.1:$relayPort -> $TvIp`:$TvPort"

    $banner = Get-RelayBanner $relayPort
    if ($banner -like 'SSH-*') { Ok "中继自检: $banner" } else { Fail "中继自检失败: '$banner'"; exit 1 }

    $tool = $AresArgs[0]
    $rest = @()
    if ($AresArgs.Count -gt 1) { $rest = $AresArgs[1..($AresArgs.Count - 1)] }

    Write-Host "`n$ $tool $($rest -join ' ')" -ForegroundColor Cyan
    $r = & $tool @rest 2>&1 | Out-String
    Write-Host $r.TrimEnd()
    Write-Host ""
    Write-Host "exit code: $LASTEXITCODE"
} finally {
    Invoke-Cleanup
}

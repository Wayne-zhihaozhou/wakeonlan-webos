<#
 =====================================================================
  项目文件导出脚本
  把项目所有「代码、配置、文档」等源文件【平铺】复制到 C:\0_AI\1
  所有文件直接放在目标根目录，不复制任何文件夹层级
  ---------------------------------------------------------------------
  自动排除：
    .git/                     —— 版本控制元数据
    dist/、*.ipk              —— 打包产物
    node_modules/             —— 依赖
    passphrase.txt / *.local.ps1 —— 个人密钥/敏感文件（按 .gitignore 约定）
    README.md                 —— 说明文档，不复制
    本脚本自身 copy-project.ps1 —— 避免复制出来的副本里再藏一个副本
  行为：
    复制之前【无条件】清空目标目录（含隐藏/只读项）中的所有内容，
    保证目标目录是源目录的干净镜像。
  可选参数：
    -Dest <目录>   默认 C:\0_AI\1
 =====================================================================
#>
[CmdletBinding()]
param(
    [string]$Dest = 'C:\0_AI\1'
)

$ErrorActionPreference = 'Stop'
$src = $PSScriptRoot
if (-not $src) { $src = Split-Path -Parent $MyInvocation.MyCommand.Definition }
if (-not $src) { $src = (Get-Location).Path }

Write-Host "源目录 : $src" -ForegroundColor Cyan
Write-Host "目标目录: $Dest" -ForegroundColor Cyan

# 排除清单（相对路径，支持通配）
$exclude = @(
    '.git',
    'dist',
    'node_modules',
    '*.ipk',
    'passphrase.txt',
    '*.local.ps1',
    '.gitignore',
    '*.png',
    'README.md',             # 说明文档，不复制到目标目录
    'copy-project.ps1'       # 自身
)

function Test-Excluded([string]$relPath) {
    # 统一用 '\' 比较，兼容 Windows 分隔符
    $p = $relPath -replace '/', '\'
    foreach ($e in $exclude) {
        $e = $e -replace '/', '\'
        if ($p -eq $e) { return $true }
        # 目录前缀排除：路径以 "e\" 开头
        if ($e -notmatch '[\*\?]' -and $p.StartsWith($e + '\')) { return $true }
        # 通配符匹配
        if ($e -match '[\*\?]' -and $p -like $e) { return $true }
    }
    return $false
}

# 准备目标目录
New-Item -ItemType Directory -Force -Path $Dest | Out-Null

# 复制之前先直接清空目标目录里的所有内容（文件 + 子文件夹，含隐藏/只读项）
Write-Host "清空目标目录..." -ForegroundColor Yellow
$old = @(Get-ChildItem -Path $Dest -Force)
if ($old.Count -eq 0) {
    Write-Host "  目标目录本来就是空的" -ForegroundColor DarkGray
} else {
    foreach ($item in $old) {
        try {
            # 只读属性会导致删除失败，先尝试重置（失败也不影响后续 -Force 删除）
            try {
                if ($item.Attributes -band [IO.FileAttributes]::ReadOnly) {
                    $item.Attributes = $item.Attributes -bxor [IO.FileAttributes]::ReadOnly
                }
            } catch { }
            Remove-Item -LiteralPath $item.FullName -Recurse -Force
            Write-Host "  已删除: $($item.Name)" -ForegroundColor DarkGray
        } catch {
            Write-Host "  删除失败: $($item.FullName)  ->  $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

$files = Get-ChildItem -Path $src -Recurse -File -Force
$copied = 0
$skipped = 0
$errors = 0
$seen = @{}   # 检测同名冲突

foreach ($f in $files) {
    $rel = $f.FullName.Substring($src.Length).TrimStart('\','/')
    if (Test-Excluded $rel) { $skipped++; continue }
    # 平铺：所有文件直接放进目标根目录，不保留子文件夹
    $target = Join-Path $Dest $f.Name
    if ($seen.ContainsKey($f.Name)) {
        Write-Host "  同名冲突跳过: $rel（已存在 $($seen[$f.Name])）" -ForegroundColor Yellow
        $skipped++
        continue
    }
    $seen[$f.Name] = $rel
    try {
        Copy-Item -Path $f.FullName -Destination $target -Force
        $copied++
    } catch {
        Write-Host "  复制失败: $rel  ->  $($_.Exception.Message)" -ForegroundColor Red
        $errors++
    }
}

Write-Host ""
Write-Host "================ 完成 ================" -ForegroundColor Cyan
Write-Host "  复制文件 : $copied"
Write-Host "  已排除   : $skipped"
Write-Host "  失败     : $errors"
Write-Host "  目标目录 : $Dest"

if ($errors -gt 0) { exit 1 }

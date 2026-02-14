# Msgify Lite Auto-Installer (Windows)

$REPO = "miangee21/Msgify-Lite"
$VERSION = "0.1.1"

Write-Host "🚀 Installing Msgify Lite v$VERSION..." -ForegroundColor Green

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  Please run PowerShell as Administrator" -ForegroundColor Yellow
    exit 1
}

# Download MSI installer
$msiUrl = "https://github.com/$REPO/releases/download/v$VERSION/Msgify_${VERSION}_x64_en-US.msi"
$msiPath = "$env:TEMP\Msgify_${VERSION}_x64_en-US.msi"

Write-Host "📦 Downloading installer..." -ForegroundColor Cyan
Invoke-WebRequest -Uri $msiUrl -OutFile $msiPath

Write-Host "📦 Installing Msgify Lite..." -ForegroundColor Cyan
Start-Process msiexec.exe -ArgumentList "/i `"$msiPath`" /quiet" -Wait

# Cleanup
Remove-Item $msiPath

Write-Host "✅ Msgify Lite installed successfully!" -ForegroundColor Green
Write-Host "Find it in Start Menu: Msgify" -ForegroundColor White
$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Contact Management System - Docker Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Docker
Write-Host "Checking Docker..." -ForegroundColor Yellow

docker info | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker Desktop is not running." -ForegroundColor Red
    Write-Host "Please start Docker Desktop and run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host "Docker is running." -ForegroundColor Green

# Create .env if it does not exist
if (-not (Test-Path ".env")) {

    Write-Host ""
    Write-Host "Creating local .env file..." -ForegroundColor Yellow

    # Generate a strong random SQL Server password
    $bytes = New-Object byte[] 24
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    $rng.Dispose()

    $randomPart = [Convert]::ToBase64String($bytes)
    $randomPart = $randomPart.Replace("+", "A")
    $randomPart = $randomPart.Replace("/", "B")
    $randomPart = $randomPart.Replace("=", "C")

    $sqlPassword = "Cm_${randomPart}9!"

    # Generate a Base64 JWT secret
$jwtBytes = New-Object byte[] 32
$jwtRng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$jwtRng.GetBytes($jwtBytes)
$jwtRng.Dispose()

$jwtSecret = [Convert]::ToBase64String($jwtBytes)

$envContent = @"
MSSQL_SA_PASSWORD=$sqlPassword
JWT_SECRET=$jwtSecret
JWT_EXPIRATION_MS=3600000
"@
    Set-Content -Path ".env" -Value $envContent -Encoding UTF8

    Write-Host "Local .env created successfully." -ForegroundColor Green
}
else {
    Write-Host ""
    Write-Host ".env already exists. Keeping existing configuration." -ForegroundColor Green
}

Write-Host ""
Write-Host "Starting Contact Management System..." -ForegroundColor Yellow
Write-Host ""

docker compose up --build
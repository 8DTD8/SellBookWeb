# Kiểm tra nhanh sau khi deploy Render (chạy tay trên Windows PowerShell).
# Ví dụ:
#   .\scripts\smoke-render.ps1 -ApiBaseUrl "https://sellbook-api.onrender.com/api" -StaticUrl "https://sellbook-web.onrender.com"

param(
    [Parameter(Mandatory = $true)]
    [string] $ApiBaseUrl,
    [Parameter(Mandatory = $false)]
    [string] $StaticUrl = ""
)

$ErrorActionPreference = "Stop"
$health = $ApiBaseUrl.TrimEnd("/") + "/health"
Write-Host "GET $health"
$r = Invoke-WebRequest -Uri $health -UseBasicParsing -TimeoutSec 120
Write-Host "Status:" $r.StatusCode
Write-Host "Body:" $r.Content
if ($StaticUrl) {
    Write-Host "GET $StaticUrl"
    $s = Invoke-WebRequest -Uri $StaticUrl -UseBasicParsing -TimeoutSec 120
    Write-Host "Static status:" $s.StatusCode
}

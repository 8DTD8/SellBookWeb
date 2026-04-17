# Validate MongoDB URI string format before pasting into Render (does not connect to cluster).
# Example: .\scripts\check-mongodb-uri-format.ps1 -Uri "mongodb+srv://user:pass@cluster/bookstore?..."

param(
    [Parameter(Mandatory = $true)]
    [string] $Uri
)

if ($Uri -match '^(mongodb(\+srv)?://)') {
    Write-Host "OK: URI prefix looks valid (mongodb:// or mongodb+srv://)."
    exit 0
}
Write-Error "URI must start with mongodb:// or mongodb+srv://"
exit 1

# Kiểm tra định dạng chuỗi MongoDB URI (Atlas hoặc local) trước khi dán vào Render.
# Không kết nối tới cluster — chỉ validate pattern.
# Ví dụ: .\scripts\check-mongodb-uri-format.ps1 -Uri "mongodb+srv://user:pass@cluster/bookstore?..."

param(
    [Parameter(Mandatory = $true)]
    [string] $Uri
)

if ($Uri -match '^(mongodb(\+srv)?://)') {
    Write-Host "OK: URI có vẻ hợp lệ (bắt đầu bằng mongodb:// hoặc mongodb+srv://)."
    exit 0
}
Write-Error "URI phải bắt đầu bằng mongodb:// hoặc mongodb+srv://"
exit 1

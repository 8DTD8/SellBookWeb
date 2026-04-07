// Global frontend runtime configuration.
// Local: giữ nguyên placeholder __SELLBOOK_API_BASE__ → dùng http://localhost:8080/api
// Render Static Site: buildCommand chạy render-build.sh và PUBLIC_API_URL (URL backend + /api)
(function () {
    var _api = '__SELLBOOK_API_BASE__';
    var base = (_api === '__SELLBOOK_API_BASE__') ? 'http://localhost:8080/api' : _api;
    window.WEB_CONFIG = {
        API_BASE_URL: base
    };
})();

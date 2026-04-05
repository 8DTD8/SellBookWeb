// Safe HTML helpers for rendering API data in templates.
(function attachSafeHtmlHelpers(globalScope) {
    function escape(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function escapeJsString(value) {
        return String(value ?? '')
            .replace(/\\/g, '\\\\')
            .replace(/'/g, "\\'")
            .replace(/\"/g, '\\"')
            .replace(/\r/g, '\\r')
            .replace(/\n/g, '\\n')
            .replace(/\t/g, '\\t');
    }

    function sanitizeUrl(url) {
        const normalized = String(url ?? '').trim();
        if (!normalized) {
            return '';
        }

        const safeProtocols = ['http://', 'https://', '/'];
        const hasSafeProtocol = safeProtocols.some((prefix) => normalized.startsWith(prefix));
        return hasSafeProtocol ? normalized : '';
    }

    globalScope.SafeHtml = {
        escape,
        escapeJsString,
        sanitizeUrl
    };
})(window);

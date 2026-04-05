// Lightweight action router for delegated UI events.
(function attachActionRouter(globalScope) {
    function createRouter(actionMap) {
        return function dispatch(actionName, payload) {
            const handler = actionMap[actionName];
            if (typeof handler !== 'function') {
                return false;
            }
            handler(payload || {});
            return true;
        };
    }

    globalScope.ActionRouter = {
        createRouter
    };
})(window);

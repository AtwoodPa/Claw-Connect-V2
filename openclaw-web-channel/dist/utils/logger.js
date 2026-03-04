const fallbackLogger = {
    child(name) {
        return this;
    },
    debug(message, meta) {
        console.debug(message, meta ?? '');
    },
    info(message, meta) {
        console.info(message, meta ?? '');
    },
    warn(message, meta) {
        console.warn(message, meta ?? '');
    },
    error(message, meta) {
        console.error(message, meta ?? '');
    }
};
export function resolveLogger(logger) {
    if (!logger) {
        return fallbackLogger;
    }
    if (typeof logger.child !== 'function') {
        return fallbackLogger;
    }
    return logger;
}
//# sourceMappingURL=logger.js.map
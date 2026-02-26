import Logger from "../logging/logger.js";

export default function requestLoggerMiddleware(logger: Logger) {
    return (req: any, res: any, next: any) => {
        req.startTime = Date.now();
        res.on('finish', () => {
            const originalUrl = req.originalUrl || "";
            const safeUrl = originalUrl.replace(/state=[^&]+/i, "state=<redacted>");
            logger.info(`Request completed`, {
                method: req.method,
                url: safeUrl,
                statusCode: res.statusCode,
                durationMs: Date.now() - req.startTime
            });
        });
        next();
    };
}
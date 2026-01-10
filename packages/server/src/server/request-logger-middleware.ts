import Logger from "../logging/logger.js";

export default function requestLoggerMiddleware(logger: Logger) {
    return (req: any, res: any, next: any) => {
        req.startTime = Date.now();
        res.on('finish', () => {
            logger.info(`Request completed`, {
                method: req.method,
                url: req.originalUrl,
                statusCode: res.statusCode,
                durationMs: Date.now() - req.startTime
            });
        });
        next();
    };
}
import { injectable } from "inversify";
import winston from "winston";
import Logger from "./logger.js";

@injectable()
export class WinstonLogger implements Logger {

    logger: winston.Logger;

    constructor() {
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
            ),
            transports: [
                new winston.transports.Console()
            ]
        });
    }

    info(message: string, ...args: any[]): void {
        this.logger.info(message, ...args);
    }

    warn(message: string, ...args: any[]): void {
        this.logger.warn(message, ...args);
    }

    error(message: string, ...args: any[]): void {
        this.logger.error(message, ...args);
    }
    
    debug(message: string, ...args: any[]): void {
        this.logger.debug(message, ...args);
    }

    silence(): void {
        this.logger.transports.forEach((t) => t.silent = true);
    }
}
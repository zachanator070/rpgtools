import {inject, injectable} from "inversify";
import crypto from "crypto";
import Logger from "../logging/logger.js";
import { INJECTABLE_TYPES } from "../di/injectable-types.js";

@injectable()
export class ServerProperties {
    accessTokenSecret: string = null;
    refreshTokenSecret: string = null;
    ssoStateSecret: string = null;
    googleClientId: string = process.env.GOOGLE_CLIENT_ID || null;
    googleClientSecret: string = process.env.GOOGLE_CLIENT_SECRET || null;

    ACCESS_TOKEN_LENGTH = 16;

    logger: Logger;

    constructor(@inject(INJECTABLE_TYPES.Logger) logger: Logger) {

        this.logger = logger;

        if(process.env.ACCESS_TOKEN_SECRET){
            this.accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
        } else {
            this.logger.warn(
                "environment variable ACCESS_TOKEN_SECRET is not set, restarting server will log out all users"
            );
            const bytes = crypto.randomBytes(this.ACCESS_TOKEN_LENGTH);
            this.accessTokenSecret = String.fromCharCode(...new Uint8Array(bytes));
        }


        if (process.env.REFRESH_TOKEN_SECRET) {
            this.refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
        } else {
            this.logger.warn(
                "environment variable REFRESH_TOKEN_SECRET is not set, restarting server will log out all users"
            );
            const bytes = crypto.randomBytes(this.ACCESS_TOKEN_LENGTH);
            this.refreshTokenSecret = String.fromCharCode(...new Uint8Array(bytes));
        }

        if (process.env.SSO_STATE_SECRET) {
            this.ssoStateSecret = process.env.SSO_STATE_SECRET;
        } else {
            this.logger.warn(
                "environment variable SSO_STATE_SECRET is not set, restarting server may invalidate in-flight SSO registration state"
            );
            const bytes = crypto.randomBytes(this.ACCESS_TOKEN_LENGTH);
            this.ssoStateSecret = String.fromCharCode(...new Uint8Array(bytes));
        }

    }

    isSsoConfigured = (): boolean => {
        return !!(this.googleClientId && this.googleClientSecret);
    };

}
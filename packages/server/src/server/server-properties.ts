import {injectable} from "inversify";
import crypto from "crypto";

@injectable()
export class ServerProperties {
    accessTokenSecret: string = null;
    refreshTokenSecret: string = null;

    ACCESS_TOKEN_LENGTH = 16;

    constructor() {

        if(process.env.ACCESS_TOKEN_SECRET){
            this.accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
        } else {
            console.warn(
                "environment variable ACCESS_TOKEN_SECRET is not set, restarting server will log out all users"
            );
            const bytes = crypto.randomBytes(this.ACCESS_TOKEN_LENGTH);
            this.accessTokenSecret = String.fromCharCode(...new Uint8Array(bytes));
        }


        if (process.env.REFRESH_TOKEN_SECRET) {
            this.refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
        } else {
            console.log(
                "environment variable REFRESH_TOKEN_SECRET is not set, restarting server will log out all users"
            );
            const bytes = crypto.randomBytes(this.ACCESS_TOKEN_LENGTH);
            this.refreshTokenSecret = String.fromCharCode(...new Uint8Array(bytes));
        }

    }

}
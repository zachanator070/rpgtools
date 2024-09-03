import express from "express";
import {CookieManager} from "../types";
import {ExpressCookieManager} from "../server/express-cookie-manager";
import {ExpressSessionContextFactory} from "../server/express-session-context-factory";

export const expressRequestContextMiddleware = (contextFactory: ExpressSessionContextFactory) => async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
    const cookieManager: CookieManager = new ExpressCookieManager(res);

    const refreshToken: string = req?.cookies["refreshToken"];
    const accessToken: string = req?.cookies["accessToken"];
    req.app.locals.context = await contextFactory.create(accessToken, refreshToken, cookieManager);
    next();
}
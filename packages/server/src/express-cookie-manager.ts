import { CookieManager } from "./types";
import { Response } from "express";

export class ExpressCookieManager implements CookieManager {
	res: Response;

	constructor(res: Response) {
		this.res = res;
	}

	setCookie = (cookie: string, value: string, age: number): void => {
		this.res.cookie(cookie, value, {
			maxAge: age,
			sameSite: "none",
			secure: true
		});
	};

	clearCookie = (cookie: string): void => {
		this.res.clearCookie(cookie);
	};
}

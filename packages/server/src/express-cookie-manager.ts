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
			secure: false,
		});
	};

	clearCookie = (cookie: string): void => {
		this.res.clearCookie(cookie);
	};
}

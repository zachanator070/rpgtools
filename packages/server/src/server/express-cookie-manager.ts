import { CookieManager } from "../types.js";
import { Response } from "express";

export class ExpressCookieManager implements CookieManager {
	res: Response;

	constructor(res: Response) {
		this.res = res;
	}

	setCookie = (cookie: string, value: string, age: number): void => {
		this.res.cookie(cookie, value, {
			maxAge: age,
			httpOnly: true,
			path: "/",
		});
	};

	clearCookie = (cookie: string): void => {
		this.res.clearCookie(cookie);
	};

	getResponseCookie = (cookie: string): string | undefined => {
		// parse cookie from response headers
		const setCookieHeader = this.res.getHeader("Set-Cookie");
		if (setCookieHeader && Array.isArray(setCookieHeader)) {
			for (const header of setCookieHeader) {
				if (header.startsWith(`${cookie}=`)) {
					const cookieValue = header.split(";")[0].split("=")[1];
					return cookieValue;
				}
			}
		}
		return undefined;
	}
}

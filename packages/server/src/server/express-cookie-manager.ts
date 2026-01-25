import { CookieManager } from "../types.js";
import { Response } from "express";

export class ExpressCookieManager implements CookieManager {
	res: Response;

	constructor(res: Response) {
		this.res = res;
	}

	setCookie = (cookie: string, value: string, age: number): void => {
		// Build cookie string directly to avoid multiple Set-Cookie headers
		const cookieString = `${cookie}=${value}; Max-Age=${age / 1000}; Path=/; HttpOnly`;
		
		// Get existing cookies and filter out this cookie name to replace it
		const existingCookies = this.res.getHeader('Set-Cookie') as string[] | string | undefined;
		let cookieArray: string[] = [];
		
		if (existingCookies) {
			const cookies = Array.isArray(existingCookies) ? existingCookies : [existingCookies];
			cookieArray = cookies.filter(c => !c.startsWith(`${cookie}=`));
		}
		
		cookieArray.push(cookieString);
		this.res.setHeader('Set-Cookie', cookieArray);
	};

	clearCookie = (cookie: string): void => {
		// Get existing cookies and filter out this cookie name
		const existingCookies = this.res.getHeader('Set-Cookie') as string[] | string | undefined;
		
		if (existingCookies) {
			const cookies = Array.isArray(existingCookies) ? existingCookies : [existingCookies];
			const filtered = cookies.filter(c => !c.startsWith(`${cookie}=`));
			
			if (filtered.length > 0) {
				this.res.setHeader('Set-Cookie', filtered);
			} else {
				this.res.removeHeader('Set-Cookie');
			}
		}
	};
}

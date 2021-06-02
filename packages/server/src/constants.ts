export type CookieConstants = {
	string: string;
	ms: number;
};

export const ACCESS_TOKEN: string = "accessToken";
export const REFRESH_TOKEN: string = "refreshToken";

export const ACCESS_TOKEN_MAX_AGE: CookieConstants = { string: "1m", ms: 1000 * 60 };
export const REFRESH_TOKEN_MAX_AGE: CookieConstants = { string: "1d", ms: 1000 * 60 * 60 * 24 };

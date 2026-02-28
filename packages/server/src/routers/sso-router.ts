import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import Logger from "../logging/logger.js";
import {
	ACCESS_TOKEN,
	ACCESS_TOKEN_MAX_AGE,
	AuthenticationService,
	REFRESH_TOKEN,
	REFRESH_TOKEN_MAX_AGE,
} from "../services/authentication-service.js";
import { ServerConfigService } from "../services/server-config-service.js";
import { ServerProperties } from "../server/server-properties.js";

export const createSsoRouter = (
	logger: Logger,
	authenticationService: AuthenticationService,
	serverConfigService: ServerConfigService,
	serverProperties: ServerProperties
): Router => {
	const router = Router();

	const getErrorMessage = (error: unknown, fallbackMessage: string): string => {
		if (error instanceof Error && error.message) {
			return error.message;
		}
		return fallbackMessage;
	};

	const redirectToUiWithError = (res: Response, errorMessage: string): void => {
		const params = new URLSearchParams({
			error: errorMessage,
		});
		res.redirect(`/ui?${params.toString()}`);
	};

	const buildCallbackUri = (req: Request, callbackPath: string): string => {
		const host = req.get("host");
		if (!host) {
			throw new Error("Missing host header");
		}
		return `${req.protocol}://${host}${callbackPath}`;
	};

	const validateInternalRedirectPath = (redirectPath: unknown, fallbackPath: string): string => {
		if (!redirectPath) {
			return fallbackPath;
		}

		if (typeof redirectPath !== "string") {
			throw new Error("Invalid redirect URL");
		}

		const trimmedPath = redirectPath.trim();
		if (!trimmedPath) {
			return fallbackPath;
		}

		if (!trimmedPath.startsWith("/") || trimmedPath.startsWith("//") || trimmedPath.includes("://")) {
			throw new Error("Invalid redirect URL");
		}

		if (!trimmedPath.startsWith("/auth/sso/")) {
			throw new Error("Invalid redirect URL");
		}

		return trimmedPath;
	};

	router.get("/start", async (req: Request, res: Response) => {
		if (!serverProperties.isSsoConfigured()) {
			res.status(404).send("SSO is not configured");
			return;
		}

		const callbackUri = buildCallbackUri(req, "/auth/sso/login");

		const stateToken = jwt.sign(
			{
				jti: uuidv4(),
			},
			serverProperties.ssoStateSecret,
			{ expiresIn: "5m" }
		);

		const params = new URLSearchParams({
			client_id: serverProperties.googleClientId,
			redirect_uri: callbackUri,
			response_type: "code",
			scope: "openid email profile",
			state: stateToken,
			prompt: "select_account",
		});

		res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
	});

	router.post("/start", async (req: Request, res: Response) => {
		if (!serverProperties.isSsoConfigured()) {
			res.status(404).json({ error: "SSO is not configured" });
			return;
		}

		try {
			const callbackPath = validateInternalRedirectPath(req.body?.redirectUrl, "/auth/sso/register");
			const callbackUri = buildCallbackUri(req, callbackPath);
			const username = authenticationService.validateAndNormalizeUsername(req.body?.username || "");

			const stateToken = jwt.sign(
				{
					username,
					redirectPath: callbackPath,
					jti: uuidv4(),
				},
				serverProperties.ssoStateSecret,
				{ expiresIn: "5m" }
			);

			const params = new URLSearchParams({
				client_id: serverProperties.googleClientId,
				redirect_uri: callbackUri,
				response_type: "code",
				scope: "openid email profile",
				state: stateToken,
				prompt: "select_account",
			});

			res.json({ redirectUrl: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}` });
		} catch (e) {
			logger.error("Error starting SSO", e);
			res.status(400).json({ error: "Could not start SSO flow" });
		}
	});

	router.get("/setup", async (req: Request, res: Response) => {
		if (!serverProperties.isSsoConfigured()) {
			res.status(404).send("SSO is not configured");
			return;
		}

		try {
			const callbackUri = buildCallbackUri(req, "/auth/sso/setup");
			const code = String(req.query.code || "");
			const state = String(req.query.state || "");
			if (!code || !state) {
				throw new Error("Missing code or state");
			}

			const decodedState = jwt.verify(state, serverProperties.ssoStateSecret) as {
				username?: string;
				redirectPath?: string;
				jti?: string;
			};

			if (!decodedState?.jti) {
				throw new Error("Invalid state token");
			}

			if (decodedState.redirectPath !== "/auth/sso/setup") {
				throw new Error("Invalid setup state");
			}

			const username = authenticationService.validateAndNormalizeUsername(decodedState.username || "");
			const email = await authenticationService.getSsoEmail(code, callbackUri);

			const sessionContext = req.app.locals.context;
			if (!sessionContext?.databaseContext || !sessionContext?.cookieManager) {
				throw new Error("Could not initialize session context");
			}

			await sessionContext.databaseContext.openTransaction(async () => {
				await serverConfigService.unlockServer(
					email,
					username,
					null,
					sessionContext.databaseContext,
				);

				const users = await sessionContext.databaseContext.userRepository.findByEmail(email);
				if (!users || users.length === 0) {
					throw new Error("Setup login failure: user not found");
				}

				const user = users[0];
				const tokens = await authenticationService.createTokens(user, user.tokenVersion, sessionContext.databaseContext);
				sessionContext.cookieManager.setCookie(ACCESS_TOKEN, tokens.accessToken, ACCESS_TOKEN_MAX_AGE.ms);
				sessionContext.cookieManager.setCookie(REFRESH_TOKEN, tokens.refreshToken, REFRESH_TOKEN_MAX_AGE.ms);
			});

			res.redirect("/ui");
		} catch (e: unknown) {
			logger.error("Error handling SSO setup callback", e);
			redirectToUiWithError(res, getErrorMessage(e, "SSO setup callback failed"));
		}
	});

	router.get("/register", async (req: Request, res: Response) => {
		if (!serverProperties.isSsoConfigured()) {
			res.status(404).send("SSO is not configured");
			return;
		}

		try {
			const callbackUri = buildCallbackUri(req, "/auth/sso/register");
			const code = String(req.query.code || "");
			const state = String(req.query.state || "");
			if (!code || !state) {
				throw new Error("Missing code or state");
			}

			const sessionContext = req.app.locals.context;
			if (!sessionContext?.databaseContext || !sessionContext?.cookieManager) {
				throw new Error("Could not initialize session context");
			}

			await sessionContext.databaseContext.openTransaction(async () => {
				await authenticationService.registerFromSso(
					code,
					state,
					callbackUri,
					sessionContext.cookieManager,
					sessionContext.databaseContext,
				);
			});

			res.redirect("/ui");
		} catch (e: unknown) {
			logger.error("Error handling SSO callback", e);
			redirectToUiWithError(res, getErrorMessage(e, "SSO callback failed"));
		}
	});

	router.get("/login", async (req: Request, res: Response) => {
		if (!serverProperties.isSsoConfigured()) {
			res.status(404).send("SSO is not configured");
			return;
		}
		try {
			const callbackUri = buildCallbackUri(req, "/auth/sso/login");
			const code = String(req.query.code || "");
			const state = String(req.query.state || "");
			if (!code || !state) {
				throw new Error("Missing code or state");
			}

			const sessionContext = req.app.locals.context;
			if (!sessionContext?.databaseContext || !sessionContext?.cookieManager) {
				throw new Error("Could not initialize session context");
			}

			await sessionContext.databaseContext.openTransaction(async () => {
				await authenticationService.loginSso(
					code,
					state,
					callbackUri,
					sessionContext.cookieManager,
					sessionContext.databaseContext
				);
			});

			res.redirect("/ui");
		} catch (e: unknown) {
			logger.error("Error handling SSO login callback", e);
			redirectToUiWithError(res, getErrorMessage(e, "SSO login callback failed"));
		}
	});

	return router;
};

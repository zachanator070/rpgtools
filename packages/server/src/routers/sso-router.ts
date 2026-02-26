import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import Logger from "../logging/logger.js";
import { AuthenticationService } from "../services/authentication-service.js";
import { ServerProperties } from "../server/server-properties.js";

export const createSsoRouter = (
	logger: Logger,
	authenticationService: AuthenticationService,
	serverProperties: ServerProperties
): Router => {
	const router = Router();

	const buildCallbackUri = (req: Request, callbackPath: string): string => {
		const host = req.get("host");
		if (!host) {
			throw new Error("Missing host header");
		}
		return `${req.protocol}://${host}${callbackPath}`;
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
			const callbackUri = buildCallbackUri(req, "/auth/sso/register");
			const username = authenticationService.validateAndNormalizeUsername(req.body?.username || "");

			const stateToken = jwt.sign(
				{
					username,
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
		} catch (e) {
			logger.error("Error handling SSO callback", e);
			res.status(400).send("SSO callback failed");
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
		} catch (e) {
			logger.error("Error handling SSO login callback", e);
			res.status(400).send("SSO login callback failed");
		}
	});

	return router;
};

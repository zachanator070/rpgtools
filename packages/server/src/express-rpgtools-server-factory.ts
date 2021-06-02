import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { ImageRouter } from "./routers/image-router";
import { ModelRouter } from "./routers/model-router";
import ExportRouter from "./routers/export-router";
import path from "path";
import { graphqlUploadExpress } from "graphql-upload";
import http from "http";
import { ExpressRPGToolsServer, RPGToolsServer } from "./express-rpgtools-server";
import { GraphqlServerFactory } from "./graphql-server-factory";
import { ApolloServer } from "apollo-server-express";

export class ExpressRpgToolsServerFactory {
	gqlServerFactory = new GraphqlServerFactory();

	create = (): RPGToolsServer => {
		const gqlServer: ApolloServer = this.gqlServerFactory.create();

		const server = express();
		const httpServer = http.createServer(server);
		gqlServer.installSubscriptionHandlers(httpServer);

		const rpgToolsServer: ExpressRPGToolsServer = new ExpressRPGToolsServer(
			httpServer,
			server,
			gqlServer
		);

		server.use(bodyParser.json());
		server.use(morgan("tiny"));

		server.use(cookieParser());

		server.get("*.js", function (req, res, next) {
			req.url = req.url + ".gz";
			res.set("Content-Encoding", "gzip");
			res.set("Content-Type", "text/javascript");
			next();
		});
		server.get("*.css", function (req, res, next) {
			req.url = req.url + ".gz";
			res.set("Content-Encoding", "gzip");
			res.set("Content-Type", "text/css");
			next();
		});
		server.get("*favicon.ico", function (req, res, next) {
			req.url = "/favicon.ico";
			next();
		});

		server.use("/images", ImageRouter);
		server.use("/models", ModelRouter);
		server.use("/export", ExportRouter);

		server.get("*", (req, res, next) => {
			const needsSetup = rpgToolsServer.serverNeedsSetup();
			if (needsSetup) {
				if (
					[
						"/api",
						"/ui/setup",
						"/app.bundle.js",
						"/app.css",
						"/app.bundle.js.gz",
						"/app.css.gz",
						"favicon.ico",
					].includes(req.url)
				) {
					return next();
				}
				return res.redirect(302, "/ui/setup");
			} else {
				return next();
			}
		});

		server.get("/ui*", (req, res) => {
			return res.sendFile(path.resolve(__dirname, "../dist", "index.html"));
		});

		server.use(express.static("dist"));
		server.use(express.static("src/static-assets"));
		server.use(graphqlUploadExpress());

		gqlServer.applyMiddleware({ app: server, path: "/api" });

		return rpgToolsServer;
	};
}

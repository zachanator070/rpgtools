import express from "express";
import bodyParser from "body-parser";
import gqlServer from "./gql-server";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import mongoose from "mongoose";
import { defaultSeeders } from "./default-seeders";
import path from "path";
import { ImageRouter } from "./routers/image-router";
import { checkConfig, serverNeedsSetup } from "./server-needs-setup";
import crypto from "crypto";
import * as http from "http";
import { ServerConfig } from "./models/server-config";
import { ModelRouter } from "./routers/model-router";
import ExportRouter from "./routers/export-router";
import { graphqlUploadExpress } from "graphql-upload";

const mongodb_host = process.env.MONGODB_HOST || "mongodb";
const mongodb_db_name = process.env.MONGODB_DB_NAME || "rpgtools";

mongoose
  .connect(`mongodb://${mongodb_host}/${mongodb_db_name}`, {
    useNewUrlParser: true,
  })
  .then(async () => {
    console.log(
      `Connected to mongodb at mongodb://${mongodb_host}/${mongodb_db_name}`
    );
    await defaultSeeders();
    await createServer();
  });

mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);

const createServer = async () => {
  const server = express();

  server.use(bodyParser.json());
  server.use(morgan("tiny"));

  server.use(cookieParser());

  await checkConfig();
  const serverConfig = await ServerConfig.findOne();
  if (serverNeedsSetup()) {
    console.warn(
      `Server needs configuration! Use unlock code ${serverConfig.unlockCode} to unlock`
    );
  }

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
    const needsSetup = serverNeedsSetup();
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
    return res.sendFile(path.resolve(__dirname, "../../dist", "index.html"));
  });

  server.use(express.static("dist"));
  server.use(express.static("src/static-assets"));
  server.use(graphqlUploadExpress());

  gqlServer.applyMiddleware({ app: server, path: "/api" });

  if (!process.env.ACCESS_TOKEN_SECRET) {
    console.warn(
      "environment variable ACCESS_TOKEN_SECRET is not set, restarting server will log out all users"
    );
    process.env.ACCESS_TOKEN_SECRET = crypto.randomBytes(2048);
  }

  if (!process.env.REFRESH_TOKEN_SECRET) {
    console.log(
      "environment variable REFRESH_TOKEN_SECRET is not set, restarting server will log out all users"
    );
    process.env.REFRESH_TOKEN_SECRET = crypto.randomBytes(2048);
  }

  const port = process.env.SERVER_PORT || 3000;

  const httpServer = http.createServer(server);
  gqlServer.installSubscriptionHandlers(httpServer);

  httpServer.listen(port, () => {
    console.log(
      `The server is running and listening at http://localhost:${port}`
    );
  });
};

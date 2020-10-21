import express from "express";
import { gridFsRedisMiddleware } from "./grid-fs-redis-middleware";

let ModelRouter = express.Router();

ModelRouter.use("/:filename", gridFsRedisMiddleware("filename"));

export { ModelRouter };

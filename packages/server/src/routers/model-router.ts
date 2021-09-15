import express from "express";
import { gridFsRedisMiddleware } from "../middleware/grid-fs-redis-middleware";

let ModelRouter = express.Router();

ModelRouter.use("/:id", gridFsRedisMiddleware("id"));

export { ModelRouter };

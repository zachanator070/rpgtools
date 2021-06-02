import express from "express";
import { gridFsRedisMiddleware } from "../middleware/grid-fs-redis-middleware";

let ImageRouter = express.Router();

ImageRouter.use("/:id", gridFsRedisMiddleware("id"));

export { ImageRouter };

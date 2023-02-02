import express from "express";
import { redisMiddleware } from "../middleware/redis-middleware";

let ModelRouter = express.Router();

ModelRouter.use("/:id", redisMiddleware("id"));

export { ModelRouter };

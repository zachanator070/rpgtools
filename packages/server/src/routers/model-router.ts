import express from "express";
import { redisMiddleware } from "../middleware/redis-middleware";

const ModelRouter = express.Router();

ModelRouter.use("/:id", redisMiddleware("id"));

export { ModelRouter };

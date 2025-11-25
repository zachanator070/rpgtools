import express from "express";
import { redisMiddleware } from "../middleware/redis-middleware.js";

let ModelRouter = express.Router();

ModelRouter.use("/:id", redisMiddleware("id"));

export { ModelRouter };

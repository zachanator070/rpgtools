import {Router} from "express";
import { redisMiddleware } from "../middleware/redis-middleware.js";

let ImageRouter = Router();

ImageRouter.use("/:id", redisMiddleware("id"));

export { ImageRouter };

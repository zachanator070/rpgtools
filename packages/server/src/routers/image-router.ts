import {Router} from "express";
import { redisMiddleware } from "../middleware/redis-middleware.js";

const ImageRouter = Router();

ImageRouter.use("/:id", redisMiddleware("id"));

export { ImageRouter };

import {Router} from "express";
import { gridFsRedisMiddleware } from "../middleware/grid-fs-redis-middleware";

let ImageRouter = Router();

ImageRouter.use("/:id", gridFsRedisMiddleware("id"));

export { ImageRouter };

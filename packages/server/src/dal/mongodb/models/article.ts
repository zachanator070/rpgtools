import { Schema } from "mongoose";
import { WikiPageModel } from "./wiki-page";
import { ARTICLE } from "../../../../../common/src/type-constants";
import { ArticleDocument } from "../../../types";

const articleSchema = new Schema<ArticleDocument>();

export const ArticleModel = WikiPageModel.discriminator<ArticleDocument>(ARTICLE, articleSchema);

import { Schema } from "mongoose";
import { WikiPageModel, WikiPageDocument } from "./wiki-page";
import { ARTICLE } from "../../../../../common/src/type-constants";

export class ArticleDocument extends WikiPageDocument {}

const articleSchema = new Schema<ArticleDocument>();

export const ArticleModel = WikiPageModel.discriminator<ArticleDocument>(ARTICLE, articleSchema);

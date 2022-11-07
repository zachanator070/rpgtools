import mongoose from "mongoose";
import { WikiPageModel } from "./wiki-page";
import { ARTICLE } from "@rpgtools/common/src/type-constants";
import { WikiPageDocument } from "../../../types";

export interface ArticleDocument extends WikiPageDocument {
	type: string;
	name: string;
	world: string;
	coverImage?: string;
	contentId?: string;
}

const articleSchema = new mongoose.Schema<ArticleDocument, mongoose.Model<ArticleDocument>>();

export const ArticleModel = WikiPageModel.discriminator<
	ArticleDocument,
	mongoose.Model<ArticleDocument>
>(ARTICLE, articleSchema);

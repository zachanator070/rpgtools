import {Model, Schema} from "mongoose";
import {WikiPageModel} from "./wiki-page";
import {ARTICLE} from "../../../../../common/src/type-constants";
import {WikiPageDocument} from "../../../types";

export interface ArticleDocument extends WikiPageDocument {

    type: string;
    name: string;
    world: Schema.Types.ObjectId;
    coverImage?: Schema.Types.ObjectId;
    contentId?: Schema.Types.ObjectId;
}

const articleSchema = new Schema<ArticleDocument, Model<ArticleDocument>>();

export const ArticleModel = WikiPageModel.discriminator<ArticleDocument, Model<ArticleDocument>>(ARTICLE, articleSchema);

import mongoose from "mongoose";
import { WikiPage } from "./wiki-page";
import { ARTICLE } from "@rpgtools/common/src/type-constants";

const Schema = mongoose.Schema;

const articleSchema = new Schema();

export const Article = WikiPage.discriminator(ARTICLE, articleSchema);

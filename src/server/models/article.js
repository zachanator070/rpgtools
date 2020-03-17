import mongoose from 'mongoose';
import {WikiPage} from "./wiki-page";
import {ARTICLE} from "../../type-constants";

const Schema = mongoose.Schema;

const articleSchema = new Schema({
	type: {type: String, default: ARTICLE},
});

export const Article = WikiPage.discriminator(ARTICLE, articleSchema);
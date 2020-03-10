import mongoose from 'mongoose';
import {WikiPage} from "./wiki-page";
import mongooseAutopopulate from "mongoose-autopopulate";
import {ARTICLE} from "../../type-constants";

const Schema = mongoose.Schema;

const articleSchema = new Schema({
	type: {type: String, default: ARTICLE},
});

articleSchema.plugin(mongooseAutopopulate);

export const Article = WikiPage.discriminator(ARTICLE, articleSchema);
import mongoose from 'mongoose';
import {WikiPage} from "./wiki-page";
import mongooseAutopopulate from "mongoose-autopopulate";
import {userHasPermission} from "../authorization-helpers";
import {WIKI_READ, WIKI_READ_ALL, WIKI_RW, WIKI_RW_ALL} from "../../permission-constants";
import {PLACE} from "../../wiki-page-types";

const Schema = mongoose.Schema;

const placeSchema = new Schema({
	mapImage: {
		type: mongoose.Schema.ObjectId,
		ref: 'Image',
		autopopulate: true
	},
	type: {type: String, default: PLACE},
});

placeSchema.plugin(mongooseAutopopulate);

export const Place = WikiPage.discriminator(PLACE, placeSchema);
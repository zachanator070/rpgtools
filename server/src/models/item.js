import mongoose from 'mongoose';
import {ITEM, MODEL, PERSON} from "../../../common/src/type-constants";
import {WikiPage} from "./wiki-page";

const Schema = mongoose.Schema;

const itemSchema = new Schema({
    model: {
        type: mongoose.Schema.ObjectId,
        ref: MODEL,
    }
});

export const Item = WikiPage.discriminator(ITEM, itemSchema);
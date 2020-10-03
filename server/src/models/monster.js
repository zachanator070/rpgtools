import mongoose from 'mongoose';
import {MODEL, MONSTER,} from "../../../common/src/type-constants";
import {WikiPage} from "./wiki-page";

const Schema = mongoose.Schema;

const monsterSchema = new Schema({
    model: {
        type: mongoose.Schema.ObjectId,
        ref: MODEL,
    }
});

export const Monster = WikiPage.discriminator(MONSTER, monsterSchema);
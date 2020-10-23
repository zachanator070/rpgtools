import mongoose from "mongoose";
import { MODEL, MONSTER } from "@rpgtools/common/src/type-constants";
import { WikiPage } from "./wiki-page";

const Schema = mongoose.Schema;

const monsterSchema = new Schema({
  model: {
    type: mongoose.Schema.ObjectId,
    ref: MODEL,
  },
  modelColor: {
    type: String,
  },
});

export const Monster = WikiPage.discriminator(MONSTER, monsterSchema);

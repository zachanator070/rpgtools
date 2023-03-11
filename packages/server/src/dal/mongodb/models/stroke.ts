import {MongoDBDocument} from "../../../types";
import {pathNode, PathNodeDocument} from "./game";
import mongoose, {ObjectId} from "mongoose";
import {v4} from "uuid";
import {GAME, STROKE} from "@rpgtools/common/src/type-constants";

const strokeSchema = new mongoose.Schema({
    path: [pathNode],
    color: {
        type: String,
    },
    size: Number,
    fill: Boolean,
    strokeType: {
        type: String,
        enum: ["circle", "square", "erase", "line"],
    },
    _id: {
        type: String,
        default: v4
    },
    game: {
        type: String,
        ref: GAME,
        index: true,
    }
});

export interface StrokeDocument extends MongoDBDocument {
    path: PathNodeDocument[];
    game: string | ObjectId;
    color: string;
    size: number;
    fill: boolean;
    strokeType: string;
}

export const StrokeModel = mongoose.model<StrokeDocument>(STROKE, strokeSchema);
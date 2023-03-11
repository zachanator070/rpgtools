import mongoose, {ObjectId} from "mongoose";
import {v4} from "uuid";
import {pathNode, PathNodeDocument} from "./game";
import {MongoDBDocument} from "../../../types";
import {FOG_STROKE, GAME} from "@rpgtools/common/src/type-constants";


const fogStrokeSchema = new mongoose.Schema({
    path: [pathNode],
    size: Number,
    strokeType: {
        type: String,
        enum: ["fog", "erase"],
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

export interface FogStrokeDocument extends MongoDBDocument {
    game: string | ObjectId;
    path: PathNodeDocument[];
    size: number;
    strokeType: string;
}

export const FogStrokeModel = mongoose.model<FogStrokeDocument>(FOG_STROKE, fogStrokeSchema);
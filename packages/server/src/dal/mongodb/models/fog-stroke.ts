import mongoose, {ObjectId} from "mongoose";
import {v4} from "uuid";
import {pathNode, PathNodeDocument} from "./game";
import {MongoDBDocument} from "../../../types";
import {FOG_STROKE} from "@rpgtools/common/src/type-constants";


const fogStrokeSchema = new mongoose.Schema({
    path: [pathNode],
    size: Number,
    type: {
        type: String,
        enum: ["fog", "erase"],
    },
    _id: {
        type: String,
        default: v4
    },
});

export interface FogStrokeDocument extends MongoDBDocument {
    game: string | ObjectId;
    path: PathNodeDocument[];
    size: number;
    strokeType: string;
}

export const FogStrokeModel = mongoose.model<FogStrokeDocument>(FOG_STROKE, fogStrokeSchema);
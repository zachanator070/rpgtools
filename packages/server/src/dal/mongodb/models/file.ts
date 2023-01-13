import {MongoDBDocument} from "../../../types";
import {ObjectId} from "mongoose";
import {Readable} from "stream";

export interface FileDocument extends MongoDBDocument {
    _id:  string,
    filename: string,
    readStream: Readable,
    mimeType: string
}
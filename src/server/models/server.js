import mongoose from 'mongoose';
import mongooseAutopopulate from 'mongoose-autopopulate';
import {SERVER} from "../../type-constants";

const Schema = mongoose.Schema;

const serverSchema = new Schema({

});

serverSchema.plugin(mongooseAutopopulate);

export const Server = mongoose.model(SERVER, serverSchema);

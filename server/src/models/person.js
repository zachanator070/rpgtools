import mongoose from 'mongoose';
import {WikiPage} from "./wiki-page";
import {PERSON} from "../../../common/src/type-constants";

const Schema = mongoose.Schema;

const personSchema = new Schema({});

export const Person = WikiPage.discriminator(PERSON, personSchema);
import mongoose from "mongoose";
import {v4} from "uuid";
import {MongoDBDocument} from "../../../types";
import {CALENDAR} from "@rpgtools/common/src/type-constants";

const calendarSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: v4
    },
});

interface CalendarDocument extends MongoDBDocument {

}

export const CalendarModel = mongoose.model<CalendarDocument>(CALENDAR, calendarSchema);
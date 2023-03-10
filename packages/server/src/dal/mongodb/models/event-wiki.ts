import {WikiPageDocument} from "../../../types";
import mongoose from "mongoose";
import {v4} from "uuid";
import {CALENDAR, EVENT_WIKI} from "@rpgtools/common/src/type-constants";
import {WikiPageModel} from "./wiki-page";

export interface EventDocument extends WikiPageDocument {
    calendar: string;
    age: number;
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
}

const eventSchema = new mongoose.Schema<EventDocument, mongoose.Model<EventDocument>>({
    _id: {
        type: String,
        default: v4
    },
    age: {
        type: Number,
        required: [true, "age field required"],
    },
    year: {
        type: Number,
        required: [true, "year field required"],
    },
    month: {
        type: Number,
        required: [true, "month field required"],
    },
    day: {
        type: Number,
        required: [true, "day field required"],
    },
    hour: {
        type: Number,
        required: [true, "hour field required"],
    },
    minute: {
        type: Number,
        required: [true, "minute field required"],
    },
    second: {
        type: Number,
        required: [true, "second field required"],
    },
    calendar: {
        type: String,
        ref: CALENDAR
    }
});

export const EventWikiModel = WikiPageModel.discriminator<EventDocument, mongoose.Model<EventDocument>>(
    EVENT_WIKI,
    eventSchema
);
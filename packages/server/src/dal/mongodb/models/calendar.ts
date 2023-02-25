import mongoose from "mongoose";
import {v4} from "uuid";
import {MongoDBDocument, PermissionControlledDocument} from "../../../types";
import {CALENDAR, WORLD} from "@rpgtools/common/src/type-constants";

const dayOfTheWeekSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: v4
    },
    name: {
        type: String,
        required: [true, "name required"],
    },
});

const monthSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: v4
    },
    name: {
        type: String,
        required: [true, "name required"],
    },
    numDays: {
        type: Number,
        required: [true, "numDays required"],
    }
});

const ageSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: v4
    },
    name: {
        type: String,
        required: [true, "name required"],
    },
    numYears: {
        type: Number,
        required: [true, "numYears required"],
    },
    months: [monthSchema],
    daysOfTheWeek: [dayOfTheWeekSchema]
});

const calendarSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: v4
    },
    world: {
        type: String,
        ref: WORLD,
        required: [true, "worldId required"],
    },
    name: {
        type: String,
        required: [true, "name required"],
    },
    ages: [ageSchema]
});

export interface CalendarDocument extends MongoDBDocument, PermissionControlledDocument {
    world: string;
    name: string;
    ages: AgeDocument[];
}

export interface AgeDocument extends MongoDBDocument {
    name: string;
    numYears: number;
    months: MonthDocument[];
    daysOfTheWeek: DayOfTheWeekDocument[];
}

export interface MonthDocument extends MongoDBDocument {
    name: string;
    numDays: number;
}

export interface DayOfTheWeekDocument extends MongoDBDocument {
    name: string;
}

export const CalendarModel = mongoose.model<CalendarDocument>(CALENDAR, calendarSchema);
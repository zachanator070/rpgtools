import mongoose from "mongoose";
import {ALL_PERMISSIONS} from "@rpgtools/common/src/permission-constants";
import {ROLE, USER} from "@rpgtools/common/src/type-constants";
import {User} from "../../../domain-entities/user";
import {Role} from "../../../domain-entities/role";
import {MongoDBDocument} from "../../../types";
import {v4} from 'uuid';


export interface AclEntryDocument extends MongoDBDocument {
    permission: string;
    principal: string;
    principalType: "User" | "Role";
}

export const AclEntry = new mongoose.Schema({
    _id: {
        type: String,
        default: v4
    },
    permission: {
        type: String,
        required: true,
        enum: ALL_PERMISSIONS,
        index: true,
    },
    principal: {
        type: String,
        required: true,
        refPath: "principalType",
        index: true,
    },
    principalType: {
        type: String,
        required: true,
        enum: [USER, ROLE],
    },
});
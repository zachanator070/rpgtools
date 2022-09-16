import mongoose from "mongoose";
import {ALL_PERMISSIONS} from "@rpgtools/common/src/permission-constants";
import {ROLE, USER} from "@rpgtools/common/src/type-constants";
import {User} from "../../../domain-entities/user";
import {Role} from "../../../domain-entities/role";


export interface AclEntryDocument {
    permission: string;
    principal: mongoose.Schema.Types.ObjectId;
    principalType: "User" | "Role";
}

export const AclEntry = new mongoose.Schema({
    permission: {
        type: String,
        required: true,
        enum: ALL_PERMISSIONS,
        index: true,
    },
    principal: {
        type: mongoose.Schema.Types.ObjectId,
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
import mongoose from "mongoose";
import { MODEL, WORLD } from "@rpgtools/common/src/type-constants";
import {
  MODEL_ADMIN,
  MODEL_ADMIN_ALL,
  MODEL_READ,
  MODEL_READ_ALL,
  MODEL_RW,
  MODEL_RW_ALL,
} from "@rpgtools/common/src/permission-constants";

const Schema = mongoose.Schema;

const modelSchema = new Schema({
  world: {
    type: mongoose.Schema.ObjectId,
    ref: WORLD,
  },
  name: {
    type: String,
    required: [true, "name required"],
  },
  depth: {
    type: Number,
    required: [true, "depth required"],
  },
  width: {
    type: Number,
    required: [true, "width required"],
  },
  height: {
    type: Number,
    required: [true, "height required"],
  },
  fileName: {
    type: String,
    required: [true, "fileName required"],
  },
  fileId: {
    type: String,
  },
  notes: {
    type: String,
  },
});

modelSchema.methods.userCanAdmin = async function (user) {
  return (
    (await user.hasPermission(MODEL_ADMIN, this._id)) ||
    (await user.hasPermission(MODEL_ADMIN_ALL, this.world))
  );
};

modelSchema.methods.userCanWrite = async function (user) {
  return (
    (await user.hasPermission(MODEL_RW, this._id)) ||
    (await user.hasPermission(MODEL_RW_ALL, this.world))
  );
};

modelSchema.methods.userCanRead = async function (user) {
  return (
    (await user.hasPermission(MODEL_READ, this._id)) ||
    (await user.hasPermission(MODEL_READ_ALL, this.world)) ||
    (await this.userCanWrite(user))
  );
};

export const Model = mongoose.model(MODEL, modelSchema);

import mongoose from "mongoose";
import { WikiPage } from "./wiki-page";
import { PLACE } from "@rpgtools/common/src/type-constants";
import { deleteImage } from "../resolvers/mutations/image-mutations";

const Schema = mongoose.Schema;

const placeSchema = new Schema({
  mapImage: {
    type: mongoose.Schema.ObjectId,
    ref: "Image",
  },
  pixelsPerFoot: {
    type: Number,
  },
});

placeSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function () {
    if (this.mapImage) {
      await deleteImage(this.mapImage);
    }

    await this.populate("world").execPopulate();

    // doing this to avoid circular dependency
    const pinModel = mongoose.model("Pin");
    const mapPins = await pinModel.find({ map: this._id });
    for (let pin of mapPins) {
      await pinModel.deleteOne({ _id: pin._id });
      this.world.pins = this.world.pins.filter(
        (otherPin) => !otherPin.equals(pin._id)
      );
    }
    await this.world.save();
  }
);

export const Place = WikiPage.discriminator(PLACE, placeSchema);

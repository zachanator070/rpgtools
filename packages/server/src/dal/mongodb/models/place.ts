import mongoose, {Schema} from "mongoose";
import {WikiPageModel, WikiPageDocument} from "./wiki-page";
import { PLACE } from "../../../../../common/src/type-constants";
import { deleteImage } from "../../../resolvers/mutations/image-mutations";

export class PlaceDocument extends WikiPageDocument{
	public mapImage: Schema.Types.ObjectId;
	public pixelsPerFoot: number;
}

const placeSchema = new Schema<PlaceDocument>({
	mapImage: {
		type: Schema.Types.ObjectId,
		ref: "Image",
	},
	pixelsPerFoot: {
		type: Number,
	},
});

placeSchema.pre("deleteOne", { document: true, query: false }, async function () {
	if (this.mapImage) {
		await deleteImage(this.mapImage);
	}

	await this.populate("world").execPopulate();

	// doing this to avoid circular dependency
	const pinModel = mongoose.model("Pin");
	const mapPins = await pinModel.find({ map: this._id });
	for (let pin of mapPins) {
		await pinModel.deleteOne({ _id: pin._id });
		this.world.pins = this.world.pins.filter((otherPin) => !otherPin.equals(pin._id));
	}
	await this.world.save();
});

export const PlaceModel = WikiPageModel.discriminator<PlaceDocument>(PLACE, placeSchema);

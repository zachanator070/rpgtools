import DataLoader from "dataloader";
import { Model } from "mongoose";

export const getLoader = (model: Model<any>) => {
	return new DataLoader((ids) => {
		return model.find({ _id: { $in: ids } }).exec();
	});
};

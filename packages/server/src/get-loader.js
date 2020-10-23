import DataLoader from "dataloader";

export const getLoader = (model) => {
  return new DataLoader((ids) => {
    return model.find({ _id: { $in: ids } }).exec();
  });
};

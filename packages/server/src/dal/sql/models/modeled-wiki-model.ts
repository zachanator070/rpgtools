import {BelongsToGetAssociationMixin, DataTypes, ModelAttributes, ModelStatic} from "sequelize";
import WikiPageModel from "./wiki-page-model";
import ModelModel from "./model-model";
import SqlModel from "./sql-model";
import {defaultAttributes} from "./default-attributes";

export const modeledWikiAttributes: ModelAttributes = {
    ...defaultAttributes,
    modelColor: {
        type: DataTypes.STRING,
        allowNull: false
    }
};

export function configModeledWikiModel(model: ModelStatic<any>) {
    model.belongsTo(ModelModel, {as: 'pageModel'});
    model.belongsTo(WikiPageModel);
    WikiPageModel.belongsTo(model, {foreignKey: 'wiki', constraints: false});
}

export default class ModeledWikiModel extends SqlModel {
    declare modelColor: string;
    declare pageModelId: string;

    getWikiPage: BelongsToGetAssociationMixin<WikiPageModel>;
}
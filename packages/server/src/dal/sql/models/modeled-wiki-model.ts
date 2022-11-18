import {BelongsToGetAssociationMixin, DataTypes, ModelAttributes, ModelStatic} from "sequelize";
import WikiPageModel, {setupWikiPageAssociations} from "./wiki-page-model";
import ModelModel from "./model-model";
import SqlModel from "./sql-model";
import {defaultAttributes} from "./default-attributes";
import WikiPageChild from "./wiki-page-child";

export const modeledWikiAttributes: ModelAttributes = {
    ...defaultAttributes,
    modelColor: {
        type: DataTypes.STRING,
    }
};

export function configModeledWikiModel(model: ModelStatic<any>, type: string) {
    model.belongsTo(ModelModel, {as: 'pageModel'});
    setupWikiPageAssociations(model, type)
}

export default class ModeledWikiModel extends WikiPageChild {
    declare modelColor: string;
    declare pageModelId: string;

    getWikiPage: BelongsToGetAssociationMixin<WikiPageModel>;
}
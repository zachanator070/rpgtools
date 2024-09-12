import {BelongsToGetAssociationMixin, DataTypes, ModelAttributes, ModelStatic} from "sequelize";
import WikiPageModel, {setupWikiPageAssociations} from "./wiki-page-model.js";
import ModelModel from "./model-model.js";
import {defaultAttributes} from "./default-attributes.js";
import WikiPageChild from "./wiki-page-child.js";
import {MODEL} from "@rpgtools/common/src/type-constants";

export const modeledWikiAttributes: ModelAttributes = {
    ...defaultAttributes,
    modelColor: {
        type: DataTypes.STRING,
    },
    pageModelId: {
        type: DataTypes.UUID,
        references: {
            model: MODEL,
            key: '_id'
        }
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
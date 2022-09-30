import {DataTypes, ModelAttributes, ModelStatic} from "sequelize";
import WikiPageModel, {configWikiPageModel, wikiPageAttributes} from "./wiki-page-model";
import ModelModel from "./model-model";

export const modeledWikiAttributes: ModelAttributes = Object.assign({}, wikiPageAttributes, {
    modelColor: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

export function configModeledWikiModel(model: ModelStatic<any>) {
    model.belongsTo(ModelModel, {as: 'pageModel'});
    configWikiPageModel(model);
}

export default class ModeledWikiModel extends WikiPageModel {
    declare modelColor: string;
    declare pageModelId: string;
}
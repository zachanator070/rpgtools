import {DataTypes, ModelAttributes, ModelStatic} from "sequelize";
import configWikiPageModel, {wikiPageAttributes} from "./config-wiki-page-model";
import ModelModel from "./model-model";

export const modeledWikiAttributes: ModelAttributes = Object.assign({}, wikiPageAttributes, {
    modelColor: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

export default function configModeledWikiModel(model: ModelStatic<any>) {
    model.belongsTo(ModelModel, {foreignKey: 'pageModel'});
    configWikiPageModel(model);
};
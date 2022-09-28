import {DataTypes, ModelStatic} from "sequelize";
import {defaultAttributes} from "./default-attributes";
import WorldModel from "./world-model";
import configPermissionControlledModel from "./config-permission-controlled-model";
import ImageModel from "./image-model";

export const wikiPageAttributes = Object.assign({}, defaultAttributes, {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    contentId: {
        type: DataTypes.UUID
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

export default function configWikiPageModel(model: ModelStatic<any>): void {
    model.belongsTo(WorldModel, {foreignKey: {
            name: 'world'
        }});
    configPermissionControlledModel(model);
    model.belongsTo(ImageModel, {foreignKey: {name: 'coverImage'}});
}
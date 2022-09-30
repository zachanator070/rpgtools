import {DataTypes, ModelStatic} from "sequelize";
import {defaultAttributes} from "./default-attributes";
import WorldModel from "./world-model";
import ImageModel from "./image-model";
import PermissionControlledModel, {configPermissionControlledModel} from "./permission-controlled-model";

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

export function configWikiPageModel(model: ModelStatic<any>): void {
    model.belongsTo(WorldModel, {as: 'world',});
    model.belongsTo(ImageModel, {as: 'coverImage'});
    configPermissionControlledModel(model);
}

export default abstract class WikiPageModel extends PermissionControlledModel {
    declare name: string;
    declare contentId: string;
    declare type: string;
    declare worldId: string;
    declare coverImageId: string;
}
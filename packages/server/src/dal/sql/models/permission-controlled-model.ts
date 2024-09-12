import {HasManyGetAssociationsMixin, HasManySetAssociationsMixin, ModelStatic} from "sequelize";
import AclEntryModel from "./acl-entry-model.js";
import SqlModel from "./sql-model.js";


export function configPermissionControlledModel(model: ModelStatic<any>) {
    model.hasMany(AclEntryModel, {as: 'acl', foreignKey: 'subject', constraints: false});
}

export default abstract class PermissionControlledModel extends SqlModel {
    getAcl: HasManyGetAssociationsMixin<AclEntryModel>;
    setAcl: HasManySetAssociationsMixin<AclEntryModel, string>;


}
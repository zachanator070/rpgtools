import {DataTypes, HasManyGetAssociationsMixin, HasManySetAssociationsMixin, ModelStatic} from "sequelize";
import AclEntryModel from "./acl-entry-model";
import SqlModel from "./sql-model";


export function configPermissionControlledModel(model: ModelStatic<any>) {
    model.hasMany(AclEntryModel, {as: 'acl', foreignKey: 'subject', constraints: false});
}

export default class PermissionControlledModel extends SqlModel {
    getAcl: HasManyGetAssociationsMixin<AclEntryModel>;
    setAcl: HasManySetAssociationsMixin<AclEntryModel, string>;
}
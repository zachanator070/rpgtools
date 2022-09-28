import {ModelStatic} from "sequelize";
import AclEntryModel from "./acl-entry-model";


export default function configPermissionControlledModel(model: ModelStatic<any>) {
    model.hasMany(AclEntryModel, {foreignKey: 'subject', constraints: false});
}
import {injectable} from "inversify";
import {AclEntry, EntityFactory} from "../../types";
import AclEntryModel from "../../dal/sql/models/acl-entry-model.js";

@injectable()
export default class AclFactory implements EntityFactory<AclEntry, AclEntryModel>{
    build(document: AclEntry) {
        return {
            permission: document.permission,
            principal: document.principal,
            principalType: document.principalType
        };
    }

    async fromSqlModel(model: AclEntryModel): Promise<AclEntry> {
        return {
            permission: model.permission,
            principal: model.principal,
            principalType: model.principalType
        };
    }
}
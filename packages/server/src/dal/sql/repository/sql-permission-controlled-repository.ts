import PermissionControlledModel from "../models/permission-controlled-model";
import {PermissionControlledEntity} from "../../../types";
import AclEntryModel from "../models/acl-entry-model";
import {injectable} from "inversify";


@injectable()
export default class SqlPermissionControlledRepository {
    async updateAssociations(entity: PermissionControlledEntity, model: PermissionControlledModel) {
        const aclModels: AclEntryModel[] = [];
        // delete old entries
        for(let entryModel of await model.getAcl()){
            let found = false;
            for(let entry of entity.acl) {
                if(entry.principal === entryModel.principal && entry.principalType === entryModel.principalType && entry.permission === entryModel.permission) {
                    found = true;
                    break;
                }
            }
            if(!found){
                await entryModel.destroy();
            }
        }
        // create new entries
        for(let entry of entity.acl) {
            let found = false;
            for (let entryModel of await model.getAcl()) {
                if (entry.principal === entryModel.principal && entry.principalType === entryModel.principalType && entry.permission === entryModel.permission) {
                    found = true;
                    aclModels.push(entryModel);
                    break;
                }
            }
            if(!found) {
                aclModels.push(await AclEntryModel.create({...entry}));
            }
        }
        await model.setAcl(aclModels);
    }
}
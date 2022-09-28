import {AclEntryDocument} from "../../dal/mongodb/models/acl-entry";
import {injectable} from "inversify";
import {AclEntry, EntityFactory} from "../../types";

@injectable()
export default class AclFactory implements EntityFactory<AclEntry[], AclEntryDocument[]>{
    build(docs: AclEntry[]) {
        const acl = [];
        for (let document of docs) {
            acl.push({
                permission: document.permission,
                principal: document.principal.toString(),
                principalType: document.principalType
            });
        }
        return acl;
    }

    fromMongodbDocument(doc: AclEntryDocument[]): AclEntry[] {
        return undefined;
    }
}
import {AclEntryDocument} from "../models/acl-entry";

export default function AclFactory(docs: AclEntryDocument[]) {
    const acl = [];
    for(let document of docs) {
        acl.push({
            permission: document.permission,
            principal: document.principal.toString(),
            principalType: document.principalType
        });
    }
    return acl;
}
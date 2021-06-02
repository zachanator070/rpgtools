import { DomainEntity, EntityAuthorizationRuleset } from "../types";
import { WikiPage } from "../domain-entities/wiki-page";
import { SecurityContext } from "../security-context";

export class WikiFolderAuthorizationRuleset implements EntityAuthorizationRuleset<WikiPage> {
	canAdmin(context: SecurityContext, entity: WikiPage): Promise<boolean> {
		return Promise.resolve(false);
	}

	canCreate(context: SecurityContext, entity: DomainEntity): Promise<boolean> {
		return Promise.resolve(false);
	}

	canRead(context: SecurityContext, entity: WikiPage): Promise<boolean> {
		return Promise.resolve(false);
	}

	canWrite(context: SecurityContext, entity: WikiPage): Promise<boolean> {
		return Promise.resolve(false);
	}
}

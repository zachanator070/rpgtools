import {
	EntityAuthorizationPolicy,
} from "../../types";
import { Pin } from "../../domain-entities/pin";
import { SecurityContext } from "../security-context";
import { injectable } from "inversify";
import {DatabaseContext} from "../../dal/database-context";

@injectable()
export class PinAuthorizationPolicy implements EntityAuthorizationPolicy<Pin> {

	entity: Pin;

	canAdmin(_: SecurityContext): Promise<boolean> {
		// pins are not permission controlled yet
		return Promise.resolve(false);
	}

	canCreate = async (context: SecurityContext, databaseContext: DatabaseContext): Promise<boolean> => {
		const map = await databaseContext.placeRepository.findOneById(this.entity.map);
		if (!map) {
			return false;
		}
		return map.authorizationPolicy.canWrite(context, databaseContext);
	};

	canRead = async (context: SecurityContext, databaseContext: DatabaseContext): Promise<boolean> => {
		const map = await databaseContext.placeRepository.findOneById(this.entity.map);
		const page = await databaseContext.wikiPageRepository.findOneById(this.entity.page);
		return (
			(await map.authorizationPolicy.canRead(context, databaseContext)) &&
			(page ? await page.authorizationPolicy.canRead(context, databaseContext) : true)
		);
	};

	canWrite = async (context: SecurityContext, databaseContext: DatabaseContext): Promise<boolean> => {
		const map = await databaseContext.placeRepository.findOneById(this.entity.map);
		return await map.authorizationPolicy.canWrite(context, databaseContext);
	};
}

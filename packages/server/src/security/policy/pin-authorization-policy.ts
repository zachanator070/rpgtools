import {
	EntityAuthorizationPolicy,
	UnitOfWork,
} from "../../types";
import { Pin } from "../../domain-entities/pin";
import { SecurityContext } from "../security-context";
import { injectable } from "inversify";

@injectable()
export class PinAuthorizationPolicy implements EntityAuthorizationPolicy<Pin> {

	entity: Pin;

	canAdmin(_: SecurityContext): Promise<boolean> {
		// pins are not permission controlled yet
		return Promise.resolve(false);
	}

	canCreate = async (context: SecurityContext, unitOfWork: UnitOfWork): Promise<boolean> => {
		const map = await unitOfWork.placeRepository.findOneById(this.entity.map);
		if (!map) {
			return false;
		}
		return map.authorizationPolicy.canWrite(context, unitOfWork);
	};

	canRead = async (context: SecurityContext, unitOfWork: UnitOfWork): Promise<boolean> => {
		const map = await unitOfWork.placeRepository.findOneById(this.entity.map);
		const page = await unitOfWork.wikiPageRepository.findOneById(this.entity.page);
		return (
			(await map.authorizationPolicy.canRead(context, unitOfWork)) &&
			(page ? await page.authorizationPolicy.canRead(context, unitOfWork) : true)
		);
	};

	canWrite = async (context: SecurityContext, unitOfWork: UnitOfWork): Promise<boolean> => {
		const map = await unitOfWork.placeRepository.findOneById(this.entity.map);
		return await map.authorizationPolicy.canWrite(context, unitOfWork);
	};
}

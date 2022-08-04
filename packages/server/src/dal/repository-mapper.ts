import {DomainEntity, Repository, UnitOfWork} from "../types";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import {injectable, multiInject} from "inversify";

@injectable()
export class RepositoryMapper {

	@multiInject(INJECTABLE_TYPES.DomainEntity)
	domainEntities: DomainEntity[];

	public map<T extends DomainEntity>(type: string, unitOfWork: UnitOfWork): Repository<T> {
		for (let entity of this.domainEntities) {
			if (entity.type === type) {
				return entity.getRepository(unitOfWork) as Repository<T>;
			}
		}
		throw new Error(`Entity type ${type} does not map to a repository`);
	}
}

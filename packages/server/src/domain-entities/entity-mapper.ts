import {injectable, multiInject} from "inversify";
import {INJECTABLE_TYPES} from "../di/injectable-types.js";
import {DomainEntity} from "../types.js";
import { GenericRpgToolsAPIError, RpgToolsAPIError } from "../errors.js";

@injectable()
export default class EntityMapper {

    @multiInject(INJECTABLE_TYPES.DomainEntity)
    domainEntities: DomainEntity[];

    public map(type: string): DomainEntity {
        for (let entity of this.domainEntities) {
            if (entity.type === type) {
                return entity;
            }
        }
        throw new GenericRpgToolsAPIError(`Entity type ${type} does not map to a repository`);
    }
}
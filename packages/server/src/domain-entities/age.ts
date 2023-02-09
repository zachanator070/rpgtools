import {DomainEntity} from "../types";

export default class Age implements DomainEntity {
    _id: string;
    authorizationPolicy: EntityAuthorizationPolicy<this>;
    factory: EntityFactory<DomainEntity, MongoDBDocument, SqlModel>;
    type: string;

    getRepository(accessor: RepositoryAccessor): Repository<DomainEntity> {
        return undefined;
    }

}
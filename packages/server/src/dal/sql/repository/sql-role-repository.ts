import {inject, injectable} from "inversify";
import AbstractSqlRepository from "./abstract-sql-repository";
import {Role} from "../../../domain-entities/role";
import {RoleModel} from "../models/role-model";
import {RoleRepository} from "../../repository/role-repository";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";
import {PaginatedResult} from "../../paginated-result";
import RoleFactory from "../../../domain-entities/factory/role-factory";


@injectable()
export default class SqlRoleRepository extends AbstractSqlRepository<Role, RoleModel> implements RoleRepository {

    staticModel = RoleModel;

    @inject(INJECTABLE_TYPES.RoleFactory)
    entityFactory: RoleFactory;

    async modelFactory(entity: Role | undefined): Promise<RoleModel> {
        return RoleModel.build({
            _id: entity._id,
            name: entity.name,
            worldId: entity.world,
        })
    }

    async findByWorldAndNamePaginated(worldId: string, page: number, name?: string): Promise<PaginatedResult<Role>> {
        const filter: any = {worldId};
        if (name) {
            filter.name = name;
        }
        return this.buildPaginatedResult(page, filter);
    }

    async findOneByName(name: string): Promise<Role> {
        const model = await RoleModel.findOne({
            where: {
                name: name
            }
        });
        if(model) {
            return this.entityFactory.fromSqlModel(model);
        }
    }

}
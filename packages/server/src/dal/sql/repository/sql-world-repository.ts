import {inject, injectable} from "inversify";
import AbstractSqlRepository from "./abstract-sql-repository";
import {World} from "../../../domain-entities/world";
import WorldModel from "../models/world-model";
import {WorldRepository} from "../../repository/world-repository";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";
import WorldFactory from "../../../domain-entities/factory/world-factory";
import {PaginatedResult} from "../../paginated-result";
import {ServerConfig} from "../../../domain-entities/server-config";
import ServerConfigModel from "../models/server-config-model";
import SqlPermissionControlledRepository from "./sql-permission-controlled-repository";


@injectable()
export default class SqlWorldRepository extends AbstractSqlRepository<World, WorldModel> implements WorldRepository {

    staticModel = WorldModel;

    @inject(INJECTABLE_TYPES.WorldFactory)
    entityFactory: WorldFactory;

    @inject(INJECTABLE_TYPES.SqlPermissionControlledRepository)
    sqlPermissionControlledRepository: SqlPermissionControlledRepository;

    async modelFactory(entity: World | undefined): Promise<WorldModel> {
        return WorldModel.build({
            _id: entity._id,
            name: entity.name,
            wikiPageId: entity.wikiPage,
            rootFolderId: entity.rootFolder
        });
    }

    async updateAssociations(entity: World, model: WorldModel) {
        await this.sqlPermissionControlledRepository.updateAssociations(entity, model);
    }

    async findAllPaginated(page: number): Promise<PaginatedResult<World>> {
        return this.buildPaginatedResult(page, {});
    }

    async findByNamePaginated(name: string, page: number): Promise<PaginatedResult<World>> {
        return this.buildPaginatedResult(page, {name});
    }

    async findByRootFolder(folderId: string): Promise<World[]> {
        return this.buildResults(await WorldModel.findAll({
            where: {
                rootFolderId: folderId
            }
        }));
    }

    async findOneByWikiPage(pageId: string): Promise<World> {
        const model = await WorldModel.findOne({
            where: {
                wikiPageId: pageId
            }
        });
        if(model) {
            return this.entityFactory.fromSqlModel(model);
        }
    }

}
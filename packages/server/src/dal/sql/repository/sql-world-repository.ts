import {inject, injectable} from "inversify";
import AbstractSqlRepository from "./abstract-sql-repository";
import {World} from "../../../domain-entities/world";
import WorldModel from "../models/world-model";
import {WorldRepository} from "../../repository/world-repository";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";
import WorldFactory from "../../../domain-entities/factory/world-factory";
import {PaginatedResult} from "../../paginated-result";


@injectable()
export default class SqlWorldRepository extends AbstractSqlRepository<World, WorldModel> implements WorldRepository {

    staticModel = WorldModel;

    @inject(INJECTABLE_TYPES.WorldFactory)
    entityFactory: WorldFactory;

    async modelFactory(entity: World | undefined): Promise<WorldModel> {
        return WorldModel.build({
            _id: entity._id,
            name: entity.name,
            wikiPageId: entity.wikiPage,
            rootFolderId: entity.rootFolder
        });
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
        return this.entityFactory.fromSqlModel(await WorldModel.findOne({
            where: {
                wikiPageId: pageId
            }
        }));
    }

}
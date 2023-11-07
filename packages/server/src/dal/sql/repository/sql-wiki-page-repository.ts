import {inject, injectable} from "inversify";
import {WikiPageRepository} from "../../repository/wiki-page-repository";
import {WikiPage} from "../../../domain-entities/wiki-page";
import {PaginatedResult} from "../../paginated-result";
import AbstractSqlRepository from "./abstract-sql-repository";
import WikiPageModel from "../models/wiki-page-model";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";
import WikiPageFactory from "../../../domain-entities/factory/wiki-page-factory";
import SqlPermissionControlledRepository from "./sql-permission-controlled-repository";
import {Op} from "sequelize";
import {EVENT_WIKI} from "@rpgtools/common/src/type-constants";

@injectable()
export default class SqlWikiPageRepository extends AbstractSqlRepository<WikiPage, WikiPageModel> implements WikiPageRepository {

    staticModel = WikiPageModel;

    @inject(INJECTABLE_TYPES.WikiPageFactory)
    entityFactory: WikiPageFactory;

    @inject(INJECTABLE_TYPES.SqlPermissionControlledRepository)
    sqlPermissionControlledRepository: SqlPermissionControlledRepository;

    async modelFactory(entity: WikiPage | undefined): Promise<WikiPageModel> {
        return WikiPageModel.build({
            _id: entity._id,
            name: entity.name,
            contentId: entity.contentId,
            type: entity.type,
            worldId: entity.world,
            coverImageId: entity.coverImage
        });
    }

    async updateAssociations(entity: WikiPage, model: WikiPageModel) {
        await this.sqlPermissionControlledRepository.updateAssociations(entity, model);
    }

    async deleteAssociations(entity: WikiPage, model: WikiPageModel) {
        await this.sqlPermissionControlledRepository.deleteAssociations(entity, model);
    }

    async findByIdsPaginated(ids: string[], page: number, sort?: string): Promise<PaginatedResult<WikiPage>> {
        return this.buildPaginatedResult(page, {_id: ids}, 'name');
    }

    async findByNameAndTypesPaginatedSortByName(page: number, name?: string, types?: string[]): Promise<PaginatedResult<WikiPage>> {
        const filter: any = {};
        if(name) {
            filter.name = {[Op.iLike]: `%${name}%`};
        }
        if(types && types.length > 0) {
            filter.type = types;
        }
        return this.buildPaginatedResult(page, filter, 'name');
    }

    // only used in testing
    async findOneByNameAndWorld(name: string, worldId: string): Promise<WikiPage> {
        const model = await WikiPageModel.findOne({
            where: {
                name,
                worldId
            }
        });
        if(model) {
            return this.entityFactory.fromSqlModel(model);
        }
    }

    findEventsByWorldAndContentAndCalendar(page: number, worldId: string, contentIds?: string[], calendarIds?: string[]): Promise<PaginatedResult<WikiPage>> {
        const filter: any = {worldId: worldId, type: EVENT_WIKI};
        if(contentIds && contentIds.length > 0) {
            filter.contentId = contentIds;
        }
        if(calendarIds && calendarIds.length > 0) {
            filter.calendar = calendarIds;
        }

        return this.buildPaginatedResult(page, filter, 'name');
    }

}
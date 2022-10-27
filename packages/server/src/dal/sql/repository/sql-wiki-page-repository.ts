import {inject, injectable} from "inversify";
import {WikiPageRepository} from "../../repository/wiki-page-repository";
import {WikiPage} from "../../../domain-entities/wiki-page";
import {PaginatedResult} from "../../paginated-result";
import AbstractSqlRepository from "./abstract-sql-repository";
import WikiPageModel from "../models/wiki-page-model";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";
import WikiPageFactory from "../../../domain-entities/factory/wiki-page-factory";
import SqlPermissionControlledRepository from "./sql-permission-controlled-repository";
import WikiPageChild from "../models/wiki-page-child";


export async function updateWikiPageAssociations(entity: WikiPage, model: WikiPageChild) {
    let parent = await model.getWikiPage();
    if(!parent) {
        parent = await WikiPageModel.create({_id: entity._id, ...entity, worldId: entity.world, wiki: model._id});
        await model.setWikiPage(parent);
    }
}

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
            type: entity.contentId,
            worldId: entity.world,
            coverImageId: entity.coverImage
        });
    }

    async updateAssociations(entity: WikiPage, model: WikiPageModel) {
        await this.sqlPermissionControlledRepository.updateAssociations(entity, model);
    }

    async findByIdsPaginated(ids: string[], page: number, sort?: string): Promise<PaginatedResult<WikiPage>> {
        return this.buildPaginatedResult(page, {_id: ids});
    }

    async findByNameAndTypesPaginated(page: number, name?: string, types?: string[]): Promise<PaginatedResult<WikiPage>> {
        return this.buildPaginatedResult(page, {name});
    }

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

}
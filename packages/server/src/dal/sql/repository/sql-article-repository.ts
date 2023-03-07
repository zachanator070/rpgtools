import {inject, injectable} from "inversify";
import {ArticleRepository} from "../../repository/article-repository";
import AbstractSqlRepository from "./abstract-sql-repository";
import {Article} from "../../../domain-entities/article";
import {Op} from "sequelize";
import ArticleFactory from "../../../domain-entities/factory/article-factory";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";
import WikiPageFactory from "../../../domain-entities/factory/wiki-page-factory";
import WikiPageModel from "../models/wiki-page-model";
import {WikiPage} from "../../../domain-entities/wiki-page";
import SqlPermissionControlledRepository from "./sql-permission-controlled-repository";

@injectable()
export default class SqlArticleRepository extends AbstractSqlRepository<Article, WikiPageModel> implements ArticleRepository {

    staticModel = WikiPageModel;

    @inject(INJECTABLE_TYPES.ArticleFactory)
    entityFactory: ArticleFactory;

    @inject(INJECTABLE_TYPES.WikiPageFactory)
    wikiPageFactory: WikiPageFactory;

    @inject(INJECTABLE_TYPES.SqlPermissionControlledRepository)
    sqlPermissionControlledRepository: SqlPermissionControlledRepository;

    async findOneByNameAndWorld(name: string, worldId: string): Promise<Article> {
        const model = await WikiPageModel.findOne({
            where: {
                [Op.and]: {
                    name: name,
                    worldId: worldId
                }
            }
        });
        if(model) {
            return this.entityFactory.fromSqlModel(model);
        }
    }

    async updateAssociations(entity: WikiPage, model: WikiPageModel) {
        await this.sqlPermissionControlledRepository.updateAssociations(entity, model);
    }

    async deleteAssociations(entity: WikiPage, model: WikiPageModel) {
        await this.sqlPermissionControlledRepository.deleteAssociations(entity, model);
    }

    async modelFactory(entity: Article): Promise<WikiPageModel> {
        return WikiPageModel.build({
            _id: entity._id,
            name: entity.name,
            contentId: entity.contentId,
            worldId: entity.world,
            type: entity.type,
            coverImageId: entity.coverImage
        });
    }

}
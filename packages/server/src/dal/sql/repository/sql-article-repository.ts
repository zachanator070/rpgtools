import {inject, injectable} from "inversify";
import {ArticleRepository} from "../../repository/article-repository";
import AbstractSqlRepository from "./abstract-sql-repository";
import {Article} from "../../../domain-entities/article";
import ArticleModel from "../models/article-model";
import {Op} from "sequelize";
import ArticleFactory from "../../../domain-entities/factory/article-factory";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";
import WikiPageFactory from "../../../domain-entities/factory/wiki-page-factory";
import {updateWikiPageAssociations} from "./sql-wiki-page-repository";

@injectable()
export default class SqlArticleRepository extends AbstractSqlRepository<Article, ArticleModel> implements ArticleRepository {

    staticModel = ArticleModel;

    @inject(INJECTABLE_TYPES.ArticleFactory)
    entityFactory: ArticleFactory;

    @inject(INJECTABLE_TYPES.WikiPageFactory)
    wikiPageFactory: WikiPageFactory;

    async findOneByNameAndWorld(name: string, worldId: string): Promise<Article> {
        const model = await ArticleModel.findOne({
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

    async modelFactory(entity: Article): Promise<ArticleModel> {
        return ArticleModel.build({
            _id: entity._id,
            name: entity.name,
            contentId: entity.contentId,
            worldId: entity.world,
            type: entity.type,
            coverImageId: entity.coverImage
        });
    }

    async updateAssociations(entity: Article, model: ArticleModel) {
        await updateWikiPageAssociations(entity, model);
    }

}
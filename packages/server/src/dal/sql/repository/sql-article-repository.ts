import {inject, injectable} from "inversify";
import {ArticleRepository} from "../../repository/article-repository";
import AbstractSqlRepository from "./abstract-sql-repository";
import {Article} from "../../../domain-entities/article";
import ArticleModel from "../models/article-model";
import {DatabaseSession} from "../../database-session";
import {Op} from "sequelize";
import ArticleFactory from "../../../domain-entities/factory/article-factory";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";

@injectable()
export default class SqlArticleRepository extends AbstractSqlRepository<Article, ArticleModel> implements ArticleRepository {

    staticModel = ArticleModel;

    @inject(INJECTABLE_TYPES.ArticleFactory)
    entityFactory: ArticleFactory;

    async findOneByNameAndWorld(name: string, worldId: string): Promise<Article> {
        return this.entityFactory.fromSqlModel(await ArticleModel.findOne({
            where: {
                [Op.and]: {
                    name: name,
                    worldId: worldId
                }
            }
        }));
    }

    setDatabaseSession(session: DatabaseSession): void {
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

}
import {inject, injectable} from "inversify";
import AbstractSqlRepository from "./abstract-sql-repository";
import {WikiFolder} from "../../../domain-entities/wiki-folder";
import WikiFolderModel from "../models/wiki-folder-model";
import {WikiFolderRepository} from "../../repository/wiki-folder-repository";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";
import WikiFolderFactory from "../../../domain-entities/factory/wiki-folder-factory";
import ArticleModel from "../models/article-model";


@injectable()
export default class SqlWikiFolderRepository extends AbstractSqlRepository<WikiFolder, WikiFolderModel> implements WikiFolderRepository {

    @inject(INJECTABLE_TYPES.WikiFolderFactory)
    entityFactory: WikiFolderFactory;

    staticModel = WikiFolderModel;

    async modelFactory(entity: WikiFolder | undefined): Promise<WikiFolderModel> {
        return WikiFolderModel.build({
            _id: entity._id,
            name: entity.name,
            worldId: entity.world
        });
    }

    async findByWorldAndName(worldId: string, name?: string): Promise<WikiFolder[]> {
        const filter: any = {
            worldId
        };
        if (name) {
            filter.name = name;
        }
        return this.buildResults(await WikiFolderModel.findAll({
            where: filter
        }))
    }

    async findOneByNameAndWorld(name: string, worldId: string): Promise<WikiFolder> {
        return this.entityFactory.fromSqlModel(await WikiFolderModel.findOne({
            where: {
                name,
                worldId
            }
        }));
    }

    async findOneWithChild(wikiFolderId: string): Promise<WikiFolder> {
        return this.entityFactory.fromSqlModel(await WikiFolderModel.findOne({
            include: [{
                model: WikiFolderModel,
                where: {
                    _id: wikiFolderId
                }
            }]
        }));
    }

    async findOneWithPage(pageId: string): Promise<WikiFolder> {
        return this.entityFactory.fromSqlModel(await WikiFolderModel.findOne({
            include: [{
                model: ArticleModel,
                where: {
                    _id: pageId
                }
            }]
        }));
    }

}
import {inject, injectable} from "inversify";
import AbstractSqlRepository from "./abstract-sql-repository";
import {WikiFolder} from "../../../domain-entities/wiki-folder";
import WikiFolderModel from "../models/wiki-folder-model";
import {WikiFolderRepository} from "../../repository/wiki-folder-repository";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";
import WikiFolderFactory from "../../../domain-entities/factory/wiki-folder-factory";
import SqlPermissionControlledRepository from "./sql-permission-controlled-repository";
import WikiPageModel from "../models/wiki-page-model";


@injectable()
export default class SqlWikiFolderRepository extends AbstractSqlRepository<WikiFolder, WikiFolderModel> implements WikiFolderRepository {

    @inject(INJECTABLE_TYPES.WikiFolderFactory)
    entityFactory: WikiFolderFactory;

    staticModel = WikiFolderModel;

    @inject(INJECTABLE_TYPES.SqlPermissionControlledRepository)
    sqlPermissionControlledRepository: SqlPermissionControlledRepository;

    async modelFactory(entity: WikiFolder | undefined): Promise<WikiFolderModel> {
        return WikiFolderModel.build({
            _id: entity._id,
            name: entity.name,
            worldId: entity.world
        });
    }

    async updateAssociations(entity: WikiFolder, model: WikiFolderModel) {
        await this.sqlPermissionControlledRepository.updateAssociations(entity, model);

        const childrenModels = await WikiFolderModel.findAll({where: {_id: entity.children}});
        await model.setChildren(childrenModels);

        const pageModels = await WikiPageModel.findAll({where: {_id: entity.pages}});
        await model.setPages(pageModels);
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
        const model = await WikiFolderModel.findOne({
            where: {
                name,
                worldId
            }
        });
        if(model) {
            return this.entityFactory.fromSqlModel(model);
        }
    }

    async findOneWithChild(wikiFolderId: string): Promise<WikiFolder> {
        const model = await WikiFolderModel.findOne({
            include: [{
                as: 'children',
                model: WikiFolderModel,
                where: {
                    _id: wikiFolderId
                }
            }]
        });
        if(model) {
            return this.entityFactory.fromSqlModel(model);
        }
    }

    async findOneWithPage(pageId: string): Promise<WikiFolder> {
        const model = await WikiFolderModel.findOne({
            include: [{
                as: 'pages',
                model: WikiPageModel,
                where: {
                    _id: pageId
                }
            }]
        });
        if(model) {
            return this.entityFactory.fromSqlModel(model);
        }
    }

}
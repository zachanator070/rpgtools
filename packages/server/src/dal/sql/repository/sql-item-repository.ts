import {inject, injectable} from "inversify";
import AbstractSqlRepository from "./abstract-sql-repository";
import {Item} from "../../../domain-entities/item";
import ItemModel from "../models/item-model";
import {ItemRepository} from "../../repository/item-repository";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";
import ItemFactory from "../../../domain-entities/factory/item-factory";
import WikiPageModel from "../models/wiki-page-model";


@injectable()
export default class SqlItemRepository extends AbstractSqlRepository<Item, WikiPageModel> implements ItemRepository {

    staticModel = WikiPageModel;

    @inject(INJECTABLE_TYPES.ItemFactory)
    entityFactory: ItemFactory;

    async modelFactory(entity: Item): Promise<WikiPageModel> {
        return WikiPageModel.build({
            _id: entity._id,
            name: entity.name,
            contentId: entity.contentId,
            worldId: entity.world,
            type: entity.type,
            coverImageId: entity.coverImage
        });
    }

    async updateAssociations(entity: Item, model: WikiPageModel) {
        let page = await ItemModel.findOne({where: {_id: entity._id}});
        if(!page) {
            page = await ItemModel.create({
                _id: entity._id,
                modelColor: entity.modelColor,
                pageModelId: entity.pageModel,
            });
            model.wiki = page._id;
            await model.save();
        } else {
            page.set({
                modelColor: entity.modelColor,
                pageModelId: entity.pageModel,
            });
            await page.save();
        }
        if (entity.relatedWikis) {
            const relatedWikiModels = await WikiPageModel.findAll({where: {_id: entity.relatedWikis}});
            await model.setRelatedWikis(relatedWikiModels);
        }
    }

    async deleteAssociations(entity: Item, model: WikiPageModel){
        await ItemModel.destroy({where: {_id: entity._id}});
    }

}

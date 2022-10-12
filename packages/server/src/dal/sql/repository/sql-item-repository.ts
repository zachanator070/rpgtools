import {inject, injectable} from "inversify";
import AbstractSqlRepository from "./abstract-sql-repository";
import {Item} from "../../../domain-entities/item";
import ItemModel from "../models/item-model";
import {ItemRepository} from "../../repository/item-repository";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";
import ItemFactory from "../../../domain-entities/factory/item-factory";


@injectable()
export default class SqlItemRepository extends AbstractSqlRepository<Item, ItemModel> implements ItemRepository {

    staticModel = ItemModel;

    @inject(INJECTABLE_TYPES.ItemFactory)
    entityFactory: ItemFactory;

    async modelFactory(entity: Item | undefined): Promise<ItemModel> {
        return ItemModel.build({
            _id: entity._id,
            modelColor: entity.modelColor,
            pageModelId: entity.pageModel,
            name: entity.name,
            contentId: entity.contentId,
            worldId: entity.world,
            type: entity.type,
            coverImageId: entity.coverImage
        });
    }

}
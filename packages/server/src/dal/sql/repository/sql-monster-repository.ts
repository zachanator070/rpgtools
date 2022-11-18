import {inject, injectable} from "inversify";
import AbstractSqlRepository from "./abstract-sql-repository";
import {Monster} from "../../../domain-entities/monster";
import MonsterModel from "../models/monster-model";
import {MonsterRepository} from "../../repository/monster-repository";
import MonsterFactory from "../../../domain-entities/factory/monster-factory";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";
import WikiPageModel from "../models/wiki-page-model";
import {Person} from "../../../domain-entities/person";
import PersonModel from "../models/person-model";


@injectable()
export default class SqlMonsterRepository extends AbstractSqlRepository<Monster, WikiPageModel> implements MonsterRepository {

    @inject(INJECTABLE_TYPES.MonsterFactory)
    entityFactory: MonsterFactory;

    staticModel = WikiPageModel;

    async modelFactory(entity: Monster): Promise<WikiPageModel> {
        return WikiPageModel.build({
            _id: entity._id,
            name: entity.name,
            contentId: entity.contentId,
            worldId: entity.world,
            type: entity.type,
            coverImageId: entity.coverImage
        });
    }

    async updateAssociations(entity: Monster, model: WikiPageModel) {
        let page = await MonsterModel.findOne({where: {_id: entity._id}});
        if(!page) {
            page = await MonsterModel.create({
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
    }

    async deleteAssociations(entity: Monster, model: WikiPageModel){
        await MonsterModel.destroy({where: {_id: entity._id}});
    }
}

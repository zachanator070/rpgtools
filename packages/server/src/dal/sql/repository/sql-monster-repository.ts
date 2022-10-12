import {inject, injectable} from "inversify";
import AbstractSqlRepository from "./abstract-sql-repository";
import {Monster} from "../../../domain-entities/monster";
import MonsterModel from "../models/monster-model";
import {MonsterRepository} from "../../repository/monster-repository";
import MonsterFactory from "../../../domain-entities/factory/monster-factory";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";


@injectable()
export default class SqlMonsterRepository extends AbstractSqlRepository<Monster, MonsterModel> implements MonsterRepository {

    @inject(INJECTABLE_TYPES.MonsterFactory)
    entityFactory: MonsterFactory;

    staticModel = MonsterModel;

    async modelFactory(entity: Monster | undefined): Promise<MonsterModel> {
        return MonsterModel.build({
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

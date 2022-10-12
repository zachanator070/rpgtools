import {inject, injectable} from "inversify";
import AbstractSqlRepository from "./abstract-sql-repository";
import {Person} from "../../../domain-entities/person";
import PersonModel from "../models/person-model";
import {PersonRepository} from "../../repository/person-repository";
import PersonFactory from "../../../domain-entities/factory/person-factory";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";
import ItemModel from "../models/item-model";


@injectable()
export default class SqlPersonRepository extends AbstractSqlRepository<Person, PersonModel> implements PersonRepository {

    staticModel = PersonModel;

    @inject(INJECTABLE_TYPES.PersonFactory)
    entityFactory: PersonFactory;

    async modelFactory(entity: Person | undefined): Promise<PersonModel> {
        return PersonModel.build({
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
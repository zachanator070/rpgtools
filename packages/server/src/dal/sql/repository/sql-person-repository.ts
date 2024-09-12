import {inject, injectable} from "inversify";
import AbstractSqlRepository from "./abstract-sql-repository.js";
import {Person} from "../../../domain-entities/person.js";
import PersonModel from "../models/person-model.js";
import {PersonRepository} from "../../repository/person-repository.js";
import PersonFactory from "../../../domain-entities/factory/person-factory.js";
import {INJECTABLE_TYPES} from "../../../di/injectable-types.js";
import WikiPageModel from "../models/wiki-page-model.js";


@injectable()
export default class SqlPersonRepository extends AbstractSqlRepository<Person, WikiPageModel> implements PersonRepository {

    staticModel = WikiPageModel;

    @inject(INJECTABLE_TYPES.PersonFactory)
    entityFactory: PersonFactory;

    async modelFactory(entity: Person | undefined): Promise<WikiPageModel> {
        return WikiPageModel.build({
            _id: entity._id,
            name: entity.name,
            contentId: entity.contentId,
            worldId: entity.world,
            type: entity.type,
            coverImageId: entity.coverImage
        });
    }

    async updateAssociations(entity: Person, model: WikiPageModel) {
        let page = await PersonModel.findOne({where: {_id: entity._id}});
        if(!page) {
            page = await PersonModel.create({
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

    async deleteAssociations(entity: Person, model: WikiPageModel){
        await PersonModel.destroy({where: {_id: entity._id}});
    }

}

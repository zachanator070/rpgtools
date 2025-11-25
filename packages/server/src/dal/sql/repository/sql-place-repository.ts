import {inject, injectable} from "inversify";
import AbstractSqlRepository from "./abstract-sql-repository.js";
import {Place} from "../../../domain-entities/place.js";
import PlaceModel from "../models/place-model.js";
import {PlaceRepository} from "../../repository/place-repository.js";
import PlaceFactory from "../../../domain-entities/factory/place-factory.js";
import {INJECTABLE_TYPES} from "../../../di/injectable-types.js";
import WikiPageModel from "../models/wiki-page-model.js";

@injectable()
export default class SqlPlaceRepository extends AbstractSqlRepository<Place, WikiPageModel> implements PlaceRepository {

    staticModel = WikiPageModel;

    @inject(INJECTABLE_TYPES.PlaceFactory)
    entityFactory: PlaceFactory;

    async modelFactory(entity: Place): Promise<WikiPageModel> {
        return WikiPageModel.build({
            _id: entity._id,
            name: entity.name,
            contentId: entity.contentId,
            worldId: entity.world,
            type: entity.type,
            coverImageId: entity.coverImage,
        });
    }

    async updateAssociations(entity: Place, model: WikiPageModel) {
        let page = await PlaceModel.findOne({where: {_id: entity._id}});
        if(!page) {
           page = await PlaceModel.create({
               _id: entity._id,
               mapImageId: entity.mapImage,
               pixelsPerFoot: entity.pixelsPerFoot,
           });
           model.wiki = page._id;
           await model.save();
        } else {
            page.set({
                mapImageId: entity.mapImage,
                pixelsPerFoot: entity.pixelsPerFoot,
            });
            await page.save();
        }
        if (entity.relatedWikis) {
            const relatedWikiModels = await WikiPageModel.findAll({where: {_id: entity.relatedWikis}});
            await model.setRelatedWikis(relatedWikiModels);
        }
    }

    async deleteAssociations(entity: Place, model: WikiPageModel){
        await PlaceModel.destroy({where: {_id: entity._id}});
    }

}

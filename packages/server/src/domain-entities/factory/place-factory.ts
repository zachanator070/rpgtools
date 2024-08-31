import {inject, injectable} from "inversify";
import {AclEntry, EntityFactory} from "../../types";
import {Place} from "../place";
import {WikiPageAuthorizationPolicy} from "../../security/policy/wiki-page-authorization-policy";
import {INJECTABLE_TYPES} from "../../di/injectable-types";
import AclFactory from "./acl-factory";
import WikiPageModel from "../../dal/sql/models/wiki-page-model";


@injectable()
export default class PlaceFactory implements EntityFactory<Place, WikiPageModel> {

    @inject(INJECTABLE_TYPES.AclFactory)
    aclFactory: AclFactory

    build(
        {
            _id,
            name,
            world,
            coverImage,
            contentId,
            mapImage,
            pixelsPerFoot,
            acl,
            relatedWikis
        }:{
            _id?: string,
            name: string,
            world: string,
            coverImage: string,
            contentId: string,
            mapImage: string,
            pixelsPerFoot: number,
            acl: AclEntry[],
            relatedWikis: string[]
        }
    ) {
        const place: Place = new Place(this, new WikiPageAuthorizationPolicy());
        place._id = _id;
        place.name = name;
        place.world = world;
        place.coverImage = coverImage;
        place.contentId = contentId;
        place.mapImage = mapImage;
        place.pixelsPerFoot = pixelsPerFoot;
        place.acl = acl;
        place.relatedWikis = relatedWikis;
        return place;
    }

    async fromSqlModel(model: WikiPageModel): Promise<Place> {
        const page = await model.getWiki();
        return this.build({
            _id: model._id,
            name: model.name,
            world: model.worldId,
            coverImage: model.coverImageId,
            contentId: model.contentId,
            mapImage: page?.mapImageId,
            pixelsPerFoot: page?.pixelsPerFoot,
            acl: await Promise.all(
                (await model.getAcl()).map(entry => this.aclFactory.fromSqlModel(entry))
            ),
            relatedWikis: (await Promise.all((await model.getRelatedWikis()).map(wiki => wiki._id)))
        });
    }

}
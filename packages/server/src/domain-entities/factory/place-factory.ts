import {inject, injectable} from "inversify";
import {AclEntry, EntityFactory} from "../../types";
import {Place} from "../place";
import {PlaceDocument} from "../../dal/mongodb/models/place";
import {WikiPageAuthorizationPolicy} from "../../security/policy/wiki-page-authorization-policy";
import {INJECTABLE_TYPES} from "../../di/injectable-types";
import AclFactory from "./acl-factory";
import WikiPageModel from "../../dal/sql/models/wiki-page-model";


@injectable()
export default class PlaceFactory implements EntityFactory<Place, PlaceDocument, WikiPageModel> {

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
            acl
        }:{
            _id?: string,
            name: string,
            world: string,
            coverImage: string,
            contentId: string,
            mapImage: string,
            pixelsPerFoot: number,
            acl: AclEntry[]
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
        return place;
    }

    fromMongodbDocument({
        _id,
        name,
        world,
        coverImage,
        contentId,
        mapImage,
        pixelsPerFoot,
        acl
    }: PlaceDocument): Place {
        const place = new Place(this, new WikiPageAuthorizationPolicy());
        place._id = _id && _id.toString();
        place.name = name;
        place.world = world && world.toString();
        place.coverImage = coverImage && coverImage.toString();
        place.contentId = contentId && contentId.toString();
        place.mapImage = mapImage && mapImage.toString();
        place.pixelsPerFoot = pixelsPerFoot;
        place.acl = acl.map(entry => this.aclFactory.fromMongodbDocument(entry));
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
            )
        });
    }

}
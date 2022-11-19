import {injectable} from "inversify";
import {EntityFactory} from "../../types";
import {Pin} from "../pin";
import {PinDocument} from "../../dal/mongodb/models/pin";
import {PinAuthorizationPolicy} from "../../security/policy/pin-authorization-policy";
import PinModel from "../../dal/sql/models/pin-model";


@injectable()
export default class PinFactory implements EntityFactory<Pin, PinDocument, PinModel> {
    build(
        {
            _id,
            x,
            y,
            map,
            page,
            world
        }: { _id?: string , x: number, y: number, map: string , page: string , world: string }
    ) {
        const pin: Pin = new Pin(new PinAuthorizationPolicy(), this);
        pin._id = _id;
        pin.x = x;
        pin.y = y;
        pin.map = map;
        pin.page = page;
        pin.world = world;
        return pin;
    }

    fromMongodbDocument({
        _id,
        x,
        y,
        map,
        page,
        world
    }: PinDocument): Pin {
        const pin = new Pin(new PinAuthorizationPolicy(), this);
        pin._id = _id && _id.toString();
        pin.x = x;
        pin.y = y;
        pin.map = map && map.toString();
        pin.page = page && page.toString();
        pin.world = world;
        return pin;
    }

    async fromSqlModel(model: PinModel): Promise<Pin> {
        return this.build({
            _id: model._id,
            x: model.x,
            y: model.y,
            map: model.mapId,
            page: model.pageId,
            world: model.worldId
        });
    }

}
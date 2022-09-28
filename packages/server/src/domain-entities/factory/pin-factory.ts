import {injectable} from "inversify";
import {EntityFactory} from "../../types";
import {Pin} from "../pin";
import {PinDocument} from "../../dal/mongodb/models/pin";
import {PinAuthorizationPolicy} from "../../security/policy/pin-authorization-policy";


@injectable()
export default class PinFactory implements EntityFactory<Pin, PinDocument> {
    build(
        {
            _id,
            x,
            y,
            map,
            page
        }: { _id: string , x: number, y: number, map: string , page: string  }
    ) {
        const pin: Pin = new Pin(new PinAuthorizationPolicy(), this);
        pin._id = _id;
        pin.x = x;
        pin.y = y;
        pin.map = map;
        pin.page = page;
        return pin;
    }

    fromMongodbDocument({
        _id,
        x,
        y,
        map,
        page
    }: PinDocument): Pin {
        const pin = new Pin(new PinAuthorizationPolicy(), this);
        pin._id = _id && _id.toString();
        pin.x = x;
        pin.y = y;
        pin.map = map && map.toString();
        pin.page = page && page.toString();
        return pin;
    }

}
import {injectable} from "inversify";
import {EntityFactory} from "../../types.js";
import {TokenIcon} from "../token-icon.js";
import TokenIconModel from "../../dal/sql/models/token-icon-model.js";

@injectable()
export default class TokenIconFactory implements EntityFactory<TokenIcon, TokenIconModel> {
    build(
        {
            _id,
            imageId,
            worldId
        }: {
            _id?: string,
            imageId: string,
            worldId: string
        }
    ) {
        const tokenIcon: TokenIcon = new TokenIcon(this);
        tokenIcon._id = _id && _id.toString();
        tokenIcon.imageId = imageId && imageId.toString();
        tokenIcon.worldId = worldId && worldId.toString();
        return tokenIcon;
    }

    async fromSqlModel(model: TokenIconModel): Promise<TokenIcon> {
        return this.build({
            _id: model._id,
            imageId: model.imageId,
            worldId: model.worldId
        });
    }

}

import {injectable} from "inversify";
import {EntityFactory} from "../../types";
import {User} from "../user.js";
import {UserAuthorizationPolicy} from "../../security/policy/user-authorization-policy.js";
import UserModel from "../../dal/sql/models/user-model.js";


@injectable()
export default class UserFactory implements EntityFactory<User, UserModel> {
    build(
        {
            _id,
            email,
            username,
            password,
            tokenVersion,
            currentWorld,
            roles,
        }: {
            _id?: string,
            email: string,
            username: string,
            password: string,
            tokenVersion: string,
            currentWorld: string,
            roles: string[],
        }
    ) {
        const user: User = new User(new UserAuthorizationPolicy(), this);
        user._id = _id;
        user.email = email;
        user.username = username;
        user.password = password;
        user.tokenVersion = tokenVersion;
        user.currentWorld = currentWorld;
        user.roles = roles;
        return user;
    }

    async fromSqlModel(model: UserModel): Promise<User> {
        return this.build({
            _id: model._id,
            email: model.email,
            username: model.username,
            password: model.password,
            tokenVersion: model.tokenVersion,
            currentWorld: model.currentWorldId,
            roles: (await model.getRoles()).map(role => role._id)
        });
    }

}
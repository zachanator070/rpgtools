import {injectable} from "inversify";
import {EntityFactory} from "../../types";
import {User} from "../user";
import {UserDocument} from "../../dal/mongodb/models/user";
import {UserAuthorizationPolicy} from "../../security/policy/user-authorization-policy";


@injectable()
export default class UserFactory implements EntityFactory<User, UserDocument> {
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
            _id: string,
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

    fromMongodbDocument({
        _id,
        email,
        username,
        password,
        tokenVersion,
        currentWorld,
        roles,
    }: UserDocument): User {
        const user = new User(new UserAuthorizationPolicy(), this);
        user._id = _id && _id.toString();
        user.email = email;
        user.username = username;
        user.password = password;
        user.tokenVersion = tokenVersion;
        user.currentWorld = currentWorld && currentWorld.toString();
        user.roles = roles.map(role => role.toString());
        return user;
    }

}
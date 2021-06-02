import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { User } from "../../../domain-entities/user";
import { UserDocument, UserModel } from "../models/user";
import { UserRepository } from "../../../types";
import { injectable } from "inversify";

@injectable()
export class MongodbUserRepository
	extends AbstractMongodbRepository<User, UserDocument>
	implements UserRepository {
	model = UserModel;

	buildEntity(document: UserDocument): User {
		return new User(
			document.email,
			document.email,
			document.username,
			document.password,
			document.tokenVersion,
			document.currentWorld.toString(),
			document.roles.map((roleId) => roleId.toString()),
			document.permissions.map((permissionId) => permissionId.toString())
		);
	}
}

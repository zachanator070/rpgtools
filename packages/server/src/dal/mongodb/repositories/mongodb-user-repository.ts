import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { User } from "../../../domain-entities/user";
import { UserDocument, UserModel } from "../models/user";
import { UserFactory, UserRepository } from "../../../types";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../../injectable-types";

@injectable()
export class MongodbUserRepository
	extends AbstractMongodbRepository<User, UserDocument>
	implements UserRepository
{
	@inject(INJECTABLE_TYPES.UserFactory)
	userFactory: UserFactory;

	model = UserModel;

	buildEntity(document: UserDocument): User {
		return this.userFactory(
			document._id.toString(),
			document.email,
			document.username,
			document.password,
			document.tokenVersion,
			document.currentWorld ? document.currentWorld.toString() : null,
			document.roles.map((roleId) => roleId.toString()),
			document.permissions.map((permissionId) => permissionId.toString())
		);
	}
}

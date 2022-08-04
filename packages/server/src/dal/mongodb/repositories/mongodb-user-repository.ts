import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { User } from "../../../domain-entities/user";
import { UserModel } from "../models/user";
import { UserDocument, UserFactory, UserRepository } from "../../../types";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../../di/injectable-types";

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
			{
				_id: document._id.toString(),
				email: document.email,
				username: document.username,
				password: document.password,
				tokenVersion: document.tokenVersion,
				currentWorld: document.currentWorld ? document.currentWorld.toString() : null,
				roles: document.roles.map((roleId) => roleId.toString()),
				permissions: document.permissions.map((permissionId) => permissionId.toString())
			}
		);
	}
}

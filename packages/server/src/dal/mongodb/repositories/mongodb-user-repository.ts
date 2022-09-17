import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { User } from "../../../domain-entities/user";
import {UserDocument, UserModel} from "../models/user";
import { UserFactory} from "../../../types";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../../di/injectable-types";
import {UserRepository} from "../../repository/user-repository";

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
				roles: document.roles.map((roleId) => roleId.toString())
			}
		);
	}
}

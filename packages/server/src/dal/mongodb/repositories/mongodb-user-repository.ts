import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { User } from "../../../domain-entities/user";
import {UserDocument, UserModel} from "../models/user";
import { UserFactory} from "../../../types";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../../di/injectable-types";
import {UserRepository} from "../../repository/user-repository";
import {FILTER_CONDITION_REGEX, FilterCondition} from "../../filter-condition";
import {PaginatedResult} from "../../paginated-result";

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

	findByUsernamePaginated(username: string, page: number): Promise<PaginatedResult<User>> {
		const conditions = [];
		if (username) {
			conditions.push(new FilterCondition("username", `^${username}*`, FILTER_CONDITION_REGEX));
		}
		return this.findPaginated(conditions, page);
	}

	findWithRole(roleId: string): Promise<User[]> {
		return this.find([new FilterCondition('roles', roleId)]);
	}

	findOneByUsername(username: string): Promise<User> {
		return this.findOne([
			new FilterCondition("username", username),
		]);
	}

	findByUsername(username: string): Promise<User[]> {
		return this.find([
			new FilterCondition("username", username),
		]);
	}

	findByEmail(email: string): Promise<User[]> {
		return this.find([new FilterCondition("email", email)]);
	}

}

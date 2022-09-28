import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { Role } from "../../../domain-entities/role";
import { inject, injectable } from "inversify";
import mongoose from "mongoose";
import {RoleDocument, RoleModel} from "../models/role";
import { INJECTABLE_TYPES } from "../../../di/injectable-types";
import {RoleRepository} from "../../repository/role-repository";
import {FILTER_CONDITION_REGEX, FilterCondition} from "../../filter-condition";
import {PaginatedResult} from "../../paginated-result";
import RoleFactory from "../../../domain-entities/factory/role-factory";

@injectable()
export class MongodbRoleRepository
	extends AbstractMongodbRepository<Role, RoleDocument>
	implements RoleRepository
{
	@inject(INJECTABLE_TYPES.RoleFactory)
	roleFactory: RoleFactory;

	model: mongoose.Model<any> = RoleModel;

	findOneByName(name: string): Promise<Role> {
		return this.findOne([new FilterCondition('name', name)]);
	}

	findByWorldAndNamePaginated(worldId: string, page: number, name?: string): Promise<PaginatedResult<Role>> {
		const conditions: FilterCondition[] = [];

		if (worldId) {
			conditions.push(new FilterCondition("world", worldId));
		}

		if (name) {
			conditions.push(new FilterCondition("name", name, FILTER_CONDITION_REGEX));
		}
		return this.findPaginated(conditions, page);
	}
}

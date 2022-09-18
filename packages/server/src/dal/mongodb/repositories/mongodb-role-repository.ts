import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { Role } from "../../../domain-entities/role";
import { inject, injectable } from "inversify";
import { RoleFactory} from "../../../types";
import mongoose from "mongoose";
import {RoleDocument, RoleModel} from "../models/role";
import { INJECTABLE_TYPES } from "../../../di/injectable-types";
import AclFactory from "./acl-factory";
import {RoleRepository} from "../../repository/role-repository";
import {FILTER_CONDITION_REGEX, FilterCondition} from "../../filter-condition";
import {PaginatedResult} from "../../paginated-result";

@injectable()
export class MongodbRoleRepository
	extends AbstractMongodbRepository<Role, RoleDocument>
	implements RoleRepository
{
	@inject(INJECTABLE_TYPES.RoleFactory)
	roleFactory: RoleFactory;

	model: mongoose.Model<any> = RoleModel;

	buildEntity(document: RoleDocument): Role {
		return this.roleFactory(
			{
				_id: document._id.toString(),
				name: document.name,
				world: document.world ? document.world.toString() : null,
				acl: AclFactory(document.acl)
			}
		);
	}

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

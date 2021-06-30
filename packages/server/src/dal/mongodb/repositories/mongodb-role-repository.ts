import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { Role } from "../../../domain-entities/role";
import { inject, injectable } from "inversify";
import { RoleFactory, RoleRepository } from "../../../types";
import { Model } from "mongoose";
import { RoleDocument, RoleModel } from "../models/role";
import { INJECTABLE_TYPES } from "../../../injectable-types";

@injectable()
export class MongodbRoleRepository
	extends AbstractMongodbRepository<Role, RoleDocument>
	implements RoleRepository
{
	@inject(INJECTABLE_TYPES.RoleFactory)
	roleFactory: RoleFactory;

	model: Model<any> = RoleModel;

	buildEntity(document: RoleDocument): Role {
		return this.roleFactory(
			document._id.toString(),
			document.name,
			document.world ? document.world.toString() : null,
			document.permissions.map((id) => id.toString())
		);
	}
}

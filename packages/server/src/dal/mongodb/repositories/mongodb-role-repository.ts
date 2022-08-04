import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { Role } from "../../../domain-entities/role";
import { inject, injectable } from "inversify";
import { RoleDocument, RoleFactory, RoleRepository } from "../../../types";
import mongoose from "mongoose";
import { RoleModel } from "../models/role";
import { INJECTABLE_TYPES } from "../../../di/injectable-types";

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
				permissions: document.permissions.map((id) => id.toString())
			}
		);
	}
}

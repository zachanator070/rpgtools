import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { Role } from "../../../domain-entities/role";
import { inject, injectable } from "inversify";
import { RoleFactory, RoleRepository } from "../../../types";
import mongoose from "mongoose";
import {RoleDocument, RoleModel} from "../models/role";
import { INJECTABLE_TYPES } from "../../../di/injectable-types";
import AclFactory from "./acl-factory";

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
}

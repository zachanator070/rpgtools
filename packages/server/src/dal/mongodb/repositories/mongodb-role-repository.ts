import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { Role } from "../../../domain-entities/role";
import { injectable } from "inversify";
import { RoleRepository } from "../../../types";
import { Model } from "mongoose";
import { RoleDocument, RoleModel } from "../models/role";

@injectable()
export class MongodbRoleRepository
	extends AbstractMongodbRepository<Role, RoleDocument>
	implements RoleRepository
{
	model: Model<any> = RoleModel;

	buildEntity(document: RoleDocument): Role {
		return new Role(
			document._id.toString(),
			document.name,
			document.world ? document.world.toString() : null,
			document.permissions.map((id) => id.toString())
		);
	}
}

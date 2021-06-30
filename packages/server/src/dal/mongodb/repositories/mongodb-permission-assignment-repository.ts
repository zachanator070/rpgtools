import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { PermissionAssignment } from "../../../domain-entities/permission-assignment";
import { inject, injectable } from "inversify";
import { PermissionAssignmentFactory, PermissionAssignmentRepository } from "../../../types";
import { Model } from "mongoose";
import {
	PermissionAssignmentDocument,
	PermissionAssignmentModel,
} from "../models/permission-assignment";
import { INJECTABLE_TYPES } from "../../../injectable-types";

@injectable()
export class MongodbPermissionAssignmentRepository
	extends AbstractMongodbRepository<PermissionAssignment, PermissionAssignmentDocument>
	implements PermissionAssignmentRepository
{
	@inject(INJECTABLE_TYPES.PermissionAssignmentFactory)
	permissionAssignmentFactory: PermissionAssignmentFactory;

	model: Model<any> = PermissionAssignmentModel;

	buildEntity(document: PermissionAssignmentDocument): PermissionAssignment {
		return this.permissionAssignmentFactory(
			document._id.toString(),
			document.permission,
			document.subject.toString(),
			document.subjectType
		);
	}
}

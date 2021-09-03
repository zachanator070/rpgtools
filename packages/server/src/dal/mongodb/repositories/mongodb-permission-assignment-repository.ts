import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { PermissionAssignment } from "../../../domain-entities/permission-assignment";
import { inject, injectable } from "inversify";
import {
	PermissionAssignmentDocument,
	PermissionAssignmentFactory,
	PermissionAssignmentRepository,
} from "../../../types";
import mongoose from "mongoose";
import { PermissionAssignmentModel } from "../models/permission-assignment";
import { INJECTABLE_TYPES } from "../../../injectable-types";

@injectable()
export class MongodbPermissionAssignmentRepository
	extends AbstractMongodbRepository<PermissionAssignment, PermissionAssignmentDocument>
	implements PermissionAssignmentRepository
{
	@inject(INJECTABLE_TYPES.PermissionAssignmentFactory)
	permissionAssignmentFactory: PermissionAssignmentFactory;

	model: mongoose.Model<any> = PermissionAssignmentModel;

	buildEntity(document: PermissionAssignmentDocument): PermissionAssignment {
		return this.permissionAssignmentFactory(
			document._id.toString(),
			document.permission,
			document.subject.toString(),
			document.subjectType
		);
	}
}

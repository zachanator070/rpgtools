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
import { INJECTABLE_TYPES } from "../../../di/injectable-types";

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
			{
				_id: document._id.toString(),
				permission: document.permission,
				subject: document.subject.toString(),
				subjectType: document.subjectType
			}
		);
	}
}

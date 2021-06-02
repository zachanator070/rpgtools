import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { PermissionAssignment } from "../../../domain-entities/permission-assignment";
import { injectable } from "inversify";
import { PermissionAssignmentRepository } from "../../../types";
import { Model } from "mongoose";
import {
	PermissionAssignmentDocument,
	PermissionAssignmentModel,
} from "../models/permission-assignment";

@injectable()
export class MongodbPermissionAssignmentRepository
	extends AbstractMongodbRepository<PermissionAssignment, PermissionAssignmentDocument>
	implements PermissionAssignmentRepository {
	model: Model<any> = PermissionAssignmentModel;

	buildEntity(document: PermissionAssignmentDocument): PermissionAssignment {
		return new PermissionAssignment(
			document._id.toString(),
			document.permission,
			document.subject.toString(),
			document.subjectType
		);
	}
}

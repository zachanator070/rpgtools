import { GraphqlDataloader } from "../graphql-dataloader";
import { injectable } from "inversify";
import { PermissionAssignment } from "../../domain-entities/permission-assignment";
import {Repository, UnitOfWork} from "../../types";

@injectable()
export class PermissionAssignmentDataLoader extends GraphqlDataloader<PermissionAssignment> {
	getRepository(unitOfWork: UnitOfWork): Repository<PermissionAssignment> {
		return unitOfWork.permissionAssignmentRepository;
	}

}

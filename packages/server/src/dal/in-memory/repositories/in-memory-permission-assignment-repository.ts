import { PermissionAssignment } from "../../../domain-entities/permission-assignment";
import { injectable } from "inversify";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository";

@injectable()
export class InMemoryPermissionAssignmentRepository extends AbstractInMemoryRepository<PermissionAssignment> {}

import { Role } from "../../../domain-entities/role";
import { injectable } from "inversify";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository";

@injectable()
export class InMemoryRoleRepository extends AbstractInMemoryRepository<Role> {}

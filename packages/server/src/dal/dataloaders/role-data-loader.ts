import { GraphqlDataloader } from "../graphql-dataloader.js";
import { Role } from "../../domain-entities/role.js";
import { injectable } from "inversify";
import {Repository} from "../repository/repository.js";
import {DatabaseContext} from "../database-context.js";

@injectable()
export class RoleDataLoader extends GraphqlDataloader<Role> {
	getRepository(databaseContext: DatabaseContext): Repository<Role> {
		return databaseContext.roleRepository;
	}

}

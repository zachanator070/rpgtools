import { GraphqlDataloader } from "../graphql-dataloader";
import { Role } from "../../domain-entities/role";
import { injectable } from "inversify";
import {Repository} from "../repository/repository";
import {DatabaseContext} from "../database-context";

@injectable()
export class RoleDataLoader extends GraphqlDataloader<Role> {
	getRepository(databaseContext: DatabaseContext): Repository<Role> {
		return databaseContext.roleRepository;
	}

}

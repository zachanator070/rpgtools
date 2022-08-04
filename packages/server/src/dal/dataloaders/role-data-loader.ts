import { GraphqlDataloader } from "../graphql-dataloader";
import { Role } from "../../domain-entities/role";
import { injectable } from "inversify";
import {Repository, UnitOfWork} from "../../types";

@injectable()
export class RoleDataLoader extends GraphqlDataloader<Role> {
	getRepository(unitOfWork: UnitOfWork): Repository<Role> {
		return unitOfWork.roleRepository;
	}

}

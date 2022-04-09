import { DbUnitOfWork } from "../dal/db-unit-of-work";
import { SecurityContext } from "../security/security-context";
import { Factory, UserRepository, UserService } from "../types";
import { inject, injectable } from "inversify";
import { User } from "../domain-entities/user";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import { FILTER_CONDITION_REGEX, FilterCondition } from "../dal/filter-condition";
import {PaginatedResult} from "../dal/paginated-result";
import {ANON_USERNAME} from "../../../common/src/permission-constants";

@injectable()
export class UserApplicationService implements UserService {
	@inject(INJECTABLE_TYPES.UserRepository)
	userRepository: UserRepository;

	@inject(INJECTABLE_TYPES.DbUnitOfWorkFactory)
	dbUnitOfWorkFactory: Factory<DbUnitOfWork>;

	setCurrentWorld = async (context: SecurityContext, worldId: string) => {
		if(context.user.username !== ANON_USERNAME){
			const unitOfWork = this.dbUnitOfWorkFactory();
			context.user.currentWorld = worldId;
			await unitOfWork.userRepository.update(context.user);
			await unitOfWork.commit();
		}
		return context.user;
	};

	getUsers = async (context: SecurityContext, username: string, page: number): Promise<PaginatedResult<User>> => {
		return this.userRepository.findPaginated([
			new FilterCondition("username", `^${username}*`, FILTER_CONDITION_REGEX),
		], page || 1);
	};
}

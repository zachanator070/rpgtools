import { DbUnitOfWork } from "../dal/db-unit-of-work";
import { SecurityContext } from "../security-context";
import { UserRepository, UserService } from "../types";
import { inject, injectable } from "inversify";
import { User } from "../domain-entities/user";
import { INJECTABLE_TYPES } from "../injectable-types";
import { FILTER_CONDITION_REGEX, FilterCondition } from "../dal/filter-condition";

@injectable()
export class UserApplicationService implements UserService {
	@inject(INJECTABLE_TYPES.UserRepository)
	userRepository: UserRepository;

	setCurrentWorld = async (context: SecurityContext, worldId: string) => {
		const unitOfWork = new DbUnitOfWork();
		context.user.currentWorld = worldId;
		await unitOfWork.userRepository.update(context.user);
		await unitOfWork.commit();
		return context.user;
	};

	getUsers = async (context: SecurityContext, username: string): Promise<User[]> => {
		return this.userRepository.find([
			new FilterCondition("username", `^${username}*`, FILTER_CONDITION_REGEX),
		]);
	};
}

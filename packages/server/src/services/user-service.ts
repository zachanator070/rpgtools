import { SecurityContext } from "../security/security-context";
import { injectable } from "inversify";
import { User } from "../domain-entities/user";
import {PaginatedResult} from "../dal/paginated-result";
import {ANON_USERNAME} from "@rpgtools/common/src/permission-constants";
import {UnitOfWork} from "../types";

@injectable()
export class UserService {

	setCurrentWorld = async (context: SecurityContext, worldId: string, unitOfWork: UnitOfWork) => {
		if(context.user.username !== ANON_USERNAME){
			context.user.currentWorld = worldId;
			await unitOfWork.userRepository.update(context.user);
			await unitOfWork.commit();
		}
		return context.user;
	};

	getUsers = async (context: SecurityContext, username: string, page: number, unitOfWork: UnitOfWork): Promise<PaginatedResult<User>> => {
		return unitOfWork.userRepository.findByUsernamePaginated(username, page);
	};
}

import { SecurityContext } from "../security/security-context.js";
import { injectable } from "inversify";
import { User } from "../domain-entities/user.js";
import {PaginatedResult} from "../dal/paginated-result.js";
import {ANON_USERNAME} from "@rpgtools/common/src/permission-constants";
import {DatabaseContext} from "../dal/database-context.js";

@injectable()
export class UserService {

	setCurrentWorld = async (context: SecurityContext, worldId: string, databaseContext: DatabaseContext) => {
		if(context.user.username !== ANON_USERNAME){
			context.user.currentWorld = worldId;
			await databaseContext.userRepository.update(context.user);
		}
		return context.user;
	};

	getUsers = async (context: SecurityContext, username: string, page: number, databaseContext: DatabaseContext): Promise<PaginatedResult<User>> => {
		return databaseContext.userRepository.findByUsernamePaginated(username, page);
	};
}

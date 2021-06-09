import { DbUnitOfWork } from "../dal/db-unit-of-work";
import { SecurityContext } from "../security-context";
import { UserService } from "../types";
import { injectable } from "inversify";

@injectable()
export class UserApplicationService implements UserService {
	setCurrentWorld = async (context: SecurityContext, worldId: string) => {
		const unitOfWork = new DbUnitOfWork();
		context.user.currentWorld = worldId;
		await unitOfWork.userRepository.update(context.user);
		await unitOfWork.commit();
		return context.user;
	};
}

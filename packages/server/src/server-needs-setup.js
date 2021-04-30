import { SERVER_ADMIN_ROLE } from "../../common/src/permission-constants";
import { User } from "./models/user";
import { Role } from "./models/role";

let needsSetup = false;

export const checkConfig = async () => {
	let adminRole = await Role.findOne({ name: SERVER_ADMIN_ROLE });
	if (!adminRole) {
		needsSetup = true;
		return;
	}
	const users = await User.find({ roles: adminRole });
	needsSetup = users.length === 0;
};

export const serverNeedsSetup = () => {
	return needsSetup;
};

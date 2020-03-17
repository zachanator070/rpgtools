import {PermissionAssignment} from "./models/permission-assignement";
import {Role} from './models/role';
import {User} from './models/user';

export const cleanUpPermissions = async (subjectId) => {
	const assignments = await PermissionAssignment.find({subject: subjectId});
	for(let assignment of assignments){
		const roles = await Role.find({permissions: assignment._id});
		for(let role of roles){
			role.permissions = role.permissions.filter((permission) => {return !permission._id.equals(assignment._id);});
			await role.save();
		}
		const users = await User.find({permissions: assignment._id});
		for(let user of users){
			user.permissions = user.permissions.filter((permission) => {return !permission._id.equals(assignment._id);});
			await user.save();
		}
		await PermissionAssignment.deleteOne({_id: assignment._id});
	}
};
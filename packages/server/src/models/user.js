import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2'
import {PERMISSION_ASSIGNMENT, ROLE, USER, WORLD} from "@rpgtools/common/src/type-constants";
import {Role} from "./role";
import {ALL_USERS, EVERYONE} from "@rpgtools/common/src/role-constants";
import {ANON_USERNAME} from "@rpgtools/common/src/permission-constants";
import {PermissionAssignment} from "./permission-assignement";

const Schema = mongoose.Schema;

const userSchema = new Schema({
	email: {
		type: String,
	},
	username: {
		type: String,
		required: [true, 'username field required'],
		validate: [(username) => {return username !== ANON_USERNAME;}, 'cannot save anonymous user']
	},
	password: {
		type: String,
	},
	tokenVersion: {
		type: String
	},
	currentWorld: {
		type: mongoose.Schema.ObjectId,
		ref: WORLD
	},
	roles: [{
		type: mongoose.Schema.ObjectId,
		ref: ROLE,
	}],
	permissions: [{
		type: mongoose.Schema.ObjectId,
		ref: PERMISSION_ASSIGNMENT,
		index: true
	}]
});

const getRolePermissions = async (user) => {
	const allPermissions = [];
	for(let role of user.roles){
		allPermissions.push(...role.permissions);
	}
	return allPermissions;
};

const getEveryonePermissions = async () => {
	const everyoneRoles = await Role.find({name: EVERYONE}).populate({path: 'permissions'});
	const permissions = [];
	for(let role of everyoneRoles){
		permissions.push(...role.permissions)
	}

	return permissions;
};

const getAllUserPermissions = async () => {
	const allUsersRole = await Role.findOne({name: ALL_USERS}).populate({path: 'permissions'});
	if(allUsersRole){
		return allUsersRole.permissions;
	}
	return [];
};


userSchema.virtual('allPermissions').get(function(){
	return this.permissions.concat(this.rolePermissions || []).concat(this.everyonePermissions  || []).concat(this.allUsersPermissions || []);
});
userSchema.virtual('rolePermissions');
userSchema.virtual('everyonePermissions');
userSchema.virtual('allUsersPermissions');

userSchema.methods.recalculateRolePermissions = async function(){
	this.rolePermissions = await getRolePermissions(this);
};

userSchema.methods.recalculateEveryonePermissions = async function(){
	this.everyonePermissions = await getEveryonePermissions();
};

userSchema.methods.recalculateAllUsersPermissions = async function(){
	this.allUsersPermissions = await getAllUserPermissions();
};

userSchema.methods.recalculateAllPermissions = async function(){
	await this.recalculateRolePermissions();
	await this.recalculateEveryonePermissions();
	await this.recalculateAllUsersPermissions();
};

userSchema.methods.hasPermission = async function (permission, subjectId) {
	if(subjectId instanceof String){
		subjectId = new mongoose.Types.ObjectId(subjectId);
	}

	if(subjectId instanceof mongoose.Model){
		subjectId = subjectId._id;
	}

	for (const userPermission of this.allPermissions) {
		let subject = userPermission.subject;
		if(subject instanceof mongoose.Model){
			subject = subject._id;
		}
		if (userPermission.permission === permission && userPermission.subject.equals(subjectId)) {
			return true;
		}
	}

	return false;
};

userSchema.methods.hasRole = async function (role){
	if(role instanceof String){
		role = new mongoose.Types.ObjectId(role);
	}

	if(role instanceof mongoose.Model){
		role = role._id;
	}

	for(let userRole of this.roles){
		if(userRole instanceof mongoose.Model){
			userRole = userRole._id;
		}
		if(userRole.equals(role)){
			return true;
		}
	}
	return false;
};

userSchema.methods.grantPermission = async function (permission, subjectId, subjectType){
	if(await this.hasPermission(permission, subjectId)){
		return;
	}
	let assignemnt = await PermissionAssignment.findOne({permission, subject: subjectId});
	if(!assignemnt){
		assignemnt = await PermissionAssignment.create({permission, subject: subjectId, subjectType});
	}
	this.permissions.push(assignemnt);
	await this.save();

};

userSchema.methods.revokePermission = async function (permission, subjectId){
	if(!await this.hasPermission(permission, subjectId)){
		return;
	}

	if(subjectId instanceof String){
		subjectId = new mongoose.Types.ObjectId(subjectId);
	}

	if(subjectId instanceof mongoose.Model){
		subjectId = subjectId._id;
	}

	let foundAssignment = null;
	for(let assignment of this.permissions){
		if(assignment.subject instanceof mongoose.Types.ObjectId && assignment.subject.equals(subjectId)){
			foundAssignment = assignment;
			break;
		}
		else if(assignment.subject._id.equals(subjectId)){
			foundAssignment = assignment;
			break;
		}
	}
	if(foundAssignment){
		this.permissions = this.permissions.filter(assignemnt => !assignemnt._id.equals(foundAssignment._id));
		await this.save();
	}
};

userSchema.plugin(mongoosePaginate);

export const User = mongoose.model(USER, userSchema);

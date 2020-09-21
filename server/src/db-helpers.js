import {PermissionAssignment} from "./models/permission-assignement";
import {Role} from './models/role';
import {User} from './models/user';
import {GridFSBucket} from "mongodb";
import mongoose from "mongoose";

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

export const createGfsFile = async (filename, readStream) => {
	return new Promise((resolve, reject) => {

		const gfs = new GridFSBucket(mongoose.connection.db);
		const writeStream = gfs.openUploadStream(filename);

		writeStream.on('finish', (file) => {
			resolve(file._id);
		});

		writeStream.on('error', (err) => {
			reject(err);
			throw err;
		});

		readStream.pipe(writeStream);
	});
};
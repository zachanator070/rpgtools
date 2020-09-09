import {World} from "../../models/world";
import {MODEL_ADD, MODEL_ADMIN, MODEL_RW} from "../../../../common/src/permission-constants";
import {GridFSBucket} from "mongodb";
import mongoose from "mongoose";
import {Model} from "../../models/model";
import {PermissionAssignment} from "../../models/permission-assignement";
import {MODEL} from "../../../../common/src/type-constants";

export const modelMutations = {
	createModel: async (_, {name, file, worldId, depth, width, height}, {currentUser}) => {
		if(!await currentUser.hasPermission(MODEL_ADD, worldId)){
			throw new Error('You do not have permission to add models to this world');
		}

		const world = await World.findById(worldId);
		if(!world){
			throw new Error(`World with id ${worldId} does not exist`);
		}

		file = await file;
		const readStream = file.createReadStream();

		const fileId = await new Promise((resolve, reject) => {
			const gfs = new GridFSBucket(mongoose.connection.db);

			const writeStream = gfs.openUploadStream(file.filename);

			writeStream.on('finish', (file) => {
				resolve(file._id);
			});


			writeStream.on('error', (err) => {
				reject(err);
				throw err;
			});

			readStream.pipe(writeStream);

		});

		const model = await Model.create({name, fileId, world, depth, width, height});
		for(let permission of [MODEL_RW, MODEL_ADMIN]){
			const permissionAssignment = await PermissionAssignment.create({permission, subject: model, subjectType: MODEL});
			currentUser.permissions.push(permissionAssignment);
		}
		await currentUser.save();
		return model;

	}
};
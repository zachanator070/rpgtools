import {authenticated} from "../authentication-helpers";
import {World} from '../models/world';
import {User} from '../models/user';
import {Role} from '../models/role';
import {WIKI_READ_ALL, WORLD_READ} from "../../permission-constants";
import {EVERYONE} from "../../role-constants";
import mongoose from 'mongoose';
import {PermissionAssignment} from "../models/permission-assignement";
import {WikiPage} from "../models/wiki-page";
import {WikiFolder} from "../models/wiki-folder";

export default {
	currentUser: authenticated((parent, args, context) => context.currentUser),
    world: async (parent, {worldId, name}, {currentUser}) => {
		let world = null;
		if(worldId){
            world = await World.findOne({_id: worldId});
        }
		if(name){
            world = await World.findOne({name: worldId});
        }
		if (!world) {
			return null;
		}

		if (!await world.userCanRead(currentUser)) {
			return null;
		}

		return world;
	},
	worlds: async (_, {page}, {currentUser}) => {

		const PAGE_SIZE = 2;

		let userRoles = currentUser ? currentUser.roles : [];
		let userPermissions = currentUser ? currentUser.permissions : [];
		for(let userRole of userRoles){
			userPermissions.push(...userRole.permissions);
		}
		userPermissions = userPermissions.filter(permission => permission.permission === WORLD_READ);
		const worldsUserCanRead = userPermissions.map(permission => new mongoose.Types.ObjectId(permission.subjectId));
		const worldAggregate = World.aggregate([
			{
				'$lookup': {
					'from': 'roles',
					'localField': 'roles',
					'foreignField': '_id',
					'as': 'roles'
				}
			}, {
				'$unwind': {
					'path': '$roles'
				}
			}, {
				'$lookup': {
					'from': 'permissionassignments',
					'localField': 'roles.permissions',
					'foreignField': '_id',
					'as': 'roles.permissions'
				}
			}, {
				'$group': {
					'_id': '$_id',
					'roles': {
						'$push': '$roles'
					},
					'name': {
						'$first': '$name'
					},
					'rootFolder': {
						'$first': '$rootFolder'
					},
					'wikiPage': {
						'$first': '$wikiPage'
					}
				}
			}, {
				'$project': {
					'roles': {
						'$filter': {
							'input': '$roles',
							'as': 'role',
							'cond': {
								'$eq': [
									'$$role.name', EVERYONE
								]
							}
						}
					},
					'name': true,
					'rootFolder': true,
					'wikiPage': true
				}
			}, {
				'$match': {
					'$or': [
						{
							'roles.permissions.permission': WIKI_READ_ALL
						}, {
							'_id': {
								'$in': worldsUserCanRead
							}
						}
					]
				}
			}
		]);

		if(!page){
			page = 1;
		}
		return await World.aggregatePaginate(worldAggregate, {
			page: page,
			limit: PAGE_SIZE
		});
	},
	searchWikiPages: async (_, {phrase, worldId}, {currentUser}) => {
		const foundWikis = await WikiPage.find({ $regex: `^${phrase}.*` , $options: 'i'});
		const returnWikis = [];
		for(let wiki of foundWikis){
			if(await wiki.userCanRead(currentUser)){
				returnWikis.push(wiki);
			}
		}
		return returnWikis;
	},
	wiki: async (_, {wikiId}, {currentUser}) => {
		const foundWiki = await WikiPage.findOne({_id: wikiId});
		if(foundWiki && ! await foundWiki.userCanRead(currentUser)){
			throw new Error(`You do not have permission to read wiki ${wikiId}`);
		}
		return foundWiki;
	},
	usersWithPermissions: authenticated( async (_, {permissions, subjectId}, {currentUser}) => {
		const users = [];
		for(let permission of permissions){
			const permissionAssignments = (await PermissionAssignment.find({permission: permission.permission, subjectId: permission.subjectId})).map(assignment => assignment._id);
			if(permissionAssignments.length > 0){
				for(let permissionAssignment of permissionAssignments){
					if(!await permissionAssignment.userCanRead(currentUser)){
						throw new Error(`You do not have administrative rights for the permission "${permissionAssignment.permission}" for the subject ${permissionAssignment.subjectId}`);
					}
				}
				users.push(... await User.find({permissions: {$in: permissionAssignments}}));
			}
		}

		return users;

	}),
	rolesWithPermissions: authenticated( async (_, {permissions, subjectId}, {currentUser}) => {
		const roles = [];
		for(let permission of permissions){
			const permissionAssignments = (await PermissionAssignment.find({permission: permission.permission, subjectId: permission.subjectId})).map(assignment => assignment._id);
			if(permissionAssignments.length > 0){
				for(let permissionAssignment of permissionAssignments){
					if(!await permissionAssignment.userCanRead(currentUser)){
						throw new Error(`You do not have administrative rights for the permission "${permissionAssignment.permission}" for the subject ${permissionAssignment.subjectId}`);
					}
				}
				roles.push(... await Role.find({permissions: {$in: permissionAssignments}}));
			}
		}
		return roles;
	})

};
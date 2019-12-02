import {authenticated} from "../authentication-helpers";
import {userHasPermission} from "../authorization-helpers";
import {World} from '../models/world';
import {ROLE_ADMIN, WIKI_READ_ALL, WORLD_READ} from "../../permission-constants";
import {EVERYONE} from "../../role-constants";
import mongoose from 'mongoose';

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
		else{
            await world.populate({path: 'wikiPage'}).populate({path: 'rootFolder'}).execPopulate();
        }

		if (!await userHasPermission(currentUser, WORLD_READ, worldId, worldId)) {
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
		const worldsUserCanRead = userPermissions.map(permission => new mongoose.Types.ObjectId(permission.subject));
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

};
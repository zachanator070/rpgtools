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
import {Place} from '../models/place';
import {PLACE} from "../../wiki-page-types";

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
		const results = await World.aggregatePaginate(worldAggregate, {
			page: page,
			limit: PAGE_SIZE
		});
		// convert objects to mongoose Models
		const docs = [];
		for(let world of results.docs){
			docs.push(await World.findById(world._id));
		}
		results.docs = docs;
		return results;
	},
	searchWikiPages: async (_, {phrase, worldId}, {currentUser}) => {
		const foundWikis = await WikiPage.find({name: { $regex: `^${phrase}.*` , $options: 'i'}});
		const returnWikis = [];
		for(let wiki of foundWikis){
			if(await wiki.userCanRead(currentUser)){
				returnWikis.push(wiki);
			}
		}
		return returnWikis;
	},
	wiki: async (_, {wikiId}, {currentUser}) => {
		let foundWiki = await WikiPage.findOne({_id: wikiId});
		if(foundWiki && ! await foundWiki.userCanRead(currentUser)){
			throw new Error(`You do not have permission to read wiki ${wikiId}`);
		}
		if(foundWiki.type === PLACE){
			foundWiki = await Place.findById(wikiId).populate('mapImage coverImage');
		}

		return foundWiki;
	},
	users: async (_, {username}, {currentUser}) => {
		return User.find({username: { $regex: `^${username}.*` , $options: 'i'}});
	},
	roles: async (_, {name}, {currentUser}) => {
		return Role.find({username: { $regex: `^${name}.*` , $options: 'i'}});
	}
};
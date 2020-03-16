import {World} from '../models/world';
import {User} from '../models/user';
import {Role} from '../models/role';
import {WIKI_READ_ALL, WORLD_READ} from "../../permission-constants";
import {EVERYONE} from "../../role-constants";
import {WikiPage} from "../models/wiki-page";
import {Place} from '../models/place';
import {PLACE} from "../../type-constants";
import {ServerConfig} from '../models/server-config';

export default {
	currentUser: (parent, args, context) => context.currentUser,
	serverConfig: async (_, __, {currentUser}) => {
		return ServerConfig.findOne().populate('admins');
	},
    world: async (parent, {worldId}, {currentUser}) => {
       const world = await World.findOne({_id: worldId});
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
		const worldsUserCanRead = userPermissions.map(permission => permission.subject);
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
	wikis: async (_, {name, worldId, type}, {currentUser}) => {
		const searchParams = {name: { $regex: `^${name}.*` , $options: 'i'}};
		if(type){
			searchParams.type = type;
		}
		const foundWikis = await WikiPage.paginate(searchParams);
		const returnWikis = [];
		for(let wiki of foundWikis.docs){
			if(await wiki.userCanRead(currentUser)){
				returnWikis.push(wiki);
			}
		}
		foundWikis.docs = returnWikis;
		return foundWikis;
	},
	users: async (_, {username}, {currentUser}) => {
		return User.paginate({username: { $regex: `^${username}.*` , $options: 'i'}});
	},
	roles: async (_, {worldId, name}, {currentUser}) => {
		return Role.paginate({world: worldId, name: { $regex: `^${name}.*` , $options: 'i'}});
	}
};
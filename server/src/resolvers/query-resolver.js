import {World} from '../models/world';
import {User} from '../models/user';
import {Role} from '../models/role';
import {WIKI_READ_ALL, WORLD_READ} from "../../../common/src/permission-constants";
import {EVERYONE} from "../../../common/src/role-constants";
import {WikiPage} from "../models/wiki-page";
import {Place} from '../models/place';
import {PLACE} from "../../../common/src/type-constants";
import {ServerConfig} from '../models/server-config';
import {Game} from "../models/game";

export default {
	currentUser: (parent, args, context) => context.currentUser,
	serverConfig: async () => {
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
		// NOTE: unsure that this is actually more efficient than using World.find and filtering based on permissions the
		// user has in currentUser.allPermissions
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
			docs.push(await World.findById(world._id).populate('wikiPage'));
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
	users: async (_, {username}) => {
		return User.paginate({username: { $regex: `^${username}.*` , $options: 'i'}});
	},
	game: async (_, {gameId}, {currentUser}) => {
		const foundGame = await Game.findById(gameId);
		if(foundGame && !await foundGame.userCanRead(currentUser)){
			throw new Error('You do not have permission to read this game');
		}
		return foundGame;
	}
};
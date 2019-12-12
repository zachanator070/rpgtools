import QueryResolver from "./query-resolver";
import MutationResolver from "./mutations/mutation-resolver";

export const serverResolvers = {
	Query: QueryResolver,
	Mutation: MutationResolver,
	World: {
		roles: async (world, _, {currentUser}) => {
			let roles = [];
			for(let role of world.roles){
				if(await role.userCanRead(currentUser)){
					roles.push(role);
				}
			}
			return roles;
		},
		rootFolder: async (world, _, {currentUser}) => {
			if(await world.rootFolder.userCanRead(currentUser)){
				return world.rootFolder;
			}
			return null;
		},
		wikiPage: async (world, _, {currentUser}) => {
			if(await world.wikiPage.userCanRead(currentUser)){
				return world.wikiPage;
			}
			return null;
		},
		canWrite: async (world, _, {currentUser}) => {
			return await world.userCanWrite(currentUser);
		},
	},
	User: {
		email: async (user, _, {currentUser}) => {
			if(!user._id.equals(currentUser._id)){
				return '';
			}
			return user.email;
		},
		roles: async (user, _, {currentUser}) => {
			if(user._id.equals(currentUser._id)){
				return user.roles;
			}
			const roles = [];
			for(let role of user.roles){
				if(await role.userCanRead(currentUser)){
					roles.push(role)
				}
			}
			return roles;
		},
		permissions: async (user, _, {currentUser}) => {
			if(user._id.equals(currentUser._id)){
				return user.permissions;
			}
			const permissions = [];
			for(let permission of user.permissions){
				if(await permission.userCanRead(currentUser)){
					permissions.push(permission);
				}
			}
			return permissions;
		},
		currentWorld: async (user, _, {currentUser}) => {
			if(!user._id.equals(currentUser._id)){
				return null;
			}
			return user.currentWorld;
		}
	},
	Role: {
		permissions: async (role, _, {currentUser}) => {
			await role.populate('permissions');
			const permissions = [];
			for(let permission of role.permissions){
				if(await permission.userCanWrite(currentUser)){
					permissions.push(permission);
				}
			}
			return permissions;
		},
	},
	WikiPage: {
		__resolveType: async (page, {currentUser}, info) => {
			return page.type;
		},
		canWrite: async (page, _, {currentUser}) => {
			return await page.userCanWrite(currentUser);
		},
	},
	WikiFolder: {
		children: async (folder, _, {currentUser}) => {
			const children = [];
			for(let child of folder.children){
				if(await child.userCanRead(currentUser)){
					children.push(child);
				}
			}
			return children;
		},
		pages: async (folder, _, {currentUser}) => {
			const pages = [];
			for(let page of folder.pages){
				if(await page.userCanRead(currentUser)){
					pages.push(page);
				}
			}
			return pages;
		},
		canWrite: async (folder, _, {currentUser}) => {
			return await folder.userCanWrite(currentUser);
		},
	},
	Person: {
		canWrite: async (person, _, {currentUser}) => {
			return await person.userCanWrite(currentUser);
		},
	},
	Place: {
		canWrite: async (place, _, {currentUser}) => {
			return await place.userCanWrite(currentUser);
		},
	},
	Image: {
		canWrite: async (image, _, {currentUser}) => {
			return await image.userCanWrite(currentUser);
		},
	}
};
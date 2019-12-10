import {authorizationResolver} from "./authorization-resolver";

test('create role', async () => {

	const cases = [
		{
			userHasPermission: true,
			name: 'name',
			worldId: '123',
			worldFound: true,
			success: true
		},
		{
			userHasPermission: false,
			name: 'name',
			worldId: '123',
			worldFound: true,
			success: false
		},
		{
			userHasPermission: true,
			name: 'name',
			worldId: '123',
			worldFound: false,
			success: false
		}
	];

	for(let testCase of cases){
		const userHasPermission = (user, permission, subject) => {
			return testCase.userHasPermission;
		};
		const World = {
			findById: (options) => {
				return {
					populate: async (path) => {
						if(testCase.worldFound){
							return {
								_id: testCase.worldId,
								roles: [],
								save: async () => {}
							};
						}
					}
				}
			},
		};

		const createdRole = {
			_id: '123'
		};

		const Role = {
			create: async (options) => {
				return createdRole;
			}
		};

		try{
			expect(await authorizationResolver.createRole({}, {...testCase}, {currentUser: {}, imports: {World, Role, userHasPermission}})).toBe(createdRole);
		} catch (error) {
			if(testCase.success){
				throw error;
			}
		}
	}

});
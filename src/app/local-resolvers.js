import gql from "graphql-tag";

const LOGIN_MODAL_VISIBILITY = gql`
    query{
        loginModalVisibility @client
    }
`;

const REGISTER_MODAL_VISIBILITY = gql`
    query{
        registerModalVisibility @client
    }
`;

const CREATE_WORLD_MODAL_VISIBILITY = gql`
    query{
        createWorldModalVisibility @client
    }
`;

const SELECT_WORLD_MODAL_VISIBILITY = gql`
    query {
        selectWorldModalVisibility @client
    }
`;

const SET_CURRENT_WORLD = gql`
	mutation setCurrentWorld($worldId: ID!){
        setCurrentWorld(worldId: $worldId){
            currentWorld {
                _id
				name
				wikiPage {
					name
					_id
				}
				rootFolder{
					_id
					name
					children{
						_id
					}
					pages{
						_id
						name
						type
					}
				}
				roles{
					_id
					name
					world{
						_id
					}
					permissions{
						permission
						subjectId
					}
				}
			}
	    }
    }
`;

const GET_CURRENT_USER = gql`
	query {
		currentUser {
			currentWorld {
				_id
			}
		}
	}	
`;

export default {
	Mutation: {
		setLoginModalVisibility: (_root, {visibility}, {client, cache}) => {
			cache.writeQuery({query: LOGIN_MODAL_VISIBILITY, data: {loginModalVisibility: visibility}});
			return visibility;
		},
		setRegisterModalVisibility: (_root, {visibility}, {client, cache}) => {
			cache.writeQuery({query: REGISTER_MODAL_VISIBILITY, data: {registerModalVisibility: visibility}});
			return visibility;
		},
		setCreateWorldModalVisibility: (_root, {visibility}, {client, cache}) => {
			cache.writeQuery({query: CREATE_WORLD_MODAL_VISIBILITY, data: {createWorldModalVisibility: visibility}});
			return visibility;
		},
		setSelectWorldModalVisibility: (_root, {visibility}, {client, cache}) => {
			cache.writeQuery({query: SELECT_WORLD_MODAL_VISIBILITY, data: {selectWorldModalVisibility: visibility}});
			return visibility;
		},
		setCurrentWorld: async (_root, {worldId}, {client, cache}) => {
			const response = await client.mutate({mutation: SET_CURRENT_WORLD, variables: {worldId}});
			await cache.readQuery({query: GET_CURRENT_USER});
			cache.writeData({data: {currentWorld: response.data.setCurrentWorld.currentWorld}});
		}
	},
};
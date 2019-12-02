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
    query{
        selectWorldModalVisibility @client
    }
`;

const GET_WORLD_QUERY = gql`
    query{
        currentWorld @client {
            _id
            name   
            
        }
    }
`;

export default {
	Mutation: {
		setLoginModalVisibility: (_root, {visibility}, {client, cache}) => {
			cache.writeQuery({query: LOGIN_MODAL_VISIBILITY, data: {loginModalVisibility: visibility}})
		},
		setRegisterModalVisibility: (_root, {visibility}, {client, cache}) => {
			cache.writeQuery({query: REGISTER_MODAL_VISIBILITY, data: {registerModalVisibility: visibility}})
		},
		setCreateWorldModalVisibility: (_root, {visibility}, {client, cache}) => {
			cache.writeQuery({query: CREATE_WORLD_MODAL_VISIBILITY, data: {createWorldModalVisibility: visibility}})
		},
		setSelectWorldModalVisibility: (_root, {visibility}, {client, cache}) => {
			cache.writeQuery({query: SELECT_WORLD_MODAL_VISIBILITY, data: {selectWorldModalVisibility: visibility}})
		},
		setCurrentWorld: async (_root, {id}, {client, cache, getCacheKey}) => {
			const {data, error} = await client.query(GET_WORLD_QUERY, {variables: {id: id}});
			cache.writeData({data: {currentWorld: data.world}});
		},
	},
};
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

export default {
	Mutation: {
		setLoginModalVisibility: (_root, {visibility}, {client, cache}) => {
			cache.writeData({data: {loginModalVisibility: visibility}});
			return visibility;
		},
		setRegisterModalVisibility: (_root, {visibility}, {client, cache}) => {
			cache.writeData({data: {registerModalVisibility: visibility}});
			return visibility;
		},
		setCreateWorldModalVisibility: (_root, {visibility}, {client, cache}) => {
			cache.writeData({data: {createWorldModalVisibility: visibility}});
			return visibility;
		},
		setSelectWorldModalVisibility: (_root, {visibility}, {client, cache}) => {
			cache.writeData({data: {selectWorldModalVisibility: visibility}});
			return visibility;
		}
	},
};
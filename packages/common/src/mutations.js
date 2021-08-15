import gql from "graphql-tag";

export const CREATE_IMAGE = gql`
	mutation createImage($file: Upload!, $worldId: ID!, $chunkify: Boolean) {
		createImage(file: $file, worldId: $worldId, chunkify: $chunkify) {
			_id
		}
	}
`;
export const LOGIN_QUERY = gql`
	mutation login($username: String!, $password: String!) {
		login(username: $username, password: $password) {
			_id
		}
	}
`;
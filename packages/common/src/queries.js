import gql from "graphql-tag";
import { ACCESS_CONTROL_LIST, CURRENT_WORLD_ROLES } from "./gql-fragments";

export const GET_CURRENT_USER = gql`
	query currentUser{
		currentUser {
			_id
			username
			email
			currentWorld {
				_id
				wikiPage {
					_id
				}
			}
			roles {
				_id
				name
			}
		}
	}
`;
export const ADD_USER_ROLE = gql`
	${ACCESS_CONTROL_LIST}
	${CURRENT_WORLD_ROLES}
	mutation addUserRole($userId: ID!, $roleId: ID!){
		addUserRole(userId: $userId, roleId: $roleId){
			_id
			...accessControlList
			...currentWorldRoles		
		}
	}
`;

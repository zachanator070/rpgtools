import gql from "graphql-tag";
import {useQuery} from "@apollo/react-hooks";
import {USERS_WITH_PERMISSIONS} from "../../../common/src/gql-queries";

const PERMISSION_EDITOR_SUBJECT = gql`
    query {
        permissionEditorSubject @client {
            _id
            ${USERS_WITH_PERMISSIONS}
            ... on World {
                name
            }
            ... on WikiPage {
                name 
            }
        }
    }
`;

export default () => {
	const {data, loading, error}  = useQuery(PERMISSION_EDITOR_SUBJECT);
	return {
		permissionEditorSubject: data ? data.permissionEditorSubject : null,
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	};
}
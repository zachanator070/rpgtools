import gql from "graphql-tag";
import {useQuery} from "@apollo/react-hooks";

const PERMISSION_EDITOR_SUBJECT_TYPE = gql`
    query {
        permissionEditorSubjectType @client
    }
`;

export default () => {
	const {data, loading, error}  = useQuery(PERMISSION_EDITOR_SUBJECT_TYPE);
	return {
		permissionEditorSubjectType: data ? data.permissionEditorSubjectType : null,
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	};
}
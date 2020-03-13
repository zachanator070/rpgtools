import {useMutation} from "@apollo/react-hooks";
import gql from "graphql-tag";

const SET_PERMISSION_EDITOR_SUBJECT_TYPE = gql`
    mutation setPermissionEditorSubjectType($subjectType: String!){
        setPermissionEditorSubjectType(subjectType: $subjectType) @client
    }
`;

export default () => {
	const [setPermissionEditorSubjectType, {data, loading, error}] = useMutation(SET_PERMISSION_EDITOR_SUBJECT_TYPE);
	return {
		setPermissionEditorSubjectType: async (subjectType) => {await setPermissionEditorSubjectType({variables: {subjectType}})},
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		subjectType: data ? data.setPermissionEditorSubjectType : null
	};
};
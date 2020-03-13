import {useMutation} from "@apollo/react-hooks";
import gql from "graphql-tag";

const SET_PERMISSION_EDITOR_SUBJECT = gql`
    mutation setPermissionEditorSubject($subject: PermissionControlled!){
        setPermissionEditorSubject(subject: $subject) @client
    }
`;

export default () => {
	const [setPermissionEditorSubject, {data, loading, error}] = useMutation(SET_PERMISSION_EDITOR_SUBJECT);
	return {
		setPermissionEditorSubject: async (subject) => {await setPermissionEditorSubject({variables: {subject}})},
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		subject: data ? data.setPermissionEditorSubject : null
	};
};
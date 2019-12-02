import {useMutation} from "@apollo/react-hooks";
import gql from "graphql-tag";

const SET_LOGIN_MODAL_VISIBILITY = gql`
    mutation setLoginModalVisibility($visibility: Boolean!){
        setLoginModalVisibility(visibility: $visibility) @client
    }
`;

export default () => {
	return useMutation(SET_LOGIN_MODAL_VISIBILITY);
};
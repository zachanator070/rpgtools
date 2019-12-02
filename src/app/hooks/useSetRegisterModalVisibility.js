import {useMutation} from "@apollo/react-hooks";
import gql from "graphql-tag";

const SET_REGISTER_MODAL_VISIBILITY = gql`
    mutation setRegisterModalVisibility($visibility: Boolean!){
        setRegisterModalVisibility(visibility: $visibility) @client
    }
`;

export default () => {
	return useMutation(SET_REGISTER_MODAL_VISIBILITY);
};
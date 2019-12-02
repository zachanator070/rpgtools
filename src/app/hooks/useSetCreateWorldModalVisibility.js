import {useMutation} from "@apollo/react-hooks";
import gql from "graphql-tag";

const SET_CREATE_WORLD_MODAL_VISIBILITY = gql`
    mutation setCreateWorldModalVisibility($visibility: Boolean!){
        setCreateWorldModalVisibility(visibility: $visibility) @client
    }
`;

export default () => {
	return useMutation(SET_CREATE_WORLD_MODAL_VISIBILITY);
};
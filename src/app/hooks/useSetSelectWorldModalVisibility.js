import {useMutation} from "@apollo/react-hooks";
import gql from "graphql-tag";

const SET_SELECT_WORLD_MODAL_VISIBILITY = gql`
    mutation setSelectWorldModalVisibility($visibility: Boolean!){
        setSelectWorldModalVisibility(visibility: $visibility) @client
    }
`;

export default () => {
	return useMutation(SET_SELECT_WORLD_MODAL_VISIBILITY);
};
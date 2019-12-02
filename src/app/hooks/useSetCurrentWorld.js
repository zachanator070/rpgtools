import gql from "graphql-tag";
import {useMutation} from "@apollo/react-hooks";

const SET_CURRENT_WORLD = gql`
    mutation setCurrentWorld($id: Int!){
        setCurrentWorld(id: $id) @client
    }
`;

export default () => {
	return useMutation(SET_CURRENT_WORLD);
}

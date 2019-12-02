import gql from "graphql-tag";
import {useMutation} from "@apollo/react-hooks";

const SET_CURRENT_WIKI = gql`
    mutation setCurrentWiki($id: Int!){
        setCurrentWiki(id: $id) @client
    }    
`;

export default () => {
	return useMutation(SET_CURRENT_WIKI);
}
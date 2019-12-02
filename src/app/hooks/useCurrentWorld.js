import gql from "graphql-tag";
import {useQuery} from "@apollo/react-hooks";

const GET_CURRENT_WORLD = gql`
    query {
        currentWorld @client
    }
`;

export default () => {
	return useQuery(GET_CURRENT_WORLD);
}
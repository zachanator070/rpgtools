import {useQuery} from "@apollo/react-hooks";
import gql from "graphql-tag";

const GET_CURRENT_USER = gql`
    query {
        currentUser {
            _id
            username
            email
        }
    }
`;

export default () => {
	return useQuery(GET_CURRENT_USER);
}
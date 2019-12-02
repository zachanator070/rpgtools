import gql from "graphql-tag";
import {useQuery} from "@apollo/react-hooks";

const LOGIN_MODAL_VISIBILITY = gql`
    query {
        loginModalVisibility @client
    }
`;

export default () => {
	return useQuery(LOGIN_MODAL_VISIBILITY);
}
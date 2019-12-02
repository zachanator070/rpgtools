import gql from "graphql-tag";
import {useQuery} from "@apollo/react-hooks";

const REGISTER_MODAL_VISIBILITY = gql`
    query {
        registerModalVisibility @client
    }
`;

export default () => {
	return useQuery(REGISTER_MODAL_VISIBILITY);
}
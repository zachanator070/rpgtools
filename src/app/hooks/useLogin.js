import {useMutation} from "@apollo/react-hooks";
import gql from "graphql-tag";
import useCurrentUser from "./useCurrentUser";

const LOGIN_QUERY = gql`
    mutation login($username: String!, $password: String!){
        login(username: $username, password: $password){
            _id
        }
    }
`;

export default (callback) => {
	const {refetch} = useCurrentUser();
	return useMutation(LOGIN_QUERY, {
		async update(cache, {data: login}) {
			refetch();
		},
		onCompleted: callback
	});
}
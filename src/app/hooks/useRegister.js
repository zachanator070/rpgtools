import {useMutation} from "@apollo/react-hooks";
import gql from "graphql-tag";

const REGISTER_MUTATION = gql`
    mutation register($email: String!, $username: String!, $password: String!){
        register(email: $email, username: $username, password: $password){
            _id
        }
    }
`;

export default (callback) => {
	return useMutation(REGISTER_MUTATION, {onCompleted: callback})
}
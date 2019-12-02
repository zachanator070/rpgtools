import {useMutation} from "@apollo/react-hooks";
import gql from "graphql-tag";
import useCurrentUser from "./useCurrentUser";

export const CREATE_WORLD = gql`
    mutation createWorld($name: String!, $public: Boolean!){
        createWorld(name: $name, public: $public){
            _id
        }
    }
`;

export default (callback) => {
	const {refetch} = useCurrentUser();
	return useMutation(CREATE_WORLD, {
		async update(cache, data) {
			await refetch();
			cache.writeData({data: {currentWorld: data.createWorld._id}});
		}
	});
}
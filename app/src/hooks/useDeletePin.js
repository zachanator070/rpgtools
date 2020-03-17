import gql from "graphql-tag";
import {useMutation} from "@apollo/react-hooks";

const DELETE_PIN = gql`
	mutation deletePin($pinId: ID!){
		deletePin(pinId: $pinId){
			map {
				_id
				world{
					_id
					pins{
						_id
						canWrite
						page{
							_id
						}
						map{
							_id
						}
						x
						y
					}
				}
			}
			page {
				_id
			}
		}
	}
`;

export const useDeletePin = () => {
	const [deletePin, {loading, data, error}] = useMutation(DELETE_PIN);
	return {
		deletePin: async (pinId) => {
			return deletePin({variables: {pinId}});
		},
		loading,
		pin: data ? data.deletePin : [],
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	}
};
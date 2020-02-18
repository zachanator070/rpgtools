import gql from "graphql-tag";
import {useMutation} from "@apollo/react-hooks";

const UPDATE_PIN = gql`
	mutation updatePin($pinId: ID!, $pageId: ID){
		updatePin(pinId: $pinId, pageId: $pageId){
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

export const useUpdatePin = () => {
	const [updatePin, {loading, data, error}] = useMutation(UPDATE_PIN);
	return {
		updatePin: async (pinId, pageId) => {
			return updatePin({variables: {pinId, pageId}});
		},
		loading,
		pin: data ? data.updatePin : [],
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	}
};
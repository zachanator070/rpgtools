import {useMutation} from "@apollo/react-hooks";
import gql from "graphql-tag";
import {CURRENT_WORLD_ROLES} from "./useCurrentWorld";

const GENERATE_REGISTER_CODES = gql`
	mutation generateRegisterCodes($amount: Int!){
		generateRegisterCodes(amount: $amount){
			_id
			registerCodes
		}
	}
`;

export const useGenerateRegisterCodes = () => {
	const [generateRegisterCodes, {data, loading, error}] = useMutation(GENERATE_REGISTER_CODES);
	return {
		generateRegisterCodes: async (amount) => {
			return await generateRegisterCodes({variables: {amount}});
		},
		loading,
		subject: data ? data.generateRegisterCodes : null,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	}
};
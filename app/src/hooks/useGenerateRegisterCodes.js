import {useMutation} from "@apollo/react-hooks";
import {GENERATE_REGISTER_CODES} from "../../../common/src/gql-queries";

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
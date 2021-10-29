import gql from "graphql-tag";
import {MutationMethod, useGQLMutation} from "../useGQLMutation";
import {ServerConfig} from "../../types";

export const GENERATE_REGISTER_CODES = gql`
	mutation generateRegisterCodes($amount: Int!) {
		generateRegisterCodes(amount: $amount) {
			_id
			registerCodes
		}
	}
`;

interface GenerateRegisterCodesVariables {
	amount: number;
}

interface GenerateRegisterCodesResult {
	generateRegisterCodes: MutationMethod<ServerConfig, GenerateRegisterCodesVariables>
}

export const useGenerateRegisterCodes = (): GenerateRegisterCodesResult => {
	const result = useGQLMutation<ServerConfig, GenerateRegisterCodesVariables>(GENERATE_REGISTER_CODES);
	return {
		...result,
		generateRegisterCodes: result.mutate
	};
};

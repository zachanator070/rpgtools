import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";
import {ServerConfig} from "../../types";
import {GENERATE_REGISTER_CODES} from "@rpgtools/common/src/gql-mutations";

interface GenerateRegisterCodesVariables {
	amount: number;
}

interface GenerateRegisterCodesResult extends GqlMutationResult<ServerConfig, GenerateRegisterCodesVariables>{
	generateRegisterCodes: MutationMethod<ServerConfig, GenerateRegisterCodesVariables>
}

export const useGenerateRegisterCodes = (): GenerateRegisterCodesResult => {
	const result = useGQLMutation<ServerConfig, GenerateRegisterCodesVariables>(GENERATE_REGISTER_CODES);
	return {
		...result,
		generateRegisterCodes: result.mutate
	};
};

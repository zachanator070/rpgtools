import useGQLMutation, {GqlMutationResult, MutationMethod} from "../useGQLMutation.js";
import {ServerConfig} from "../../types.js";
import {GENERATE_REGISTER_CODES} from "@rpgtools/common/src/gql-mutations";

interface GenerateRegisterCodesVariables {
	amount: number;
}

interface GenerateRegisterCodesResult extends GqlMutationResult<ServerConfig, GenerateRegisterCodesVariables>{
	generateRegisterCodes: MutationMethod<ServerConfig, GenerateRegisterCodesVariables>
}

export default function useGenerateRegisterCodes(): GenerateRegisterCodesResult {
	const result = useGQLMutation<ServerConfig, GenerateRegisterCodesVariables>(GENERATE_REGISTER_CODES);
	return {
		...result,
		generateRegisterCodes: result.mutate
	};
};

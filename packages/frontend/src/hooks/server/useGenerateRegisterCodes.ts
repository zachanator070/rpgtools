import useGQLMutation, { GqlMutationResult, MutationMethod } from "../useGQLMutation";
import { ServerConfig } from "../../types";
import { GENERATE_REGISTER_CODES } from "@rpgtools/common/src/gql-mutations";

interface GenerateRegisterCodesVariables {
	amount: number;
}

interface GenerateRegisterCodesData {
	generateRegisterCodes: ServerConfig;
}
interface GenerateRegisterCodesResult
	extends GqlMutationResult<ServerConfig, GenerateRegisterCodesVariables> {
	generateRegisterCodes: MutationMethod<ServerConfig, GenerateRegisterCodesVariables>;
}

export default function useGenerateRegisterCodes(): GenerateRegisterCodesResult {
	const result = useGQLMutation<
		ServerConfig,
		GenerateRegisterCodesData,
		GenerateRegisterCodesVariables
	>(GENERATE_REGISTER_CODES);
	return {
		...result,
		generateRegisterCodes: result.mutate,
	};
}

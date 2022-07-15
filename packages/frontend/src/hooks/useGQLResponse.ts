import { useEffect } from "react";
import { notification } from "antd";
import {DocumentNode, OperationDefinitionNode, FieldNode} from "graphql";
import {ApolloError} from "@apollo/client/errors";

interface GenericGqlResponse<T> {
	data: T;
	errors: string[];
	queryName: string;
}

export default function useGQLResponse
	<T>(query: DocumentNode, data: any, error: ApolloError | undefined, displayErrors: boolean):
		GenericGqlResponse<T> {
	let errors: string[] = [];
	let errorTitle = "Server Error";
	if (error) {
		if (error.graphQLErrors && error.graphQLErrors.length > 0) {
			errors = error.graphQLErrors.map((error) => error.message);
			errorTitle = "GraphQL Error";
		} else if (error.networkError) {
			errorTitle = "API Error";
			errors = [error.networkError.message];
		} else {
			errors = [error.message];
		}
	}

	if (query.definitions.length === 0) {
		throw new Error("Given query is empty! No definitions were supplied");
	}
	let queryName = null;
	const definition = query.definitions.find(givenDefinition => givenDefinition.kind === "OperationDefinition") as OperationDefinitionNode;
	if(!definition) {
		throw new Error(`Could not find operation definition for query: ${query.loc.source.body}`);
	}
	if(definition.selectionSet.selections.length >= 1){
		queryName = (definition.selectionSet.selections[0] as FieldNode).name.value;
	} else {
		throw new Error(`Could not find operation name definition for query: ${query.loc.source.body}`);
	}

	useEffect(() => {
		if (displayErrors) {
			for (let message of errors) {
				notification.error({
					message: errorTitle,
					description: message,
					placement: "topLeft",
					duration: 0,
				});
			}
		}
	}, [error]);

	return {
		data: data ? data[queryName] : undefined,
		errors,
		queryName: queryName,
	};
};

import {DocumentNode} from "@apollo/client";
import {FieldNode, OperationDefinitionNode} from "graphql";

export default function getQueryName(query: DocumentNode): string {
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
    return queryName;
}
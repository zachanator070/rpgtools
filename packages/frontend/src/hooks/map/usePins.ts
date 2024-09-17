import {PinPaginatedResult} from "../../types.js";
import useGQLQuery, {GqlQueryResult} from "../useGQLQuery.js";
import {GET_PINS} from "@rpgtools/common/src/gql-queries.js";
import {useParams} from 'react-router-dom';
import {useEffect} from "react";

interface GetPinsVariables {
    worldId?: string;
    page?: number;
}

interface GetPinsResult extends GqlQueryResult<PinPaginatedResult, GetPinsVariables>{
    pins: PinPaginatedResult;
}

export default function usePins(variables: GetPinsVariables): GetPinsResult {
    const params = useParams();
    if (!variables.worldId) {
        variables.worldId = params.world_id;
    }
    if (!variables.page) {
        variables.page = 1;
    }
    const result = useGQLQuery<PinPaginatedResult, GetPinsVariables>(GET_PINS, variables);
    useEffect(() => {
        if (result.data && result.data.nextPage) {
            (async () => {
                const more = await result.fetchMore(
                    {
                        variables: {
                            ...variables,
                            page: result.data.nextPage,
                        },
                        updateQuery: (previousResultQuery: GetPinsResult, options: {fetchMoreResult: GetPinsResult}) => {
                            const newResult = {
                                pins: {
                                    docs: [],
                                    nextPage: options.fetchMoreResult.pins.nextPage
                                }
                            };
                            newResult.pins.docs.push(...previousResultQuery.pins.docs);
                            newResult.pins.docs.push(...options.fetchMoreResult.pins.docs);
                            return newResult;
                        }
                    },
                );
            })();
        }
    }, [result.data]);
    return {
        ...result,
        pins: result.data
    };
}
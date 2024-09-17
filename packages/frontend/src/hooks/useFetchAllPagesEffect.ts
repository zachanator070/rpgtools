import {DocumentNode} from "@apollo/client";
import getQueryName from "./getQueryName";
import {useEffect} from "react";


export default function useFetchAllPagesEffect(result, query: DocumentNode, variables) {
    const queryName = getQueryName(query);
    useEffect(() => {
        if (result.data && result.data.nextPage) {
            (async () => {
                await result.fetchMore(
                    {
                        variables: {
                            ...variables,
                            page: result.data.nextPage,
                        },
                        updateQuery: (previousResultQuery, options: {fetchMoreResult}) => {
                            const newResult = {};
                            newResult[queryName] = {
                                docs: [],
                                nextPage: options.fetchMoreResult[queryName].nextPage,
                                totalDocs: result.data.totalDocs,
                            }
                            newResult[queryName].docs.push(...previousResultQuery[queryName].docs);
                            newResult[queryName].docs.push(...options.fetchMoreResult[queryName].docs);
                            return newResult;
                        }
                    },
                );
            })();
        }
    }, [result.data]);
}
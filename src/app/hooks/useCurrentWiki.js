import gql from "graphql-tag";
import {useQuery} from "@apollo/react-hooks";


const GET_CURRENT_WIKI = gql`
    query {
        currentWiki @client {
            name
            content
            public
            world {
                _id
            }
            coverImage {
                width
                height
                chunks{
                    _id
                }
            }
        }
    }
`;

export default () => {
	return useQuery(GET_CURRENT_WIKI);
}
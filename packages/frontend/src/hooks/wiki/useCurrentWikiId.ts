import { useParams } from "react-router-dom";

export const useCurrentWikiId = () => {
    const { wiki_id} = useParams();
    return {currentWikiId: wiki_id};
}
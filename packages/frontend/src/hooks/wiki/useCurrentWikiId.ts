import { useParams } from "react-router-dom";

export default function useCurrentWikiId() {
    const { wiki_id} = useParams();
    return {currentWikiId: wiki_id};
}
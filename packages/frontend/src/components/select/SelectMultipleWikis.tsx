import React from 'react';
import LoadingView from "../LoadingView.tsx";
import MultiSelect from "../widgets/MultiSelect.tsx";
import useSearchWikiPages from "../../hooks/wiki/useSearchWikiPages.js";
import {useParams} from "react-router-dom";


export default function SelectMultipleWikis({onChange}: {onChange: (wikiIds: string[]) => any}) {
    const {world_id} = useParams();
    const {wikis, loading, refetch} = useSearchWikiPages({worldId: world_id});
    if(loading) {
        return <LoadingView/>;
    }
    return <MultiSelect
        options={wikis.docs.map(calendar => {return {label: calendar.name, value: calendar._id}})}
        onChange={onChange}
        onSearch={async (term) => refetch({worldId: world_id, name: term})}
    />;
}

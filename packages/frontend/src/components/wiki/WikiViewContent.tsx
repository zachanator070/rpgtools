import React from 'react';
import WikiContent from "./WikiContent";
import useCurrentWiki from "../../hooks/wiki/useCurrentWiki";
import {Route, Routes} from "react-router-dom";
import WikiEdit from "./WikiEdit";

export default function WikiViewContent() {
    const { currentWiki, loading: wikiLoading } = useCurrentWiki();

    return <>
        <Routes>
            <Route path={`edit`} element={<WikiEdit />}/>
            <Route
                path={`view`}
                element={<WikiContent
                    currentWiki={currentWiki}
                    wikiLoading={wikiLoading}
                />}
            />
        </Routes>
    </>;
}
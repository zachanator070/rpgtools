import React, {useState} from 'react';
import PeopleIcon from "../widgets/icons/PeopleIcon";
import PermissionModal from "../modals/PermissionModal";
import useCurrentWiki from "../../hooks/wiki/useCurrentWiki";
import LoadingView from "../LoadingView";
import {Route, Routes} from "react-router-dom";

export default function WikiViewPermissions() {
    const { currentWiki, loading: wikiLoading, refetch } = useCurrentWiki();

    const [permissionModalVisibility, setPermissionModalVisibility] = useState(
        false
    );

    if(wikiLoading) {
        return <LoadingView/>;
    }

    return <>
        <Routes>
            <Route
                path={`view`}
                element={<>
                    <PermissionModal
                        visibility={permissionModalVisibility}
                        setVisibility={async (visible: boolean) => setPermissionModalVisibility(visible)}
                        subject={currentWiki}
                        subjectType={currentWiki.type}
                        refetch={async () => await refetch({})}
                    />
                    <a
                        title={"View permissions for this page"}
                        onClick={async () => {
                            await setPermissionModalVisibility(true);
                        }}
                    >
                        <PeopleIcon/>
                    </a>
                </>}
            />
        </Routes>
    </>;
}
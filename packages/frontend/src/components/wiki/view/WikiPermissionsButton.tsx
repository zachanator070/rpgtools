import 'react';
import PermissionModal from "../../modals/PermissionModal";
import PeopleIcon from "../../widgets/icons/PeopleIcon";
import React, {useState} from "react";
import useCurrentWiki from "../../../hooks/wiki/useCurrentWiki";
import LoadingView from "../../LoadingView";

export default function WikiPermissionsButton() {

    const { currentWiki, loading: wikiLoading, refetch } = useCurrentWiki();

    const [permissionModalVisibility, setPermissionModalVisibility] = useState(
        false
    );

    if(wikiLoading) {
        return <LoadingView/>;
    }

    return <>
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
    </>;
}
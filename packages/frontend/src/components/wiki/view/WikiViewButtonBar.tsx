import 'react';
import {Link} from "react-router-dom";
import PrimaryButton from "../../widgets/PrimaryButton.js";
import EditIcon from "../../widgets/icons/EditIcon.js";
import React from "react";
import {WikiPage} from "../../../types.js";
import useCurrentWorld from "../../../hooks/world/useCurrentWorld.js";

export default function WikiViewButtonBar({currentWiki, currentWikiLoading} : {currentWiki: WikiPage, currentWikiLoading: boolean}) {

    const { currentWorld, loading } = useCurrentWorld();

    if (currentWikiLoading || loading) {
        return <></>;
    }

    return <span style={{justifyContent: 'right', display: 'flex'}}>
        {currentWiki.canWrite && (
            <span className="margin-lg">
                <Link to={`/ui/world/${currentWorld._id}/wiki/${currentWiki._id}/edit`}>
                    <PrimaryButton>
                        <EditIcon />
                        Edit
                    </PrimaryButton>
                </Link>
            </span>
        )}

        <span className={"margin-lg"}>
            <PrimaryButton
                onClick={() => {
                    window.location.href = `/export/${currentWiki.type}/${currentWiki._id}`;
                }}
            >
                Export
            </PrimaryButton>
        </span>
    </span>;
}

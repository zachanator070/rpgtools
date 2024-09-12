import 'react';
import UndoIcon from "../../widgets/icons/UndoIcon.tsx";
import SecondaryDangerButton from "../../widgets/SecondaryDangerButton.tsx";
import React from "react";
import {useNavigate, useParams} from "react-router-dom";


export default function DiscardWikiChanges() {

    const navigate = useNavigate();
    const { wiki_id, world_id } = useParams();

    return <SecondaryDangerButton
        className={'margin-md-right margin-md-left'}
        onClick={() => {
            navigate(`/ui/world/${world_id}/wiki/${wiki_id}/view`);
        }}
    >
        <UndoIcon />
        Discard
    </SecondaryDangerButton>;
}
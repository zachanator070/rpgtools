import 'react';
import DeleteIcon from "../../widgets/icons/DeleteIcon.tsx";
import PrimaryDangerButton from "../../widgets/PrimaryDangerButton.tsx";
import React from "react";
import useModal from "../../widgets/useModal.tsx";
import useDeleteWiki from "../../../hooks/wiki/useDeleteWiki.js";
import {WikiPage} from "../../../types.js";
import {useNavigate} from "react-router-dom";
import useCurrentWorld from "../../../hooks/world/useCurrentWorld.js";


export default function DeleteWikiButton({currentWiki}: {currentWiki: WikiPage}) {

    const {modalConfirm} = useModal();
    const { deleteWiki } = useDeleteWiki();
    const navigate = useNavigate();

    const {currentWorld, loading} = useCurrentWorld();

    if(loading) {
        return <></>;
    }

    return <PrimaryDangerButton
        className={'margin-md-right margin-md-left'}
        onClick={() => {
            modalConfirm({
                title: "Confirm Delete",
                content: `Are you sure you want to delete the wiki page ${currentWiki.name}?`,
                onOk: async () => {
                    await deleteWiki({wikiId: currentWiki._id});
                    navigate(
                        `/ui/world/${currentWorld._id}/wiki/${currentWorld.wikiPage._id}/view`
                    );
                },
            });
        }}
    >
        <DeleteIcon/>
        Delete Page
    </PrimaryDangerButton>;
}
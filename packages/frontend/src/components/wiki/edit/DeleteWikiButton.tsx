import 'react';
import DeleteIcon from "../../widgets/icons/DeleteIcon";
import PrimaryDangerButton from "../../widgets/PrimaryDangerButton";
import React from "react";
import useModal from "../../widgets/useModal";
import useDeleteWiki from "../../../hooks/wiki/useDeleteWiki";
import {WikiPage} from "../../../types";
import {useNavigate} from "react-router-dom";
import useCurrentWorld from "../../../hooks/world/useCurrentWorld";


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
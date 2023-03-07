import FullScreenModal from "../widgets/FullScreenModal";
import LoadingView from "../LoadingView";
import PrimaryCheckbox from "../widgets/PrimaryCheckbox";
import PrimaryButton from "../widgets/PrimaryButton";
import React, {useState} from "react";
import useLoad5eContent from "../../hooks/world/useLoad5eContent";
import {useNavigate} from "react-router-dom";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";

export default function () {
    const { currentWorld } = useCurrentWorld();
    const { load5eContent, loading: contentLoading } = useLoad5eContent();
    const [getCC, setGetCC] = useState<boolean>();
    const [getTob, setGetTob] = useState<boolean>();
    const navigate = useNavigate();

    return <>
        <FullScreenModal title={"Loading 5e content ..."} visible={contentLoading} closable={false} >
            <LoadingView />
        </FullScreenModal>
        <h2>Load 5e Content</h2>
        <div className={"margin-lg"}>
            <PrimaryCheckbox checked={getCC} onChange={(checked) => setGetCC(checked)}>
                Creature Codex
            </PrimaryCheckbox>
            <PrimaryCheckbox checked={getTob} onChange={(checked) => setGetTob(checked)}>
                Tome of Beasts
            </PrimaryCheckbox>
        </div>
        <div className={"margin-lg-top"}>
            <PrimaryButton
                loading={contentLoading}
                onClick={async () => {
                    await load5eContent({
                        worldId: currentWorld._id,
                        creatureCodex: getCC,
                        tomeOfBeasts: getTob,
                    });
                    navigate(
                        `/ui/world/${currentWorld._id}/wiki/${currentWorld.wikiPage._id}/view`
                    );
                }}
            >
                Load
            </PrimaryButton>
        </div>
    </>;
}
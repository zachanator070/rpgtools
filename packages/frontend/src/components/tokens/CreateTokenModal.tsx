import React from "react";
import FullScreenModal from "../widgets/FullScreenModal";
import CreateTokenForm from "./CreateTokenForm";


export default function CreateTokenModal({ visibility, setVisibility }: { visibility: boolean; setVisibility: (visibility: boolean) => any }) {
    return (<FullScreenModal
        title="Create Token"
        visible={visibility}
        setVisible={setVisibility}
    >
        <CreateTokenForm/>
    </FullScreenModal>);
}
import React from "react";
import FullScreenModal from "../widgets/FullScreenModal";
import BulkCreateTokenForm from "./BulkCreateTokenForm";

export default function BulkCreateTokenModal({ visibility, setVisibility }: { visibility: boolean; setVisibility: (visibility: boolean) => any }) {
    return <FullScreenModal
        title="Bulk Create Tokens"
        visible={visibility}
        setVisible={setVisibility}
    >
        <BulkCreateTokenForm/>
    </FullScreenModal>;
}
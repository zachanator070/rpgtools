
import 'react';
import TextInput from "../widgets/input/TextInput";
import PrimaryButton from "../widgets/PrimaryButton";
import React, {useState} from "react";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import useRenameWorld from "../../hooks/world/useRenameWorld";

export default function RenameWorldForm() {
    const { currentWorld } = useCurrentWorld();
    const [newName, setNewName] = useState<string>();
    const { renameWorld, loading } = useRenameWorld();

    return <>
        <h2>Rename World</h2>
        <div style={{ display: "flex" }} className={"margin-lg-top"}>
            <div className="margin-md-right">New Name:</div>
            <div>
                <TextInput
                    id={'newWorldNameInput'}
                    value={newName}
                    onChange={async (e) => {
                        await setNewName(e.target.value);
                    }}
                />
            </div>
        </div>
        <PrimaryButton
            className={"margin-md-top"}
            onClick={async () => {
                await renameWorld({worldId: currentWorld._id, newName});
            }}
            loading={loading}
        >
            Submit
        </PrimaryButton>
    </>;
}
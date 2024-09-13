import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import useSetCurrentWorld from "../../hooks/world/useSetCurrentWorld.js";
import useCurrentUser from "../../hooks/authentication/useCurrentUser.js";
import SelectWorld from "../select/SelectWorld.js";
import FullScreenModal from "../widgets/FullScreenModal.js";
import InputForm from "../widgets/input/InputForm.js";
import FormItem from "../widgets/input/FormItem.js";
import {World} from "../../types.js";

interface SelectWorldModalProps {
	visibility: boolean;
	setVisibility: (visibility: boolean) => any;
}

export default function SelectWorldModal({ visibility, setVisibility }: SelectWorldModalProps) {
	const { setCurrentWorld, errors, loading } = useSetCurrentWorld();
	const { currentUser } = useCurrentUser();
	const [selectedWorld, setSelectedWorld] = useState<World>(null);

	const navigate = useNavigate();

	return (
		<FullScreenModal
			title="Select a World"
			visible={visibility}
			setVisible={setVisibility}
		>
			<InputForm
				onSubmit={async () => {
					if (currentUser) {
						await setCurrentWorld({worldId: selectedWorld._id});
					}
					navigate(
						`/ui/world/${selectedWorld._id}/map/${selectedWorld.wikiPage._id}`
					);
					setVisibility(false);
				}}
				loading={loading}
				errors={errors}
				buttonText={'Select World'}
				disabled={selectedWorld === null}
			>
				<FormItem label={"Select World"}>
					<SelectWorld onChange={setSelectedWorld}/>
				</FormItem>
			</InputForm>
		</FullScreenModal>
	);
};

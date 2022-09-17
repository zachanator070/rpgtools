import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import useSetCurrentWorld from "../../hooks/world/useSetCurrentWorld";
import useCurrentUser from "../../hooks/authentication/useCurrentUser";
import SelectWorld from "../select/SelectWorld";
import FullScreenModal from "../widgets/FullScreenModal";
import InputForm from "../widgets/input/InputForm";
import FormItem from "../widgets/input/FormItem";
import {World} from "../../types";

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

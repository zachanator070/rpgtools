import React from "react";
import { useHistory } from "react-router-dom";
import useSetCurrentWorld from "../../hooks/world/useSetCurrentWorld";
import useCurrentUser from "../../hooks/authentication/useCurrentUser";
import SelectWorld from "../select/SelectWorld";
import FullScreenModal from "../widgets/FullScreenModal";
import InputForm from "../widgets/InputForm";
import FormItem from "../widgets/FormItem";

interface SelectWorldModalProps {
	visibility: boolean;
	setVisibility: (visibility: boolean) => Promise<void>;
}

export default function SelectWorldModal({ visibility, setVisibility }: SelectWorldModalProps) {
	const { setCurrentWorld, errors, loading } = useSetCurrentWorld();
	const { currentUser } = useCurrentUser();

	const history = useHistory();

	return (
		<FullScreenModal
			title="Select a World"
			visible={visibility}
			setVisible={setVisibility}
		>
			<InputForm
				onSubmit={async ({selectedWorld}) => {
					if (currentUser) {
						await setCurrentWorld({worldId: selectedWorld});
					}
					history.push(
						`/ui/world/${selectedWorld}`
					);
					await setVisibility(false);
				}}
				loading={loading}
				errors={errors}
			>
				<FormItem name={"selectedWorld"} label={"Select World"}>
					<SelectWorld />
				</FormItem>
			</InputForm>
		</FullScreenModal>
	);
};

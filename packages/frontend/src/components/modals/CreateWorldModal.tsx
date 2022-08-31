import React from "react";
import useCreateWorld from "../../hooks/world/useCreateWorld";
import { useHistory } from "react-router-dom";
import useSetCurrentWorld from "../../hooks/world/useSetCurrentWorld";
import { PUBLIC_WORLD_PERMISSIONS } from "@rpgtools/common/src/permission-constants";
import ToolTip from "../widgets/ToolTip";
import PrimaryCheckbox from "../widgets/PrimaryCheckbox";
import InputForm from "../widgets/InputForm";
import FormItem from "../widgets/FormItem";
import TextInput from "../widgets/TextInput";
import FullScreenModal from "../widgets/FullScreenModal";

interface CreateWorldModalProps {
	visibility: boolean;
	setVisibility: (visibility: boolean) => any;
}

export default function CreateWorldModal({ visibility, setVisibility }: CreateWorldModalProps) {
	const history = useHistory();

	const { setCurrentWorld } = useSetCurrentWorld();

	const { createWorld, loading, errors } = useCreateWorld(async (data) => {
		await setCurrentWorld({worldId: data.createWorld._id});
		history.push(`/ui/world/${data.createWorld._id}/map/${data.createWorld.wikiPage._id}`);
	});

	return (
		<FullScreenModal
			title="Create World"
			visible={visibility}
			setVisible={setVisibility}
		>
			<InputForm
				errors={errors}
				loading={loading}
				onSubmit={async ({name, isPublic}) => {
					await createWorld({name, public: isPublic});
					await setVisibility(false);
				}}
			>
				<FormItem label="Name" required={true}>
					<TextInput name="name" id={'newWorldName'}/>
				</FormItem>
				<FormItem >
					<PrimaryCheckbox name={"isPublic"}>
						Public World
					</PrimaryCheckbox>
					<ToolTip
						title={<>
							Public worlds will have the following permissions given to any visitor:
							<br />
							<ul>
								{PUBLIC_WORLD_PERMISSIONS.map((permission) => (
									<li key={permission}>
										{permission}
										<br />
									</li>
								))}
							</ul>
						</>}
					/>
				</FormItem>
			</InputForm>
		</FullScreenModal>
	);
};

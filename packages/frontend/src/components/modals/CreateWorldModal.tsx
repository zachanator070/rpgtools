import React, {useState} from "react";
import useCreateWorld from "../../hooks/world/useCreateWorld.js";
import { useNavigate } from "react-router-dom";
import useSetCurrentWorld from "../../hooks/world/useSetCurrentWorld.js";
import { PUBLIC_WORLD_PERMISSIONS } from "@rpgtools/common/src/permission-constants";
import ToolTip from "../widgets/ToolTip.js";
import PrimaryCheckbox from "../widgets/PrimaryCheckbox.js";
import InputForm from "../widgets/input/InputForm.js";
import FormItem from "../widgets/input/FormItem.js";
import TextInput from "../widgets/input/TextInput.js";
import FullScreenModal from "../widgets/FullScreenModal.js";

interface CreateWorldModalProps {
	visibility: boolean;
	setVisibility: (visibility: boolean) => any;
}

export default function CreateWorldModal({ visibility, setVisibility }: CreateWorldModalProps) {
	const navigate = useNavigate();

	const { setCurrentWorld } = useSetCurrentWorld();
	const [isPublic, setIsPublic] = useState(false);

	const { createWorld, loading, errors } = useCreateWorld(async (data) => {
		await setCurrentWorld({worldId: data.createWorld._id});
		navigate(`/ui/world/${data.createWorld._id}/map/${data.createWorld.wikiPage._id}`);
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
				onSubmit={async ({name}) => {
					await createWorld({name, public: isPublic});
					await setVisibility(false);
				}}
			>
				<FormItem label="Name" required={true}>
					<TextInput name="name" id={'newWorldName'}/>
				</FormItem>
				<FormItem
					label={
						<>
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
							Public World
						</>
					}
				>
					<PrimaryCheckbox name={"isPublic"} checked={isPublic} onChange={(checked) => setIsPublic(checked)}/>
				</FormItem>
			</InputForm>
		</FullScreenModal>
	);
};

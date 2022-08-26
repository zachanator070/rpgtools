import React from "react";
import { useHistory } from "react-router-dom";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import useCreateModel from "../../hooks/model/useCreateModel";
import ModelForm from "./ModelForm";
import FullScreenModal from "../widgets/FullScreenModal";

interface CreateModelModalProps {
	visibility: boolean;
	setVisibility: (visibility: boolean) => Promise<any>;
}

export default function CreateModelModal({ visibility, setVisibility }: CreateModelModalProps) {
	const { currentWorld } = useCurrentWorld();

	const { createModel, loading, errors } = useCreateModel(async (data) => {
		await setVisibility(false);
		history.push(
			`/ui/world/${currentWorld._id}/model/${data._id}/view`
		);
	});
	const history = useHistory();

	return (
		<FullScreenModal
			title={"Create New Model"}
			visible={visibility}
			setVisible={setVisibility}
		>
			<ModelForm
				callback={async (values) => {
					await createModel({
						name: values.name,
						file: values.file[0].originFileObj,
						depth: parseFloat(values.depth),
						width: parseFloat(values.width),
						height: parseFloat(values.height),
						notes: values.notes,
						worldId: currentWorld._id,
					});
				}}
				loading={loading}
				errors={errors}
			/>
		</FullScreenModal>
	);
};

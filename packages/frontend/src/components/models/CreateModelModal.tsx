import React from "react";
import { useNavigate } from "react-router-dom";
import useCurrentWorld from "../../hooks/world/useCurrentWorld.js";
import useCreateModel from "../../hooks/model/useCreateModel.js";
import ModelForm from "./ModelForm.js";
import FullScreenModal from "../widgets/FullScreenModal.js";

interface CreateModelModalProps {
	visibility: boolean;
	setVisibility: (visibility: boolean) => Promise<any>;
}

export default function CreateModelModal({ visibility, setVisibility }: CreateModelModalProps) {
	const { currentWorld } = useCurrentWorld();

	const { createModel, loading, errors } = useCreateModel(async (data) => {
		await setVisibility(false);
		navigate(
			`/ui/world/${currentWorld._id}/model/${data._id}/view`
		);
	});
	const navigate = useNavigate();

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
						file: values.file ? values.file.fileList[0].originFileObj : undefined,
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

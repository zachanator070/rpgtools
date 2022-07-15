import React from "react";
import { useHistory } from "react-router-dom";
import { Modal } from "antd";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import useCreateModel from "../../hooks/model/useCreateModel";
import ModelForm from "./ModelForm";

interface CreateModelModalProps {
	visibility: boolean;
	setVisibility: (visibility: boolean) => Promise<any>;
}

export default function CreateModelModal({ visibility, setVisibility }: CreateModelModalProps) {
	const { currentWorld } = useCurrentWorld();

	const { createModel, loading } = useCreateModel(async (data) => {
		await setVisibility(false);
		history.push(
			`/ui/world/${currentWorld._id}/model/${data._id}/view`
		);
	});
	const history = useHistory();

	return (
		<Modal
			title={"Create New Model"}
			visible={visibility}
			onCancel={async () => {
				await setVisibility(false);
			}}
			width={650}
			footer={null}
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
			/>
		</Modal>
	);
};

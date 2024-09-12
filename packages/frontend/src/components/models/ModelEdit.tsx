import React from "react";
import ModelForm from "./ModelForm.tsx";
import Errors from "../Errors.tsx";
import useUpdateModel from "../../hooks/model/useUpdateModel.js";
import { useNavigate, useParams } from "react-router-dom";
import useCurrentWorld from "../../hooks/world/useCurrentWorld.js";
import LoadingView from "../LoadingView.tsx";
import useDeleteModel from "../../hooks/model/useDeleteModel.js";
import {Model} from "../../types.js";
import ColumnedContent from "../widgets/ColumnedContent.tsx";
import useModal from "../widgets/useModal.tsx";
import PrimaryDangerButton from "../widgets/PrimaryDangerButton.tsx";

interface ModelEditProps {
	model: Model;
}

export default function ModelEdit({ model }: ModelEditProps) {
	const { updateModel, loading, errors } = useUpdateModel();
	const { currentWorld, loading: worldLoading } = useCurrentWorld();
	const navigate = useNavigate();
	const { deleteModel } = useDeleteModel(async (data) => {
		navigate(`/ui/world/${currentWorld._id}/model`);
	});

	const { model_id } = useParams();

	const {modalConfirm} = useModal();

	if (!model) {
		return (
			<Errors
				errors={[
					`404 - Model ${model_id} not found`,
				]}
			/>
		);
	}

	if (!model.canWrite) {
		return (
			<Errors errors={["You do not have permission to edit this model"]} />
		);
	}

	if (worldLoading) {
		return <LoadingView />;
	}

	return (
		<ColumnedContent>
			<div className={"margin-lg"}>
				<ModelForm
					errors={errors}
					callback={async (values) => {
						await updateModel({
							modelId: model._id,
							name: values.name,
							file: values.file ? values.file.fileList[0].originFileObj : undefined,
							depth: parseFloat(values.depth),
							width: parseFloat(values.width),
							height: parseFloat(values.height),
							notes: values.notes
						});
						navigate(
							`/ui/world/${currentWorld._id}/model/${model._id}/view`
						);
					}}
					initialValues={model}
					fileRequired={false}
					loading={loading}
				/>
				<PrimaryDangerButton
					onClick={() => {
						modalConfirm({
							title: "Confirm",
							content: `Are you sure you want to delete the model ${model.name} ?`,
							cancelText: "Cancel",
							okText: "Delete Model",
							onOk: async () => {
								await deleteModel({ modelId: model._id });
							},
						});
					}}
				>
					Delete Model
				</PrimaryDangerButton>
			</div>
		</ColumnedContent>

	);
};

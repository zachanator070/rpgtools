import React from "react";
import ModelForm from "./ModelForm";
import Errors from "../Errors";
import useUpdateModel from "../../hooks/model/useUpdateModel";
import { useHistory, useParams } from "react-router-dom";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import LoadingView from "../LoadingView";
import useDeleteModel from "../../hooks/model/useDeleteModel";
import {Model} from "../../types";
import ColumnedContent from "../widgets/ColumnedContent";
import useModal from "../widgets/useModal";
import PrimaryDangerButton from "../widgets/PrimaryDangerButton";

interface ModelEditProps {
	model: Model;
}

export default function ModelEdit({ model }: ModelEditProps) {
	const { updateModel, loading, errors } = useUpdateModel();
	const { currentWorld, loading: worldLoading } = useCurrentWorld();
	const history = useHistory();
	const { deleteModel } = useDeleteModel(async (data) => {
		history.push(`/ui/world/${currentWorld._id}/model`);
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
							file: values.file ? values.file[0].originFileObj : null,
							depth: parseFloat(values.depth),
							width: parseFloat(values.width),
							height: parseFloat(values.height),
							notes: values.notes
						});
						history.push(
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

import React from 'react';
import {useHistory} from "react-router-dom";
import {Modal} from "antd";
import useCurrentWorld from "../../hooks/useCurrentWorld";
import {useCreateModel} from "../../hooks/useCreateModel";
import {ModelForm} from "./ModelForm";


export const CreateModelModal = ({visibility, setVisibility}) => {

	const {currentWorld} = useCurrentWorld();

	const {createModel, loading} = useCreateModel(async (data) => {
		await setVisibility(false);
		history.push(`/ui/world/${currentWorld._id}/model/${data.createModel._id}/view`);
	});
	const history = useHistory();

	return <Modal
		title={'Create New Model'}
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
						height: parseFloat(values.height)
					});
			}}
			loading={loading}
		/>
	</Modal>;
}
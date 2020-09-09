import React from 'react';
import {ModelForm} from "./ModelForm";
import Errors from "../Errors";
import {Row, Col} from "antd";
import useUpdateModel from "../../hooks/useUpdateModel";
import {useHistory} from 'react-router-dom';
import useCurrentWorld from "../../hooks/useCurrentWorld";
import {LoadingView} from "../LoadingView";


export const ModelEdit = ({model}) => {

	const {updateModel, loading} = useUpdateModel();
	const {currentWorld, loading: worldLoading} = useCurrentWorld();

	const history = useHistory();

	if(!model){
		return <Errors errors={['You do not have permission to view this model or this model does not exist']}/>;
	}

	if(!model.canWrite){
		return <Errors errors={['You do not have permission to edit this model']}/>;
	}

	if(worldLoading){
		return <LoadingView/>;
	}

	return <div className={'margin-lg'}>
		<Row>
			<Col span={10}>
				<h1>Edit {model.name}</h1>
				<div className={'margin-lg'}>
					<ModelForm
						callback={async (values) => {
							await updateModel(model._id, values.name, values.file, values.depth, values.width, values.height);
							history.push(`/ui/world/${currentWorld._id}/model/${model._id}/view`);
						}}
						initialValues={model}
						fileRequired={false}
						loading={loading}
					/>
				</div>
			</Col>
			<Col span={14}/>
		</Row>

	</div>
};
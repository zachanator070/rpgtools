import React from 'react';
import {useHistory} from "react-router-dom";
import {Modal, Form, Input, Button, Upload} from "antd";
import {UploadOutlined} from '@ant-design/icons';
import {ToolTip} from "../ToolTip";
import useCurrentWorld from "../../hooks/useCurrentWorld";
import {useCreateModel} from "../../hooks/useCreateModel";


export const CreateModelModal = ({visibility, setVisibility}) => {

	const {currentWorld} = useCurrentWorld();
	const {createModel, loading, error} = useCreateModel((model) => history.push(`/ui/world/${currentWorld._id}/model/${model._id}/view`));
	const history = useHistory();

	const formItemLayout = {
		labelCol: { span: 7 },
		wrapperCol: { span: 12 },
	};

	const tailLayout = {
		wrapperCol: { offset: 8, span: 16 },
	};

	return <Modal
		title={'Create New Model'}
		visible={visibility}
		onCancel={async () => {
			await setVisibility(false);
		}}
		width={650}
		footer={null}
	>
		<Form
			onFinish={async (values) => {
				await createModel(values.name, values.file[0], parseFloat(values.depth), parseFloat(values.width), parseFloat(values.height));
			}}
		>
			<Form.Item
				{...formItemLayout}
				label="Name"
				name="name"
				rules={[{ required: true, message: 'Please input a name for this model' }]}
			>
				<Input />
			</Form.Item>
			<Form.Item
				{...formItemLayout}
				label={<div><ToolTip>Supported file types: <br/><ul><li>.glb</li></ul></ToolTip> File</div>}
				name="file"
				rules={[
					{required: true, message: 'Please select a file to upload' },
					{message: 'File type not supported', validator: async (rule, value) => {
						if(value.length !== 1){
							throw new Error('Please select a file');
						}
						const file = value[0];
						const supportedTypes = ['glb'];
						const parts = file.name.split('.');

						const type = parts.length > 0 ? parts[parts.length - 1] : null;
						if(!supportedTypes.includes(type)){
							throw new Error(`File type ${type}`);
						}
					}}
				]}
				getValueFromEvent={(e) => {
					if (Array.isArray(e)) {
						return e;
					}

					return e && e.fileList;
				}}
			>
				<Upload
					beforeUpload={() => false}
				>
					<Button icon={<UploadOutlined />}>Select File</Button>
				</Upload>
			</Form.Item>
			<Form.Item
				{...formItemLayout}
				label="Depth of model in feet"
				name="depth"
				rules={[{ required: true, message: 'Please input a depth for this model' }]}
			>
				<Input type={'number'}/>
			</Form.Item>
			<Form.Item
				{...formItemLayout}
				label="Width of model in feet"
				name="width"
				rules={[{ required: true, message: 'Please input a width for this model' }]}
			>
				<Input type={'number'}/>
			</Form.Item>
			<Form.Item
				{...formItemLayout}
				label="Height of model in feet"
				name="height"
				rules={[{ required: true, message: 'Please input a height for this model' }]}
			>
				<Input type={'number'}/>
			</Form.Item>
			<Form.Item {...tailLayout}>
				<Button type="primary" htmlType="submit">
					Submit
				</Button>
			</Form.Item>
		</Form>
	</Modal>;
}
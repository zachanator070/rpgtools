import React from "react";
import { Button, Form, Input, Upload } from "antd";
import { ToolTip } from "../ToolTip";
import { UploadOutlined } from "@ant-design/icons";

export const ModelForm = ({
	callback,
	initialValues,
	loading,
	fileRequired = true,
}) => {
	const formItemLayout = {
		labelCol: { span: 7 },
		wrapperCol: { span: 12 },
	};

	const tailLayout = {
		wrapperCol: { offset: 8, span: 16 },
	};

	return (
		<Form initialValues={initialValues} onFinish={callback}>
			<Form.Item
				{...formItemLayout}
				label="Name"
				name="name"
				rules={[
					{ required: true, message: "Please input a name for this model" },
				]}
			>
				<Input />
			</Form.Item>
			<Form.Item
				{...formItemLayout}
				label={
					<div>
						<ToolTip>
							Supported file types: <br />
							<ul>
								<li>.glb</li>
							</ul>
						</ToolTip>{" "}
						File
					</div>
				}
				name="file"
				rules={[
					{ required: fileRequired, message: "File required" },
					{
						validator: async (rule, value) => {
							// this function has to be async b/c the validator has to return a promise
							if (!value || value.length !== 1) {
								return;
							}
							const file = value[0];
							const supportedTypes = ["glb", "obj"];
							const parts = file.name.split(".");

							const type = parts.length > 0 ? parts[parts.length - 1] : null;
							if (!supportedTypes.includes(type)) {
								throw new Error(`File type ${type} not supported`);
							}
						},
					},
				]}
				getValueFromEvent={(e) => {
					return e.fileList.length > 0 ? [e.fileList[0]] : [];
				}}
				valuePropName="fileList"
			>
				<Upload multiple={false} beforeUpload={() => false}>
					<Button icon={<UploadOutlined />}>Select File</Button>
				</Upload>
			</Form.Item>
			<Form.Item
				{...formItemLayout}
				label={
					<div>
						<ToolTip>Depth of the model in feet</ToolTip> Depth
					</div>
				}
				name="depth"
				rules={[
					{ required: true, message: "Please input a depth for this model" },
				]}
			>
				<Input type={"number"} />
			</Form.Item>
			<Form.Item
				{...formItemLayout}
				label={
					<div>
						<ToolTip>Width of the model in feet</ToolTip> Width
					</div>
				}
				name="width"
				rules={[
					{ required: true, message: "Please input a width for this model" },
				]}
			>
				<Input type={"number"} />
			</Form.Item>
			<Form.Item
				{...formItemLayout}
				label={
					<div>
						<ToolTip>Height of the model in feet</ToolTip> Height
					</div>
				}
				name="height"
				rules={[
					{ required: true, message: "Please input a height for this model" },
				]}
			>
				<Input type={"number"} />
			</Form.Item>
			<Form.Item {...formItemLayout} label={<div>Notes</div>} name="notes">
				<Input.TextArea rows={15} cols={50} />
			</Form.Item>
			<Form.Item {...tailLayout}>
				<Button type="primary" htmlType="submit" loading={loading}>
					Submit
				</Button>
			</Form.Item>
		</Form>
	);
};

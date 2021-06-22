import React, { useState } from "react";
import { useMoveFolder } from "../../hooks/wiki/useMoveFolder";
import { Button, Form, Modal } from "antd";
import { SelectFolder } from "../select/SelectFolder";
import Errors from "../Errors";

export const MoveFolderModal = ({ folder, visibility, setVisibility }) => {
	const [selectedParent, setSelectedParent] = useState();
	const { moveFolder, errors } = useMoveFolder(async () => {
		await setVisibility(false);
	});
	const formItemLayout = {
		labelCol: { span: 7 },
		wrapperCol: { span: 12 },
	};

	const tailLayout = {
		wrapperCol: { offset: 8, span: 16 },
	};

	return (
		<Modal
			title={`Moving ${folder.name}`}
			visible={visibility}
			onCancel={async () => await setVisibility(false)}
			onOk={async () => {}}
			okText={"Move Folder"}
			footer={null}
		>
			{errors && (
				<div className={"margin-lg-bottom"}>
					<Errors errors={errors} />
				</div>
			)}

			<Form
				onFinish={async () => {
					await moveFolder({
						folderId: folder._id,
						parentFolderId: selectedParent,
					});
				}}
			>
				<Form.Item label={"New Parent"} {...formItemLayout}>
					<SelectFolder
						onChange={async (value) => await setSelectedParent(value)}
					/>
				</Form.Item>
				<Form.Item {...tailLayout}>
					<Button type={"primary"} htmlType="submit">
						Move Folder
					</Button>
				</Form.Item>
			</Form>
		</Modal>
	);
};

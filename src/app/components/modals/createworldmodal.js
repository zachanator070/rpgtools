import React, {useState} from 'react';
import {Button, Checkbox, Form, Input, Modal} from "antd";

export default function CreateWorldModal({setShow, show, loading, createWorld, errors}) {

	const [name, setName] = useState('');
	const [isPublic, setPublic] = useState(true);

	const formItemLayout = {
		labelCol: {span: 4},
		wrapperCol: {span: 14},
	};
	const noLabelItem = {
		wrapperCol: {span: 10, offset: 4}
	};
	return (
		<Modal
			title="Create World"
			visible={show}
			onCancel={() => {
				setShow(false)
			}}
			footer={null}
		>
			{errors.join('/n')}
			<Form layout='horizontal'>
				<Form.Item
					label="Name"
					required={true}
					{...formItemLayout}
				>
					<Input onChange={(e) => setName(e.target.value)}/>
				</Form.Item>
				<Form.Item {...noLabelItem}>
					<Checkbox onChange={() => setPublic(!isPublic)} checked={isPublic}>
						Public World
					</Checkbox>
				</Form.Item>
				<Form.Item {...noLabelItem}>
					<Button type="primary" disabled={loading} onClick={() => {
						createWorld(
							name,
							isPublic,
							() => {
								setShow(false);
							}
						);
					}}>Submit</Button>
				</Form.Item>
			</Form>
		</Modal>
	);
}

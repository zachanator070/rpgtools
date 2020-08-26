import React, {useState} from 'react';
import {Button, Checkbox, Form, Input, Modal} from "antd";
import useCreateWorld from "../../hooks/useCreateWorld";
import {useHistory} from 'react-router-dom';
import {useSetCurrentWorld} from "../../hooks/useSetCurrentWorld";

export const CreateWorldModal = ({visibility, setVisibility}) => {

	const history = useHistory();
	const [name, setName] = useState('');
	const [isPublic, setPublic] = useState(true);

	const {setCurrentWorld} = useSetCurrentWorld();

	const {createWorld, loading, errors} = useCreateWorld(async (data) => {
		await setCurrentWorld(data.createWorld._id);
		history.push(`/ui/world/${data.createWorld._id}/map/${data.createWorld.wikiPage._id}`);
	});

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
			visible={visibility}
			onCancel={async () => {
				await setVisibility(false);
			}}
			footer={null}
		>
			{errors && errors.join('/n')}
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
					<Button type="primary" disabled={loading} onClick={async () => {
						const newWorld = await createWorld(
							name,
							isPublic
						);
						await setVisibility(false);
					}}>Submit</Button>
				</Form.Item>
			</Form>
		</Modal>
	);
};

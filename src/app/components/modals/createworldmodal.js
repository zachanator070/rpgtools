import React, {useState} from 'react';
import {Button, Checkbox, Form, Input, Modal} from "antd";
import useSetCreateWorldModalVisibility from "../../hooks/useSetCreateWorldModalVisibility";
import useCreateWorld from "../../hooks/useCreateWorld";
import useCreateWorldModalVisibility from "../../hooks/useCreateWorldModalVisibility";
import {withRouter} from 'react-router-dom';

export default withRouter(function CreateWorldModal({history}) {

	const [name, setName] = useState('');
	const [isPublic, setPublic] = useState(true);

	const {setCreateWorldModalVisibility} = useSetCreateWorldModalVisibility();
	const {createWorldModalVisibility} = useCreateWorldModalVisibility();

	const {createWorld, loading, errors} = useCreateWorld(async () => {
		await setCreateWorldModalVisibility(false);
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
			visible={createWorldModalVisibility}
			onCancel={async () => {
				await setCreateWorldModalVisibility(false);
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
						// history.push(`/ui/world/${newWorld._id}/map`);
					}}>Submit</Button>
				</Form.Item>
			</Form>
		</Modal>
	);
});

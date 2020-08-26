import React, {useState} from 'react';
import {Button, Form, Modal, Select} from "antd";
import useCurrentWorld from "../../hooks/useCurrentWorld";
import {useUpdatePin} from "../../hooks/useUpdatePin";
import {useDeletePin} from "../../hooks/useDeletePin";
import {SelectWiki} from "../select/SelectWiki";

export const EditPinModal = ({visibility, setVisibility, pinId}) => {

	const [page, setPage] = useState(null);

	const {currentWorld, loading: worldLoading} = useCurrentWorld();

	const {updatePin, loading: updateLoading} = useUpdatePin();
	const {deletePin, loading: deleteLoading} = useDeletePin();

	if(worldLoading){
		return <></>;
	}

	let pinBeingEdited = null;
	let possiblePins = currentWorld ? currentWorld.pins : [];
	for(let pin of possiblePins){
		if(pin._id === pinId){
			pinBeingEdited = pin;
		}
	}

	const save = async () => {
		await updatePin(pinId, page);
		await setVisibility(false);
	};

	const formItemLayout = {
		labelCol: {span: 4},
		wrapperCol: {span: 14},
	};
	const noLabelItem = {
		wrapperCol: {span: 10, offset: 4}
	};

	return (
		<div>
			<Modal
				title="Edit Pin"
				visible={visibility}
				centered
				onCancel={async () => {
					await setVisibility(false);
				}}
				footer={null}
			>
				<Form layout='horizontal'>
					<Form.Item label="Page" {...formItemLayout}>
						<SelectWiki onChange={setPage}/>
					</Form.Item>
					<Form.Item
						{...noLabelItem}>
						<Button type="primary" htmlType="button" disabled={updateLoading || deleteLoading} onClick={async () => {
							await save();
						}}>Save</Button>
						<Button className='margin-md-left' type="danger" disabled={updateLoading || deleteLoading} onClick={async () => {
							await deletePin(pinId);
							await setVisibility(false);
						}}>Delete</Button>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

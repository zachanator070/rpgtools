import React, {Component, useEffect, useState} from 'react';
import {Button, Form, Modal, Select} from "antd";
import useEditPinModalVisibility from "../../hooks/useEditPinModalVisibility";
import usePinBeingEdited from "../../hooks/usePinBeingEdited";
import useCurrentWorld from "../../hooks/useCurrentWorld";
import {LoadingView} from "../LoadingView";
import useSetEditPinModalVisibility from "../../hooks/useSetEditPinModalVisibility";
import {useSearchWikiPages} from "../../hooks/useSearchWikiPages";
import {useUpdatePin} from "../../hooks/useUpdatePin";
import {useDeletePin} from "../../hooks/useDeletePin";

export const EditPinModal = () => {

	const [page, setPage] = useState(null);
	const {editPinModalVisibility} = useEditPinModalVisibility();
	const {setEditPinModalVisibility} = useSetEditPinModalVisibility();

	const {pinBeingEdited: pinId} = usePinBeingEdited();

	const {currentWorld, loading: worldLoading} = useCurrentWorld();

	const {searchWikiPages, wikis} = useSearchWikiPages();
	const [searchPhrase, setSearchPhrase] = useState('');
	const {updatePin, loading: updateLoading} = useUpdatePin();
	const {deletePin, loading: deleteLoading} = useDeletePin();

	useEffect(() => {
		if(currentWorld){
			(async () => {
				await searchWikiPages(searchPhrase, currentWorld._id);
			})();
		}
	}, [currentWorld, searchPhrase]);

	if(worldLoading){
		return <LoadingView/>;
	}

	let pinBeingEdited = null;
	for(let pin of currentWorld.pins){
		if(pin._id === pinId){
			pinBeingEdited = pin;
		}
	}

	const save = async () => {
		await updatePin(pinId, page._id);
		await setEditPinModalVisibility(false);
	};

	const handleChange = async (value) => {
		await setPage(value);
	};

	const formItemLayout = {
		labelCol: {span: 4},
		wrapperCol: {span: 14},
	};
	const noLabelItem = {
		wrapperCol: {span: 10, offset: 4}
	};

	const options = [];
	for (let result of wikis) {
		options.push(<Select.Option value={result._id} key={result._id}>{result.name}</Select.Option>);
	}

	return (
		<div>
			<Modal
				title="Edit Pin"
				visible={editPinModalVisibility}
				centered
				onCancel={async () => {
					await setEditPinModalVisibility(false);
				}}
				footer={null}
			>
				<Form layout='horizontal'>
					<Form.Item label="Page" {...formItemLayout}>
						<Select
							showSearch
							style={{width: 200}}
							placeholder="Select a Wiki Page"
							defaultValue={pinBeingEdited ? pinBeingEdited.page._id : null}
							optionFilterProp="children"
							onChange={handleChange}
							filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
						>
							{options}
						</Select>
					</Form.Item>
					<Form.Item
						{...noLabelItem}>
						<Button type="primary" htmlType="button" disabled={updateLoading || deleteLoading} onClick={async () => {
							await save();
						}}>Save</Button>
						<Button className='margin-md-left' type="danger" disabled={updateLoading || deleteLoading} onClick={async () => {
							await deletePin(pinId);
							await setEditPinModalVisibility(false);
						}}>Delete</Button>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

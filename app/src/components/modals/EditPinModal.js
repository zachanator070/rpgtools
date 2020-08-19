import React, {useEffect, useState} from 'react';
import {Button, Form, Modal, Select} from "antd";
import useEditPinModalVisibility from "../../hooks/useEditPinModalVisibility";
import usePinBeingEdited from "../../hooks/usePinBeingEdited";
import useCurrentWorld from "../../hooks/useCurrentWorld";
import useSetEditPinModalVisibility from "../../hooks/useSetEditPinModalVisibility";
import {useSearchWikiPages} from "../../hooks/useSearchWikiPages";
import {useUpdatePin} from "../../hooks/useUpdatePin";
import {useDeletePin} from "../../hooks/useDeletePin";
import {PLACE, WIKI_PAGE} from "../../../../common/src/type-constants";
import SelectWiki from "../select/SelectWiki";

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
				await searchWikiPages(searchPhrase);
			})();
		}
	}, [currentWorld, searchPhrase]);

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
		await setEditPinModalVisibility(false);
	};

	const handleChange = async (value) => {
		await setSearchPhrase(value.name);
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
						<SelectWiki onChange={setPage}/>
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

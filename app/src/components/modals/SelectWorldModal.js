import React, {useState} from 'react';
import {Button, Modal, List, Row, Col, Divider} from "antd";
import {useHistory} from 'react-router-dom';
import useWorlds from "../../hooks/useWorlds";
import {useSetCurrentWorld} from "../../hooks/useSetCurrentWorld";
import useCurrentUser from "../../hooks/useCurrentUser";

export const SelectWorldModal = ({visibility, setVisibility}) => {


	const [selectedWorld, setSelectedWorld] = useState(null);
	const [currentPage, setCurrentPage] = useState(1);

	const {worlds, loading} = useWorlds(currentPage);

	const {setCurrentWorld} = useSetCurrentWorld();
	const {currentUser} = useCurrentUser();

	const history = useHistory();

	const getListItemComponent = (item) => {

		let itemClasses = '';
		if(selectedWorld && selectedWorld._id === item._id){
			itemClasses += 'selected';
		}

		if(item.name){
			return (
				<a href='#' onClick={async () => {
					await setSelectedWorld(item);
				}}>
					<List.Item className={itemClasses} key={item.name}>
						{item.name}
					</List.Item>
				</a>
			);
		}
		else {
			return (
				<List.Item className='text-align-right' key={item}>
					{item}
				</List.Item>
			);
		}
	};

	const content = selectedWorld ?
		<div>
			<h2>{selectedWorld.name}</h2>
		</div>
		: 'No world selected';

	if(loading){
		return <></>;
	}

	return (
		<Modal
			title="Select a World"
			visible={visibility}
			onCancel={async () => {
				await setVisibility(false);
			}}
			footer={[
				<Button
					type={'primary'}
					key='select button'
					onClick={async () => {
						if(currentUser){
							await setCurrentWorld(selectedWorld._id);
						}
						history.push(`/ui/world/${selectedWorld._id}/map/${selectedWorld.wikiPage._id}`);
						await setVisibility(false);
					}}
					disabled={selectedWorld === null}
				>
					Select
				</Button>
			]}
		>
			<Row>
				<Col span={10}>
					<div className='padding-md-left padding-md-right text-align-center'>
						<List
							bordered={true}
							itemLayout="horizontal"
							dataSource={worlds ? worlds.docs : []}
							renderItem={getListItemComponent}
						/>
					</div>
				</Col>
				<Col span={1} style={{borderRight: 'thin solid lightgrey'}}>
				</Col>
				<Col span={13}>
					{content}
				</Col>
			</Row>
		</Modal>
	);
};

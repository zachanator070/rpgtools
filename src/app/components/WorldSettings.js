import React, {useState} from 'react';
import useCurrentWorld from "../hooks/useCurrentWorld";
import PermissionEditor from "./permissions/PermissionEditor";
import {Button, Col, Input, Row} from "antd";
import {useRenameWorld} from "../hooks/useRenameWorld";

export default () => {
	const {currentWorld} = useCurrentWorld();
	const [newName, setNewName] = useState();
	const {renameWorld, loading} = useRenameWorld();

	if(!currentWorld){
		return <div>404 - World not found</div>;
	}
	return <div className='margin-md-left margin-md-top'>
		<h1>Settings for {currentWorld.name}</h1>
		<hr/>
		<Row className={'margin-lg-top'}>
			<Col span={4}></Col>
			<Col span={16}>
				<h2>Permissions</h2>
			</Col>
			<Col span={4}></Col>
		</Row>
		<Row>
			<Col span={4}></Col>
			<Col span={16}>
				<PermissionEditor/>
			</Col>
			<Col span={4}></Col>
		</Row>

		<Row className={'margin-lg-top'}>
			<Col span={4}></Col>
			<Col span={16}>
				<h2>Rename World</h2>
			</Col>
			<Col span={4}></Col>
		</Row>
		<Row className={'margin-lg-top'}>
			<Col span={4}></Col>
			<Col span={16}>
				<div style={{display: 'flex'}}>
					<div className='margin-md-right'>New Name:</div>
					<div>
						<Input value={newName} onChange={async (e) => {await setNewName(e.target.value)}}/>
					</div>
				</div>
				<Button className={'margin-md-top'} onClick={async () => {await renameWorld(currentWorld._id, newName)}} disabled={loading}>Submit</Button>
			</Col>
			<Col span={4}></Col>
		</Row>

	</div>;
}
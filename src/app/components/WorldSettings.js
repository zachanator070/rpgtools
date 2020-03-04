import React from 'react';
import useCurrentWorld from "../hooks/useCurrentWorld";
import PermissionView from "./PermissionView";
import {Col, Row} from "antd";

export default () => {
	const {currentWorld} = useCurrentWorld();

	if(!currentWorld){
		return <div>404 - World not found</div>;
	}
	return <div className='margin-md-left margin-md-top'>
		<h2>Settings for {currentWorld.name}</h2>
		<h3>Permissions</h3>
		<Row>
			<Col span={1}></Col>
			<Col span={14}>
				<PermissionView/>
			</Col>
			<Col span={9}></Col>
		</Row>

	</div>;
}
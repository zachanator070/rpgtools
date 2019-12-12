import React from 'react';
import {Col, Row} from "antd";
import FolderView from "./folderview";
import WikiView from "./wikiview";
import WikiEdit from "./wikiedit";
import {Route, Switch} from "react-router";

export const WikiContainer = () => {

	return (
		<Row>
			<Col span={4} className='padding-md'>
				<FolderView/>
			</Col>
			<Col span={16}>
				<Switch>
					<Route path='/ui/world/:world_id/wiki/:wiki_id/edit'>
						<WikiEdit/>
					</Route>
					<Route path='/ui/world/:world_id/wiki/:wiki_id/view'>
						<WikiView/>
					</Route>
				</Switch>
			</Col>
			<Col span={4} className='padding-md'>
			</Col>
		</Row>
	);

};
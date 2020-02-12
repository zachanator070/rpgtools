import React, {useEffect} from 'react';
import {Col, Row} from "antd";
import {FolderView} from "./FolderView";
import {WikiView} from "./WikiView";
import {WikiEdit} from "./WikiEdit";
import {Route, Switch, useParams, useRouteMatch} from "react-router-dom";
import useCurrentWiki from "../../hooks/useCurrentWiki";
import {LoadingView} from "../LoadingView";

export const WikiContent = () => {

	const {loading} = useCurrentWiki();
	const match = useRouteMatch();

	if(loading){
		return (<LoadingView/>);
	}

	return (
		<Row>
			<Col span={4} className='padding-md'>
				<FolderView/>
			</Col>
			<Col span={16}>
				<Switch>
					<Route path={`${match.path}/edit`}>
						<WikiEdit/>
					</Route>
					<Route path={`${match.path}/view`}>
						<div>
							<WikiView/>
						</div>
					</Route>
				</Switch>
			</Col>
			<Col span={4} className='padding-md'>
			</Col>
		</Row>
	);

};
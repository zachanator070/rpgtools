import React, {useEffect} from 'react';
import {Col, Row} from "antd";
import {FolderView} from "./folderview";
import {WikiView} from "./wikiview";
import {WikiEdit} from "./wikiedit";
import {Route, Switch, useParams} from "react-router-dom";
import useCurrentWiki from "../../hooks/useCurrentWiki";
import {LoadingView} from "../loadingview";

export const WikiContainer = () => {

	const {currentWiki, loading} = useCurrentWiki();
	const {wiki_id} = useParams();

	if(!currentWiki || loading || currentWiki._id !== wiki_id){
		return (<LoadingView/>);
	}

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
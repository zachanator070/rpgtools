import React, {useEffect, useRef, useState} from 'react';
import {SlidingDrawer} from "../SlidingDrawerV2";
import useCurrentGame from "../../hooks/game/useCurrentGame";
import {Checkbox, Collapse, Comment, Input, Form, Button, List, Col, Row} from "antd";
import {useGameChat} from "../../hooks/game/useGameChat";
import {useGameChatSubscription} from "../../hooks/game/useGameChatSubscription";
import {useGameRosterSubscription} from "../../hooks/game/useGameRosterSubscription";
import useLeaveGame from "../../hooks/game/useLeaveGame";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import {useHistory} from 'react-router-dom';
import useMyGames from "../../hooks/game/useMyGames";
import {BrushOptions} from "./BrushOptions";
import {SelectWiki} from "../select/SelectWiki";
import {GAME, PLACE} from "../../../../common/src/type-constants";
import {useSetGameMap} from "../../hooks/game/useSetGameMap";
import {Link} from "react-router-dom";
import {AddModelSection} from "./AddModelSection";
import {FogOptions} from "./FogOptions";
import {TeamOutlined} from "@ant-design/icons";
import {PermissionModal} from "../modals/PermissionModal";
import useCurrentUser from "../../hooks/authentication/useCurrentUser";
import {GameChat} from "./GameChat";

export const GameDrawer = ({renderer}) => {
	const {currentGame, loading, refetch: refetchCurrentGame} = useCurrentGame();
	const {currentWorld, loading: currentWorldLoading} = useCurrentWorld();
	const {currentUser, loading: currentUserLoading} = useCurrentUser();
	const [clearPaint, setClearPaint] = useState(false);
	const [permissionModalVisibility, setPermissionModalVisibility] = useState(false);
	const [setFog, setSetFog] = useState(false);

	const {data: rosterChangeGame} = useGameRosterSubscription();
	const history = useHistory();
	const {setGameMap} = useSetGameMap();
	const {refetch} = useMyGames();

	const [selectedLocation, setSelectedLocation] = useState();

	const {leaveGame} = useLeaveGame(async () => {
		await refetch();
		history.push(`/ui/world/${currentWorld._id}/gameLogin`);
	});

	if(loading || currentWorldLoading || currentUserLoading){
		return <></>;
	}

	return <>
		<SlidingDrawer
			title={`Game ID: ${currentGame._id}`}
			startVisible={true}
			placement={'right'}>
			<Row>
				<Col span={12}>
					<Button className={'margin-lg'} type={'primary'} onClick={async () => {
						await leaveGame(currentGame._id)}
					}>Leave Game</Button>
				</Col>
				<Col span={12}>
					<div className={'margin-lg'} style={{textAlign: 'right'}}>
						<PermissionModal
							visibility={permissionModalVisibility}
							setVisibility={setPermissionModalVisibility}
							subject={currentGame}
							subjectType={GAME}
							refetch={refetchCurrentGame}
						/>
						<a title={'View permissions for this page'} onClick={async () => {
							await setPermissionModalVisibility(true);
						}}>
							<TeamOutlined style={{fontSize: '20px'}}/>
						</a>
					</div>
				</Col>
			</Row>
			<Collapse
				defaultActiveKey={['1']}
			>
				<Collapse.Panel header="Players" key="1">
					<List
						dataSource={currentGame.players}
						itemLayout="horizontal"
						locale={{emptyText: <div>No players</div>}}
						renderItem={({username, _id}) =>
							<List.Item>
								{username}{currentGame.host._id === _id && <> (Host) </>}
							</List.Item>
						}
					/>
				</Collapse.Panel>
				<Collapse.Panel header="Game Chat" key="2" >
					<GameChat/>
				</Collapse.Panel>
				{currentGame.canPaint &&
					<Collapse.Panel header="Brush Options" key="3">
						<BrushOptions renderer={renderer}/>
					</Collapse.Panel>
				}
				{currentGame.canWriteFog &&
					<Collapse.Panel key='4' header='Fog Options'>
						<FogOptions renderer={renderer}/>
					</Collapse.Panel>
				}
				{currentGame.canModel &&
					<Collapse.Panel header="Add Models" key="5">
						<AddModelSection renderer={renderer}/>
					</Collapse.Panel>
				}

				<Collapse.Panel header="Current Location" key="6">

					<div className={'margin-lg-top margin-lg-bottom'}>
						<h3>Current Location</h3>
						{currentGame.map ?
							<Link
								to={`/ui/world/${currentWorld._id}/wiki/${currentGame.map._id}/view`}>{currentGame.map.name}</Link>
							:
							<p>No current location</p>
						}
					</div>
					{currentGame.canWrite &&
						<div className={'margin-lg-bottom'}>
							<h3>Change Location</h3>
							<SelectWiki type={PLACE} onChange={async (wikiId) => {await setSelectedLocation(wikiId)}}/>
							<div className={'margin-md'}>
								Clear Paint: <Checkbox checked={clearPaint} onChange={async (e) => {
									await setClearPaint(e.target.checked);
								}}/>
							</div>
							<div className={'margin-md'}>
								Set Fog: <Checkbox checked={setFog} onChange={async (e) => {
									await setSetFog(e.target.checked);
								}}/>
							</div>

							<div className={'margin-md'}>
								<Button
									onClick={
										async() => {
											await setGameMap({gameId: currentGame._id, placeId: selectedLocation, clearPaint, setFog});
										}
									}
							        disabled={!selectedLocation}
								>Change location</Button>
							</div>
						</div>
					}
				</Collapse.Panel>

			</Collapse>
		</SlidingDrawer>
	</>;
};
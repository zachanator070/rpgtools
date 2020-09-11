import React, {useEffect, useState} from 'react';
import {SlidingDrawer} from "../SlidingDrawerV2";
import useCurrentGame from "../../hooks/useCurrentGame";
import {Collapse, Comment, Input, Form, Button, List, Modal} from "antd";
import {useGameChat} from "../../hooks/useGameChat";
import {useGameChatSubscription} from "../../hooks/useGameChatSubscription";
import {useGameRosterSubscription} from "../../hooks/useGameRosterSubscription";
import useLeaveGame from "../../hooks/useLeaveGame";
import useCurrentWorld from "../../hooks/useCurrentWorld";
import {useHistory} from 'react-router-dom';
import useMyGames from "../../hooks/useMyGames";
import {BrushOptions} from "./BrushOptions";
import {SelectWiki} from "../select/SelectWiki";
import {PLACE} from "../../../../common/src/type-constants";
import {useSetGameMap} from "../../hooks/useSetGameMap";
import {Link} from "react-router-dom";
import {AddModelSection} from "./AddModelSection";

export const GameDrawer = ({renderer}) => {
	const {currentGame, loading} = useCurrentGame();
	const {currentWorld, loading: currentWorldLoading} = useCurrentWorld();
	const {gameChat, loading: chatLoading} = useGameChat();
	const [comment, setComment] = useState();
	const {gameChat: gameChatMessage} = useGameChatSubscription();
	const {game: rosterChangeGame} = useGameRosterSubscription();
	const history = useHistory();
	const {setGameMap} = useSetGameMap();
	const {refetch} = useMyGames();
	const [messages, setMessages] = useState([]);

	const [selectedLocation, setSelectedLocation] = useState();

	const {leaveGame} = useLeaveGame(async () => {
		await refetch();
		history.push(`/ui/world/${currentWorld._id}/gameLogin`);
	});

	useEffect(() => {
		(async () => {
			if(currentGame){
				await setMessages(currentGame.messages);
			}
		})();
	}, [currentGame]);

	useEffect(() => {
		(async () => {
			if(gameChatMessage){
				await setMessages(messages.concat([gameChatMessage]));
			}
		})();
	}, [gameChatMessage]);

	useEffect(() => {
		const element = document.getElementById("chat");
		if(element){
			element.scrollTop = element.scrollHeight;
		}
	}, [messages])

	if(loading || currentWorldLoading){
		return <></>;
	}

	const submitComment = async () => {
		if(comment){
			await gameChat(currentGame._id, comment);
			await setComment(null);
		}
	};

	return <>
		<SlidingDrawer title={`Game ID: ${currentGame._id}`} startVisible={true} placement={'right'}>
			<Button style={{margin: '20px'}} type={'primary'} onClick={async () => {
				await leaveGame(currentGame._id)}
			}>Leave Game</Button>
			<Collapse defaultActiveKey={['1']}>
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
				<Collapse.Panel header="Game Chat" key="2">
					<div
						id={'chat'}
						style={{
							overflowY: 'scroll',
							overflowX: 'hidden',
							height: '512px'
						}}
					>
						<List
							dataSource={messages}
							itemLayout="horizontal"
							locale={{emptyText: <div>No messages</div>}}
							renderItem={({sender, timestamp, message}) => {
								const date = new Date(parseInt(timestamp));
								const hours = date.getHours();
								const minutes = "0" + date.getMinutes();
								const seconds = "0" + date.getSeconds();

								return <Comment author={sender} content={<p>{message}</p>} datetime={`${hours}:${minutes.substr(-2)}:${seconds.substr(-2)}`}/>;
							}}
						/>
					</div>

					<Comment
						content={
							<>
								<Form.Item>
									<Input.TextArea disabled={chatLoading} rows={4} onChange={async value => {await setComment(value.target.value)}} value={comment} onPressEnter={submitComment}/>
								</Form.Item>
								<Form.Item>
								<Button htmlType="submit" loading={chatLoading} onClick={submitComment} type="primary">
									Add Comment
								</Button>
								</Form.Item>
							</>
						}
					/>
				</Collapse.Panel>
				{currentGame.canWrite &&
					<Collapse.Panel header="Brush Options" key="3">
						<BrushOptions renderer={renderer}/>
					</Collapse.Panel>
				}
				{currentGame.canWrite &&
					<Collapse.Panel header="Add Models" key="4">
						<AddModelSection renderer={renderer}/>
					</Collapse.Panel>
				}

				<Collapse.Panel header="Current Location" key="5">

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
								<Button onClick={async() => {await setGameMap(currentGame._id, selectedLocation)}} disabled={!selectedLocation}>Change location</Button>
							</div>
						</div>
					}
				</Collapse.Panel>

			</Collapse>
		</SlidingDrawer>
	</>;
};
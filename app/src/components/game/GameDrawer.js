import React, {useEffect, useState} from 'react';
import {SlidingDrawer} from "../SlidingDrawerV2";
import useCurrentGame from "../../hooks/useCurrentGame";
import {LoadingView} from "../LoadingView";
import {Collapse, Comment, Input, Form, Button, List} from "antd";
import {useGameChat} from "../../hooks/useGameChat";
import {useGameChatSubscription} from "../../hooks/useGameChatSubscription";
import {usePlayerJoinedSubscription} from "../../hooks/usePlayerJoinedSubscription";
import useLeaveGame from "../../hooks/useLeaveGame";
import useCurrentWorld from "../../hooks/useCurrentWorld";
import {useHistory} from 'react-router-dom';

export const GameDrawer = () => {
	const {currentGame, loading} = useCurrentGame();
	const{currentWorld} = useCurrentWorld();
	const {gameChat, loading: chatLoading} = useGameChat();
	const [comment, setComment] = useState();
	const {game} = useGameChatSubscription();
	const {game: playerJoinedGame} = usePlayerJoinedSubscription();
	const history = useHistory();
	const {leaveGame} = useLeaveGame(() => {
		history.push(`/ui/world/${currentWorld._id}/gameLogin`);
	});

	useEffect(() => {
		const element = document.getElementById("chat");
		if(element){
			element.scrollTop = element.scrollHeight;
		}
	}, [game]);

	if(loading){
		return <LoadingView/>;
	}

	const submitComment = async () => {
		if(comment){
			await gameChat(currentGame._id, comment);
			await setComment(null);
		}
	};

	return <>
		<SlidingDrawer title={`Game ID: ${currentGame._id}`} startVisible={true}>
			<Button type={'primary'} onClick={async () => {await leaveGame(currentGame._id)}}>Leave Game</Button>
			<Collapse defaultActiveKey={['1']}>
				<Collapse.Panel header="Players" key="1">
					<List
						dataSource={currentGame.players}
						itemLayout="horizontal"
						locale={{emptyText: <div>No players</div>}}
						renderItem={({username}) =>
							<List.Item>
								{username}
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
							dataSource={currentGame.messages}
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
									<Input.TextArea rows={4} onChange={async value => {await setComment(value.target.value)}} value={comment} onPressEnter={submitComment}/>
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
					<>
						<Collapse.Panel header="Drawing" key="2">
						</Collapse.Panel>
						<Collapse.Panel header="Models" key="2">
						</Collapse.Panel>
					</>
				}
			</Collapse>
		</SlidingDrawer>
	</>;
};
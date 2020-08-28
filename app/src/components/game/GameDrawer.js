import React, {useState} from 'react';
import {SlidingDrawer} from "../SlidingDrawerV2";
import useCurrentGame from "../../hooks/useCurrentGame";
import {LoadingView} from "../LoadingView";
import {Collapse, Comment, Input, Form, Button, List} from "antd";
import {useGameChat} from "../../hooks/useGameChat";


export const GameDrawer = () => {
	const {currentGame, loading} = useCurrentGame();
	const {gameChat, loading: chatLoading} = useGameChat();
	const [comment, setComment] = useState();

	if(loading){
		return <LoadingView/>;
	}

	const Editor = ({ onChange, onSubmit, submitting, value }) => (
		<>
			<Form.Item>
				<Input.TextArea rows={4} onChange={onChange} value={value} />
			</Form.Item>
			<Form.Item>
				<Button htmlType="submit" loading={submitting} onClick={onSubmit} type="primary">
					Add Comment
				</Button>
			</Form.Item>
		</>
	);

	return <>
		<SlidingDrawer title={`Game ID: ${currentGame._id}`} startVisible={true}>
			<Collapse defaultActiveKey={['1']}>
				<Collapse.Panel header="Players" key="1">
					<List
						dataSource={currentGame.players}
						itemLayout="horizontal"
						renderItem={({username}) =>
							<List.Item>
								{username}
							</List.Item>
						}
					/>
				</Collapse.Panel>
				<Collapse.Panel header="Game Chat" key="2">
					<List
						dataSource={currentGame.messages}
						itemLayout="horizontal"
						renderItem={({sender, timestamp, message}) => {
							const date = new Date(timestamp);
							const hours = date.getHours();
							const minutes = "0" + date.getMinutes();
							const seconds = "0" + date.getSeconds();

							return <Comment author={sender} content={message} datetime={`${hours}:${minutes.substr(-2)}:${seconds.substr(-2)}`}/>;
						}}
					/>
					<Comment
						content={
							<Editor
								onChange={async value => await setComment(value)}
								onSubmit={async () => {await gameChat(currentGame, comment)}}
								submitting={chatLoading}
								value={comment}
							/>
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
			</Collapse>,
		</SlidingDrawer>
	</>;
};
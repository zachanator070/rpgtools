
import React from 'react';
import {List, Row, Col, Form, Input, Button} from "antd";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import {LoadingView} from "../LoadingView";
import useCreateGame from "../../hooks/game/useCreateGame";
import useJoinGame from "../../hooks/game/useJoinGame";
import {Link, useHistory} from "react-router-dom";
import useMyGames from "../../hooks/game/useMyGames";

export const GameLoginView = () => {

	const history = useHistory();

	const {currentWorld, loading} = useCurrentWorld();
	const {myGames, loading: myGamesLoading, refetch} = useMyGames();

	const {createGame, loading: createGameLoading} = useCreateGame(async (data) => {
		await refetch();
		history.push(`/ui/world/${currentWorld._id}/game/${data.createGame._id}`);
	});
	const {joinGame, loading: joinGameLoading} = useJoinGame(async (data) => {
		await refetch();
		history.push(`/ui/world/${currentWorld._id}/game/${data.joinGame._id}`);
	});

	const layout = {
		labelCol: {
			span: 8,
		},
		wrapperCol: {
			span: 16,
		},
	};
	const tailLayout = {
		wrapperCol: {
			offset: 8,
			span: 16,
		},
	};

	const onFinishFailed = errorInfo => {
		console.log('Failed:', errorInfo);
	};

	if(loading || myGamesLoading){
		return <LoadingView/>;
	}

	return <>
		<Row>
			<Col span={8}/>
			<Col span={8}>
				<div className={'margin-lg-top margin-lg-bottom'}>
				<h1>My Games</h1>
				<List
					bordered={true}
					dataSource={myGames}
					renderItem={(item) => {
						return <List.Item><Link to={`/ui/world/${currentWorld._id}/game/${item._id}`}>${item._id}</Link></List.Item>;
					}}
				/>
				</div>
			</Col>
			<Col span={8}/>
		</Row>

		{currentWorld.canHostGame &&
			<Row>
				<Col span={8}/>
				<Col span={8}>
					<h1>Create Game</h1>
					<Form
						{...layout}
						name="basic"
						initialValues={{
							remember: true,
						}}
						onFinish={createGame}
						onFinishFailed={onFinishFailed}
					>

						<Form.Item
							label="Password"
							name="createPassword"
						>
							<Input.Password />
						</Form.Item>

						<Form.Item
							label="Character Name"
							name="characterName"
						>
							<Input />
						</Form.Item>

						<Form.Item {...tailLayout}>
							<Button type="primary" htmlType="submit" disabled={createGameLoading || joinGameLoading}>
								Create Game
							</Button>
						</Form.Item>
					</Form>
				</Col>
				<Col span={8}/>
			</Row>
		}
		<Row>
			<Col span={8}/>
			<Col span={8}>
				<h1>Join Game</h1>
				<Form
					{...layout}
					name="basic"
					initialValues={{
						remember: true,
					}}
					onFinish={joinGame}
					onFinishFailed={onFinishFailed}
				>
					<Form.Item
						label="Game ID"
						name="gameId"
						rules={[
							{
								required: true,
								message: 'Please input the game id that you wish to join!',
							},
						]}
					>
						<Input />
					</Form.Item>

					<Form.Item
						label="Password"
						name="password"
					>
						<Input.Password />
					</Form.Item>

					<Form.Item
						label="Character Name"
						name="characterName"
					>
						<Input />
					</Form.Item>

					<Form.Item {...tailLayout}>
						<Button type="primary" htmlType="submit" disabled={createGameLoading || joinGameLoading}>
							Join Game
						</Button>
					</Form.Item>
				</Form>
			</Col>
			<Col span={8}/>
		</Row>
	</>;
};
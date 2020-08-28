
import React from 'react';
import {Row, Col, Form, Input, Button} from "antd";
import useCurrentWorld from "../../hooks/useCurrentWorld";
import {LoadingView} from "../LoadingView";
import useCreateGame from "../../hooks/useCreateGame";
import useJoinGame from "../../hooks/useJoinGame";
import {useHistory} from "react-router-dom";

export const GameLoginView = () => {

	const history = useHistory();

	const {currentWorld, loading} = useCurrentWorld();
	const {createGame, loading: createGameLoading} = useCreateGame((data) => {
		history.push(`/ui/world/${currentWorld._id}/game/${data.createGame._id}`);
	});
	const {joinGame, loading: joinGameLoading} = useJoinGame((data) => {
		history.push(`/ui/world/${currentWorld._id}/game/${data.createGame._id}`);
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

	if(loading){
		return <LoadingView/>;
	}

	return <>
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
						onFinish={async ({createPassword}) => {
							await createGame(createPassword);
						}}
						onFinishFailed={onFinishFailed}
					>

						<Form.Item
							label="Password"
							name="createPassword"
						>
							<Input.Password />
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
					onFinish={async ({gameId, password}) => {
						await joinGame(gameId, password);
					}}
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
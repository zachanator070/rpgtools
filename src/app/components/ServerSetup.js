import React, {useState} from 'react';
import {Button, Col, Form, Icon, Input, Modal, Row} from "antd";
import useUnlockServer from "../hooks/useUnlockServer";
import {useHistory} from 'react-router-dom';

export const ServerSetup = () => {
	const [email, setEmail] = useState('');
	const [unlockCode, setUnlockCode] = useState('');
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [repeatPassword, setRepeatPassword] = useState('');
	const {unlockServer, loading} = useUnlockServer();
	const history = useHistory();
	const formItemLayout = {
		labelCol: {span: 5},
		wrapperCol: {span: 14},
	};
	return <Row>
		<Col span={4}></Col>
		<Col span={16}>

			<div>
				<h1>Server needs unlocking</h1>
				<p>
					The server has not been configured with an admin user yet, please retrieve the server unlock code from
					the server logs or from the server document in the servers collection in mongodb, then register an admin
					user.
				</p>
			</div>
			<Form layout='horizontal'>
				<Form.Item label="Server Unlock Code" {...formItemLayout}>
					<Input
						placeholder="somesecret12345"
						prefix={<Icon type="key" style={{color: 'rgba(0,0,0,.25)'}}/>}
						value={unlockCode}
						onChange={(e) => setUnlockCode(e.target.value)}
						name='adminSecret'
						id='adminSecret'
						autoComplete='adminSecret'
					/>
				</Form.Item>
				<Form.Item label="Email" {...formItemLayout}>
					<Input
						placeholder="zach@thezachcave.com"
						prefix={<Icon type="mail" style={{color: 'rgba(0,0,0,.25)'}}/>}
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						name='registerEmail'
						id='registerEmail'
						autoComplete='registerEmail'
					/>
				</Form.Item>
				<Form.Item label="Username" {...formItemLayout}>
					<Input
						placeholder="DragonSlayer1234"
						prefix={<Icon type="user" style={{color: 'rgba(0,0,0,.25)'}}/>}
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						name='registerDisplayName'
						id='registerDisplayName'
						autoComplete='registerDisplayName'
					/>
				</Form.Item>
				<Form.Item label="Password" {...formItemLayout} >
					<Input
						placeholder="$up3r$3cr37"
						prefix={<Icon type="key" style={{color: 'rgba(0,0,0,.25)'}}/>}
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						type='password'
						name='registerPassword'
						id='registerPassword'
						autoComplete='registerPassword'
					/>
				</Form.Item>
				<Form.Item label="Repeat Password" {...formItemLayout} >
					<Input
						placeholder="$up3r$3cr37"
						prefix={<Icon type="key" style={{color: 'rgba(0,0,0,.25)'}}/>}
						value={repeatPassword}
						onChange={(e) => setRepeatPassword(e.target.value)}
						type='password'
						name='registerRepeatPassword'
						id='registerRepeatPassword'
						autoComplete='registerRepeatPassword'
					/>
				</Form.Item>
			</Form>
			<Button type="primary" htmlType="submit" disabled={false} onClick={async () => {
				try {
					await unlockServer(unlockCode, email, username, password);
					history.push('/');
				} catch {
				}

			}}>Unlock</Button>
		</Col>
		<Col span={4}></Col>
	</Row>;
};
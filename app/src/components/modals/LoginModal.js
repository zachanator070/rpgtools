import React, {useState} from 'react';
import {Button, Form, Input, Modal} from "antd";
import { UserOutlined, KeyOutlined} from '@ant-design/icons';
import useLogin from "../../hooks/useLogin";

export const LoginModal = ({visibility, setVisibility}) => {

	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');

	const {login, loading, errors} = useLogin(async () => {
		await setVisibility(false)
	});

	const formItemLayout = {
		labelCol: {span: 5},
		wrapperCol: {span: 14},
	};
	const noLabelItem = {
		wrapperCol: {span: 10, offset: 4}
	};

	return (
		<Modal
			title="Login"
			visible={visibility}
			centered
			onCancel={async () => await setVisibility(false)}
			footer={null}
		>
			{errors.join('/n')}
			<>
				<Form layout='horizontal'>
					<Form.Item
						label="Username"
						{...formItemLayout}
					>
						<Input
							placeholder="zach"
							prefix={<UserOutlined style={{color: 'rgba(0,0,0,.25)'}}/>}
							value={username}
							onChange={(event) => {
								setUsername(event.target.value)
							}}
							name="loginEmail"
							id="loginEmail"
							autoComplete="loginEmail"
						/>
					</Form.Item>
					<Form.Item
						label="Password"
						{...formItemLayout}
					>
						<Input
							placeholder="$up3r$3cr37"
							prefix={<KeyOutlined style={{color: 'rgba(0,0,0,.25)'}}/>}
							value={password}
							onChange={(event) => {
								setPassword(event.target.value)
							}}
							type='password'
							name='loginPassword'
							id='loginPassword'
							autoComplete='loginPassword'
						/>
					</Form.Item>
				</Form>
				<Button type="primary" disabled={loading} onClick={
					async () => {
						try {
							await login(username, password);
						} catch {
						}
					}
				}>Login</Button>
			</>

		</Modal>
	);

};
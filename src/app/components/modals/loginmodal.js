import React, {useState} from 'react';
import {Button, Form, Icon, Input, Modal} from "antd";
import useLogin from "../../hooks/useLogin";
import useLoginModalVisibility from "../../hooks/useLoginModalVisibility";
import useSetLoginModalVisibility from "../../hooks/useSetLoginModalVisibility";

export default function LoginModal() {

	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');

	const {data} = useLoginModalVisibility();
	const [setLoginModalVisibility] = useSetLoginModalVisibility();
	const [login, {loading, errors}] = useLogin(async () => {
		await setLoginModalVisibility({variables: {visibility: false}})
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
			visible={data.loginModalVisibility}
			centered
			onCancel={async () => await setLoginModalVisibility({variables: {visibility: false}})}
			footer={null}
		>
			{errors && errors.graphQLErrors.map(error => error.message).join('/n')}
			<>
				<Form layout='horizontal'>
					<Form.Item
						label="Username"
						{...formItemLayout}
					>
						<Input
							placeholder="zach"
							prefix={<Icon type="user" style={{color: 'rgba(0,0,0,.25)'}}/>}
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
							prefix={<Icon type="key" style={{color: 'rgba(0,0,0,.25)'}}/>}
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
							await login({variables: {username, password}});
						} catch {
						}
					}
				}>Login</Button>
			</>

		</Modal>
	);

};
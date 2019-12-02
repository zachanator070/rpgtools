import React, {useState} from 'react';
import {Button, Form, Icon, Input, Modal} from "antd";
import useRegisterModalVisibility from "../../hooks/useRegisterModalVisibility";
import useSetRegisterModalVisibility from "../../hooks/useSetRegisterModalVisibility";
import useRegister from "../../hooks/useRegister";
import useLogin from "../../hooks/useLogin";

export default function RegisterModal() {

	const [email, setEmail] = useState('');
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [repeatPassword, setRepeatPassword] = useState('');

	const {data} = useRegisterModalVisibility();
	const [setRegisterModalVisibility] = useSetRegisterModalVisibility();
	const [register, {loading, errors}] = useRegister(async () => await setRegisterModalVisibility({variables: {visibility: false}}));
	const [login] = useLogin();

	const formItemLayout = {
		labelCol: {span: 5},
		wrapperCol: {span: 14},
	};
	const noLabelItem = {
		wrapperCol: {span: 10, offset: 4}
	};

	return (
		<div>
			<Modal
				title="Register"
				visible={data.registerModalVisibility}
				centered
				onCancel={async () => await setRegisterModalVisibility({variables: {visibility: false}})}
				footer={null}
				width={720}
			>
				{errors && errors.graphQLErrors.map(error => error.message).join('/n')}
				<Form layout='horizontal'>
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
				<Button type="primary" htmlType="submit" disabled={loading} onClick={async () => {
					try {
						await register({variables: {email, username, password}});
						await login({variables: {username, password}});
						setEmail('');
						setUsername('');
						setPassword('');
						setRepeatPassword('');
					} catch {
					}

				}}>Register</Button>
			</Modal>
		</div>
	);
}

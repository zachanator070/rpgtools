import React, { useState } from "react";
import { Button, Form, Input, Modal } from "antd";
import useRegister from "../../hooks/authentication/useRegister";
import useLogin from "../../hooks/authentication/useLogin";
import { KeyOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";

interface RegisterModalProps {
	visibility: boolean;
	setVisibility: (visibility: boolean) => Promise<void>;
}

export const RegisterModal = ({ visibility, setVisibility }: RegisterModalProps) => {
	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [repeatPassword, setRepeatPassword] = useState("");
	const [registerCode, setRegisterCode] = useState("");

	const { register, loading, errors } = useRegister(
		async () => await setVisibility(false)
	);
	const { login } = useLogin();

	const formItemLayout = {
		labelCol: { span: 5 },
		wrapperCol: { span: 14 },
	};

	return (
		<div>
			<Modal
				title="Register"
				visible={visibility}
				centered
				onCancel={async () => await setVisibility(false)}
				footer={null}
				width={720}
			>
				{errors.join("/n")}
				<Form layout="horizontal">
					<Form.Item label="Register Code" {...formItemLayout}>
						<Input
							placeholder="$up3r$3cr37"
							prefix={<KeyOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
							value={registerCode}
							onChange={(e) => setRegisterCode(e.target.value)}
							name="registerCode"
							id="registerCode"
							autoComplete="registerCode"
						/>
					</Form.Item>
					<Form.Item label="Email" {...formItemLayout}>
						<Input
							placeholder="zach@thezachcave.com"
							prefix={<MailOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							name="registerEmail"
							id="registerEmail"
							autoComplete="registerEmail"
						/>
					</Form.Item>
					<Form.Item label="Username" {...formItemLayout}>
						<Input
							placeholder="DragonSlayer1234"
							prefix={<UserOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							name="registerDisplayName"
							id="registerDisplayName"
							autoComplete="registerDisplayName"
						/>
					</Form.Item>
					<Form.Item label="Password" {...formItemLayout}>
						<Input
							placeholder="$up3r$3cr37"
							prefix={<KeyOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							type="password"
							name="registerPassword"
							id="registerPassword"
							autoComplete="registerPassword"
						/>
					</Form.Item>
					<Form.Item label="Repeat Password" {...formItemLayout}>
						<Input
							placeholder="$up3r$3cr37"
							prefix={<KeyOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
							value={repeatPassword}
							onChange={(e) => setRepeatPassword(e.target.value)}
							type="password"
							name="registerRepeatPassword"
							id="registerRepeatPassword"
							autoComplete="registerRepeatPassword"
						/>
					</Form.Item>
				</Form>
				<Button
					type="primary"
					htmlType="submit"
					disabled={loading}
					onClick={async () => {
						try {
							await register({registerCode, email, username, password});
							await login({username, password});
							setEmail("");
							setUsername("");
							setPassword("");
							setRepeatPassword("");
						} catch {}
					}}
				>
					Register
				</Button>
			</Modal>
		</div>
	);
};

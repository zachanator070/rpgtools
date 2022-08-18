import React from "react";
import useRegister from "../../hooks/authentication/useRegister";
import useLogin from "../../hooks/authentication/useLogin";
import { KeyOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";
import FullScreenModal from "../widgets/FullScreenModal";
import InputForm from "../widgets/InputForm";
import FormItem from "../widgets/FormItem";
import TextInput from "../widgets/TextInput";
import PasswordInput from "../widgets/PasswordInput";

interface RegisterModalProps {
	visibility: boolean;
	setVisibility: (visibility: boolean) => Promise<void>;
}

export default function RegisterModal({ visibility, setVisibility }: RegisterModalProps) {

	const { register, loading, errors } = useRegister(
		async () => await setVisibility(false)
	);
	const { login, loading: loginLoading } = useLogin();

	return (
		<div>
			<FullScreenModal
				title="Register"
				visible={visibility}
				setVisible={setVisibility}
			>
				<InputForm
					errors={errors}
					loading={loginLoading || loading}
					onSubmit={async ({registerCode, email, username, password}) => {
						await register({registerCode, email, username, password});
						await login({username, password});
					}}
				>
					<FormItem name="registerCode" label={<>Register Code <KeyOutlined style={{ color: "rgba(0,0,0,.25)" }} /></>}>
						<TextInput id="registerCode"/>
					</FormItem>
					<FormItem name="email" label={<>Email <MailOutlined style={{ color: "rgba(0,0,0,.25)" }} /></>}>
						<TextInput id="registerEmail"/>
					</FormItem>
					<FormItem name="username" label={<>Username <UserOutlined style={{ color: "rgba(0,0,0,.25)" }} /></>}>
						<TextInput id="registerDisplayName"/>
					</FormItem>
					<FormItem name="password" label={<>Password <KeyOutlined style={{ color: "rgba(0,0,0,.25)" }} /></>}>
						<PasswordInput id="registerPassword"/>
					</FormItem>
					<FormItem name="repeatPassword" label={<>Repeat Password <KeyOutlined style={{ color: "rgba(0,0,0,.25)" }} /></>}>
						<PasswordInput id="registerRepeatPassword"/>
					</FormItem>
				</InputForm>
			</FullScreenModal>
		</div>
	);
};

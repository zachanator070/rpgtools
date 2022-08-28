import React from "react";
import useRegister from "../../hooks/authentication/useRegister";
import useLogin from "../../hooks/authentication/useLogin";
import FullScreenModal from "../widgets/FullScreenModal";
import InputForm from "../widgets/InputForm";
import FormItem from "../widgets/FormItem";
import TextInput from "../widgets/TextInput";
import PasswordInput from "../widgets/PasswordInput";
import KeyIcon from "../widgets/icons/KeyIcon";
import PersonIcon from "../widgets/icons/PersonIcon";
import MailIcon from "../widgets/icons/MailIcon";

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
					<FormItem name="registerCode" label={<>Register Code <KeyIcon/></>}>
						<TextInput id="registerCode"/>
					</FormItem>
					<FormItem name="email" label={<>Email <MailIcon/></>}>
						<TextInput id="registerEmail"/>
					</FormItem>
					<FormItem name="username" label={<>Username <PersonIcon/></>}>
						<TextInput id="registerDisplayName"/>
					</FormItem>
					<FormItem name="password" label={<>Password <KeyIcon/></>}>
						<PasswordInput id="registerPassword"/>
					</FormItem>
					<FormItem name="repeatPassword" label={<>Repeat Password <KeyIcon/></>}>
						<PasswordInput id="registerRepeatPassword"/>
					</FormItem>
				</InputForm>
			</FullScreenModal>
		</div>
	);
};

import React from "react";
import useRegister from "../../hooks/authentication/useRegister.js";
import useLogin from "../../hooks/authentication/useLogin.js";
import FullScreenModal from "../widgets/FullScreenModal.tsx";
import InputForm from "../widgets/input/InputForm.tsx";
import FormItem from "../widgets/input/FormItem.tsx";
import TextInput from "../widgets/input/TextInput.tsx";
import PasswordInput from "../widgets/input/PasswordInput.tsx";
import KeyIcon from "../widgets/icons/KeyIcon.tsx";
import PersonIcon from "../widgets/icons/PersonIcon.tsx";
import MailIcon from "../widgets/icons/MailIcon.tsx";

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
					buttonText={'Register'}
				>
					<FormItem label={<>Register Code <KeyIcon/></>}>
						<TextInput name="registerCode" id="registerCode"/>
					</FormItem>
					<FormItem label={<>Email <MailIcon/></>}>
						<TextInput name="email" id="registerEmail"/>
					</FormItem>
					<FormItem label={<>Username <PersonIcon/></>}>
						<TextInput name="username" id="registerDisplayName"/>
					</FormItem>
					<FormItem label={<>Password <KeyIcon/></>}>
						<PasswordInput name="password" id="registerPassword"/>
					</FormItem>
					<FormItem label={<>Repeat Password <KeyIcon/></>}>
						<PasswordInput name="repeatPassword" id="registerRepeatPassword"/>
					</FormItem>
				</InputForm>
			</FullScreenModal>
		</div>
	);
};

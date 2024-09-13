import React from "react";
import useLogin from "../../hooks/authentication/useLogin.js";
import FullScreenModal from "../widgets/FullScreenModal.js";
import InputForm from "../widgets/input/InputForm.js";
import FormItem from "../widgets/input/FormItem.js";
import TextInput from "../widgets/input/TextInput.js";
import PasswordInput from "../widgets/input/PasswordInput.js";
import PersonIcon from "../widgets/icons/PersonIcon.js";
import KeyIcon from "../widgets/icons/KeyIcon.js";
import InlineMargin from "../widgets/InlineMargin.js";

interface LoginModalProps {
	visibility: boolean;
	setVisibility: (visibility: boolean) => Promise<void>;
}

export default function LoginModal({ visibility, setVisibility }: LoginModalProps) {

	const { login, loading, errors } = useLogin(async () => {
		await setVisibility(false);
	});

	return (
		<FullScreenModal
			title="Login"
			visible={visibility}
			setVisible={setVisibility}
		>
			<InputForm
				errors={errors}
				loading={loading}
				onSubmit={async ({username, password}) => {
					await login({username, password})
				}}
				buttonText={'Login'}
			>
				<FormItem
					label={<>Username <InlineMargin size={1}><PersonIcon/></InlineMargin></> }
				>
					<TextInput name={"username"} id="loginEmail"/>
				</FormItem>
				<FormItem
					label={<>Password <InlineMargin size={1}><KeyIcon/></InlineMargin></>}
				>
					<PasswordInput name={"password"} id="loginPassword"/>
				</FormItem>
			</InputForm>
		</FullScreenModal>
	);
};

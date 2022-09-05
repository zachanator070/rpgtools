import React from "react";
import useLogin from "../../hooks/authentication/useLogin";
import FullScreenModal from "../widgets/FullScreenModal";
import InputForm from "../widgets/input/InputForm";
import FormItem from "../widgets/input/FormItem";
import TextInput from "../widgets/input/TextInput";
import PasswordInput from "../widgets/input/PasswordInput";
import PersonIcon from "../widgets/icons/PersonIcon";
import KeyIcon from "../widgets/icons/KeyIcon";
import InlineMargin from "../widgets/InlineMargin";

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

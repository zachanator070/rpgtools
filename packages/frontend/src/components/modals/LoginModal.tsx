import React from "react";
import useLogin from "../../hooks/authentication/useLogin";
import FullScreenModal from "../widgets/FullScreenModal";
import InputForm from "../widgets/input/InputForm";
import FormItem from "../widgets/input/FormItem";
import TextInput from "../widgets/input/TextInput";
import PasswordInput from "../widgets/input/PasswordInput";
import PersonIcon from "../widgets/icons/PersonIcon";
import KeyIcon from "../widgets/icons/KeyIcon";
import PrimaryButton from "../widgets/PrimaryButton";

interface LoginModalProps {
	visibility: boolean;
	setVisibility: (visibility: boolean) => Promise<void>;
	ssoConfigured: boolean;
}

export default function LoginModal({ visibility, setVisibility, ssoConfigured }: LoginModalProps) {

	const { login, loading, errors } = useLogin(async () => {
		await setVisibility(false);
	});

	return (
		<FullScreenModal
			title={"Login"}
			visible={visibility}
			setVisible={setVisibility}
		>
			<div>
				{ssoConfigured && (
					<div className="margin-sm-top text-align-center">
						<PrimaryButton id="loginWithGoogleButton" onClick={async () => window.location.assign("/auth/sso/start")}>
							Login with Google
						</PrimaryButton>
						<div className="margin-lg-bottom margin-lg-top">
							or
						</div>
					</div>
				)}
				<InputForm
					errors={errors}
					loading={loading}
					onSubmit={async ({username, password}) => {
						await login({username, password})
					}}
					buttonText={'Login'}
				>
					<FormItem
						label={<>Username <PersonIcon className="form-label-icon"/></> }
					>
						<TextInput name={"username"} id="loginEmail"/>
					</FormItem>
					<FormItem
						label={<>Password <KeyIcon className="form-label-icon"/></>}
					>
						<PasswordInput name={"password"} id="loginPassword"/>
					</FormItem>
				</InputForm>
			</div>
		</FullScreenModal>
	);
};

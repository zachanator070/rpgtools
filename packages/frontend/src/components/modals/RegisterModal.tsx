import React, {useState} from "react";
import useRegister from "../../hooks/authentication/useRegister";
import useLogin from "../../hooks/authentication/useLogin";
import FullScreenModal from "../widgets/FullScreenModal";
import InputForm from "../widgets/input/InputForm";
import FormItem from "../widgets/input/FormItem";
import TextInput from "../widgets/input/TextInput";
import PasswordInput from "../widgets/input/PasswordInput";
import KeyIcon from "../widgets/icons/KeyIcon";
import PersonIcon from "../widgets/icons/PersonIcon";
import MailIcon from "../widgets/icons/MailIcon";
import PrimaryButton from "../widgets/PrimaryButton";

interface RegisterModalProps {
	visibility: boolean;
	setVisibility: (visibility: boolean) => Promise<void>;
	ssoConfigured: boolean;
}

export default function RegisterModal({ visibility, setVisibility, ssoConfigured }: RegisterModalProps) {
	const [useSsoRegistration, setUseSsoRegistration] = useState(false);
	const [ssoErrors, setSsoErrors] = useState<string[]>([]);
	const [ssoLoading, setSsoLoading] = useState(false);

	const { register, loading, errors } = useRegister(
		async () => await setVisibility(false)
	);
	const { login, loading: loginLoading } = useLogin();

	const submitSsoRegistration = async (username: string) => {
		setSsoErrors([]);
		const normalizedUsername = username?.trim();
		if (!normalizedUsername) {
			setSsoErrors(["Username is required"]);
			return;
		}

		try {
			setSsoLoading(true);
			const response = await fetch("/auth/sso/start", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ username: normalizedUsername }),
			});

			const responseBody = await response.json();
			if (!response.ok || !responseBody?.redirectUrl) {
				setSsoErrors([responseBody?.error || "Could not start SSO flow"]);
				return;
			}

			window.location.assign(responseBody.redirectUrl);
		} catch (_err) {
			setSsoErrors(["Could not start SSO flow"]);
		} finally {
			setSsoLoading(false);
		}
	};

	return (
		<div>
			<FullScreenModal
				title={useSsoRegistration ? "Register with Google" : "Register"}
				visible={visibility}
				setVisible={setVisibility}
			>
				{ssoConfigured && (
					<div className="text-align-center margin-lg-bottom">
						{useSsoRegistration ? (
							<PrimaryButton onClick={async () => setUseSsoRegistration(false)}>
								Use password registration
							</PrimaryButton>
						) : (
							<PrimaryButton onClick={async () => setUseSsoRegistration(true)}>
								Register with Google
							</PrimaryButton>
						)}
					</div>
				)}
				<InputForm
					errors={useSsoRegistration ? ssoErrors : errors}
					loading={useSsoRegistration ? ssoLoading : loginLoading || loading}
					onSubmit={async ({email, username, password}) => {
						if (useSsoRegistration) {
							await submitSsoRegistration(username);
							return;
						}
						await register({email, username, password});
						await login({username, password});
					}}
					buttonText={useSsoRegistration ? "Continue with Google" : "Register"}
				>
					{!useSsoRegistration && (
						<FormItem label={<>Email <MailIcon/></>}>
							<TextInput name="email" id="registerEmail"/>
						</FormItem>
					)}
					<FormItem label={<>Username <PersonIcon/></>}>
						<TextInput name="username" id="registerDisplayName"/>
					</FormItem>
					{!useSsoRegistration && (
						<>
							<FormItem label={<>Password <KeyIcon/></>}>
								<PasswordInput name="password" id="registerPassword"/>
							</FormItem>
							<FormItem label={<>Repeat Password <KeyIcon/></>}>
								<PasswordInput name="repeatPassword" id="registerRepeatPassword"/>
							</FormItem>
						</>
					)}
				</InputForm>
			</FullScreenModal>
		</div>
	);
};

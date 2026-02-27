import React, {useEffect, useState} from "react";
import useRegister from "../../hooks/authentication/useRegister";
import useLogin from "../../hooks/authentication/useLogin";
import FullScreenModal from "../widgets/FullScreenModal";
import PrimaryButton from "../widgets/PrimaryButton";
import RegisterPasswordForm from "./RegisterPasswordForm";
import RegisterSsoForm from "./RegisterSsoForm";
import LeftArrowIcon from "../widgets/icons/LeftArrowIcon";

interface RegisterModalProps {
	visibility: boolean;
	setVisibility: (visibility: boolean) => Promise<void>;
	ssoConfigured: boolean;
}

enum RegistrationMethod {
	Password,
	SSO
}

export default function RegisterModal({ visibility, setVisibility, ssoConfigured }: RegisterModalProps) {
	const [registrationMethod, setRegistrationMethod] = useState<RegistrationMethod>(null);
	const [ssoErrors, setSsoErrors] = useState<string[]>([]);
	const [ssoLoading, setSsoLoading] = useState(false);
	const [email, setEmail] = useState("");

	const { register, loading, errors } = useRegister(
		async () => await setVisibility(false)
	);
	const { login, loading: loginLoading } = useLogin();

	useEffect(() => {
		if (!visibility) {
			return;
		}

		const url = new URL(window.location.href);
		const inviteEmail = url.searchParams.get("invite") || "";
		if (inviteEmail) {
			setEmail(inviteEmail);
		}
	}, [visibility]);

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

	let visibleForm = null;

	if (registrationMethod === RegistrationMethod.SSO) {
		visibleForm = (
			<RegisterSsoForm
				errors={ssoErrors}
				loading={ssoLoading}
				onSubmit={submitSsoRegistration}
			/>
		);
	}
	if (!ssoConfigured || registrationMethod === RegistrationMethod.Password) {
		visibleForm = (
			<RegisterPasswordForm
				errors={errors}
				loading={loginLoading || loading}
				email={email}
				setEmail={setEmail}
				onSubmit={async ({email, username, password}) => {
					await register({email, username, password});
					await login({username, password});
				}}
			/>
		);
	}

	return (
		<div>
			<FullScreenModal
				title={registrationMethod === RegistrationMethod.SSO ? "Register with Google" : "Register Username/Password"}
				visible={visibility}
				setVisible={(visibility) => {
					if (!visibility) {
						setRegistrationMethod(null);
					}
					setVisibility(visibility);
				}}
			>
				<div>
					{ssoConfigured && (
						<>
							{registrationMethod === null ? (
								<div className="text-align-center margin-lg-bottom flex" style={{justifyContent: "space-evenly"}}>
									<PrimaryButton onClick={async () => setRegistrationMethod(RegistrationMethod.Password)}>
										Use password registration
									</PrimaryButton>
									<PrimaryButton onClick={async () => setRegistrationMethod(RegistrationMethod.SSO)}>
										Register with Google
									</PrimaryButton>
								</div>
							) : (
								<div>
									<a onClick={async () => setRegistrationMethod(null)}>
										<LeftArrowIcon /> Back
									</a>
								</div>
							)}
						</>
					)}
				</div>
				{visibleForm}
			</FullScreenModal>
		</div>
	);
};

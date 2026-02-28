import React, {useState} from "react";
import useUnlockServer from "../../hooks/server/useUnlockServer";
import { useNavigate } from "react-router-dom";
import useLogin from "../../hooks/authentication/useLogin";
import ColumnedContent from "../widgets/ColumnedContent";
import RegisterPasswordForm from "../modals/RegisterPasswordForm";
import RegisterSsoForm from "../modals/RegisterSsoForm";
import useServerConfig from "../../hooks/server/useServerConfig";
import PrimaryButton from "../widgets/PrimaryButton";

enum RegistrationMethod {
	Password,
	SSO
}

export default function ServerSetup() {
	const { unlockServer, loading, errors } = useUnlockServer();
	const [registrationMethod, setRegistrationMethod] = useState<RegistrationMethod>(null);
	const [ssoErrors, setSsoErrors] = useState<string[]>([]);
	const [ssoLoading, setSsoLoading] = useState(false);
	const [email, setEmail] = useState("");
	const navigate = useNavigate();
	const {serverConfig, refetch} = useServerConfig();
	const { login } = useLogin(async () => {
		await refetch();
		navigate('/');
	});

	const submitSsoSetup = async (username: string, redirectUrl?: string) => {
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
				body: JSON.stringify({ username: normalizedUsername, redirectUrl }),
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

	const ssoConfigured = !!serverConfig?.ssoConfigured;

	let visibleForm = (
		<RegisterPasswordForm
			errors={errors}
			loading={loading}
			email={email}
			setEmail={setEmail}
			onSubmit={async ({email, username, password}) => {
				await unlockServer(
					{email, username, password},
					{
						onCompleted: async () => {
							await login({username, password})
						}
					}
				);
			}}
		/>
	);

	if (ssoConfigured && registrationMethod === RegistrationMethod.SSO) {
		visibleForm = (
			<RegisterSsoForm
				errors={ssoErrors}
				loading={ssoLoading}
				redirectUrl="/auth/sso/setup"
				onSubmit={submitSsoSetup}
			/>
		);
	}

	return <ColumnedContent>
		<>
			<div>
				<div style={{textAlign: 'center'}}>
					<h1>Server needs unlocking</h1>
					<p>
						The server has not been configured with an admin user yet, please
						register the first admin user.
					</p>
				</div>
				{ssoConfigured && (
					<div className="text-align-center margin-lg-bottom flex" style={{justifyContent: "space-evenly"}}>
						<PrimaryButton onClick={async () => setRegistrationMethod(RegistrationMethod.Password)}>
							Use password registration
						</PrimaryButton>
						<PrimaryButton onClick={async () => setRegistrationMethod(RegistrationMethod.SSO)}>
							Register with Google
						</PrimaryButton>
					</div>
				)}

				{visibleForm}
			</div>
		</>
	</ColumnedContent>;
};

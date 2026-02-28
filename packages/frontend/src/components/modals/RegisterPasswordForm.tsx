import React, {useState} from "react";
import InputForm from "../widgets/input/InputForm";
import FormItem from "../widgets/input/FormItem";
import TextInput from "../widgets/input/TextInput";
import PasswordInput from "../widgets/input/PasswordInput";
import MailIcon from "../widgets/icons/MailIcon";
import PersonIcon from "../widgets/icons/PersonIcon";
import KeyIcon from "../widgets/icons/KeyIcon";

interface RegisterPasswordFormProps {
	errors: string[];
	loading: boolean;
	email: string;
	setEmail: (email: string) => void;
	onSubmit: (values: { email: string; username: string; password: string }) => Promise<void>;
}

export default function RegisterPasswordForm({
	errors,
	loading,
	email,
	setEmail,
	onSubmit,
}: RegisterPasswordFormProps) {
	const [passwordError, setPasswordError] = useState<string>(null);

	return (
		<InputForm
			errors={[
				...(errors || []),
				...(passwordError ? [passwordError] : []),
			]}
			loading={loading}
			onSubmit={async ({email, username, password, repeatPassword}) => {
				if (password !== repeatPassword) {
					setPasswordError("Passwords do not match");
					return;
				}

				setPasswordError(null);
				await onSubmit({email, username, password});
			}}
			buttonText={"Register"}
		>
			<FormItem label={<>Email <MailIcon className="form-label-icon"/></>}>
				<TextInput
					name="email"
					id="registerEmail"
					value={email}
					onChange={(event) => setEmail(event.target.value)}
				/>
			</FormItem>
			<FormItem label={<>Username <PersonIcon className="form-label-icon"/></>}>
				<TextInput name="username" id="registerDisplayName"/>
			</FormItem>
			<FormItem label={<>Password <KeyIcon className="form-label-icon"/></>}>
				<PasswordInput name="password" id="registerPassword"/>
			</FormItem>
			<FormItem label={<>Repeat Password <KeyIcon className="form-label-icon"/></>}>
				<PasswordInput name="repeatPassword" id="registerRepeatPassword"/>
			</FormItem>
		</InputForm>
	);
}
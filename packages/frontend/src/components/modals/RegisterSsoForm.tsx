import React from "react";
import InputForm from "../widgets/input/InputForm";
import FormItem from "../widgets/input/FormItem";
import TextInput from "../widgets/input/TextInput";
import PersonIcon from "../widgets/icons/PersonIcon";

interface RegisterSsoFormProps {
	errors: string[];
	loading: boolean;
	redirectUrl?: string;
	onSubmit: (username: string, redirectUrl?: string) => Promise<void>;
}

export default function RegisterSsoForm({ errors, loading, redirectUrl, onSubmit }: RegisterSsoFormProps) {
	return (
		<InputForm
			errors={errors}
			loading={loading}
			onSubmit={async ({username}) => {
				await onSubmit(username, redirectUrl);
			}}
			buttonText={"Continue with Google"}
		>
			<FormItem label={<>Username <PersonIcon className="form-label-icon"/></>}>
				<TextInput name="username" id="registerDisplayName"/>
			</FormItem>
		</InputForm>
	);
}
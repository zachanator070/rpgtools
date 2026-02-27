import React from "react";
import InputForm from "../widgets/input/InputForm";
import FormItem from "../widgets/input/FormItem";
import TextInput from "../widgets/input/TextInput";
import PersonIcon from "../widgets/icons/PersonIcon";

interface RegisterSsoFormProps {
	errors: string[];
	loading: boolean;
	onSubmit: (username: string) => Promise<void>;
}

export default function RegisterSsoForm({ errors, loading, onSubmit }: RegisterSsoFormProps) {
	return (
		<InputForm
			errors={errors}
			loading={loading}
			onSubmit={async ({username}) => {
				await onSubmit(username);
			}}
			buttonText={"Continue with Google"}
		>
			<FormItem label={<>Username <PersonIcon className="form-label-icon"/></>}>
				<TextInput name="username" id="registerDisplayName"/>
			</FormItem>
		</InputForm>
	);
}
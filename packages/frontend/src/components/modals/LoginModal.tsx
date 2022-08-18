import React from "react";
import { UserOutlined, KeyOutlined } from "@ant-design/icons";
import useLogin from "../../hooks/authentication/useLogin";
import FullScreenModal from "../widgets/FullScreenModal";
import InputForm from "../widgets/InputForm";
import FormItem from "../widgets/FormItem";
import TextInput from "../widgets/TextInput";
import PasswordInput from "../widgets/PasswordInput";

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
			>
				<FormItem
					label={<>Username <UserOutlined style={{ color: "rgba(0,0,0,.25)" }} /></> }
					name={"username"}
				>
					<TextInput id="loginEmail"/>
				</FormItem>
				<FormItem
					label={<>Password <KeyOutlined style={{ color: "rgba(0,0,0,.25)" }} /></>}
					name={"username"}
				>
					<PasswordInput id="loginPassword"/>
				</FormItem>
			</InputForm>
		</FullScreenModal>
	);
};

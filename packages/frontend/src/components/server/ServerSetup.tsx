import React from "react";
import useUnlockServer from "../../hooks/server/useUnlockServer";
import { useHistory } from "react-router-dom";
import useLogin from "../../hooks/authentication/useLogin";
import ColumnedContent from "../widgets/ColumnedContent";
import InputForm from "../widgets/InputForm";
import FormItem from "../widgets/FormItem";
import TextInput from "../widgets/TextInput";
import PasswordInput from "../widgets/PasswordInput";
import KeyIcon from "../widgets/icons/KeyIcon";
import MailIcon from "../widgets/icons/MailIcon";
import PersonIcon from "../widgets/icons/PersonIcon";

export default function ServerSetup() {
	const { unlockServer, loading, errors } = useUnlockServer();
	const history = useHistory();

	const { login } = useLogin(() => {
		history.push("/");
	});

	return <ColumnedContent>
		<>
			<div>
				<h1>Server needs unlocking</h1>
				<p>
					The server has not been configured with an admin user yet, please
					retrieve the server unlock code from the server logs or from the
					server document in the servers collection in mongodb, then register
					an admin user.
				</p>
			</div>
			<InputForm
				errors={errors}
				loading={loading}
				onSubmit={async ({unlockCode, email, username, password}) => {
					await unlockServer({unlockCode, email, username, password});
					await login({username, password});
				}}
			>
				<FormItem name={"unlockCode"} label={<>Server Unlock Code <KeyIcon/></>}>
					<TextInput id="adminSecret"/>
				</FormItem>
				<FormItem name={"email"} label={<>Email <MailIcon/></>}>
					<TextInput id="registerEmail"/>
				</FormItem>
				<FormItem name="username" label={<>Username <PersonIcon/></>}>
					<TextInput id="registerDisplayName"/>
				</FormItem>
				<FormItem name="password" label={<>Password <KeyIcon/></>}>
					<PasswordInput id="registerPassword"/>
				</FormItem>
				<FormItem name="repeatPassword" label={<>Repeat Password <KeyIcon/></>}>
					<PasswordInput id="registerRepeatPassword"/>
				</FormItem>
			</InputForm>
		</>
	</ColumnedContent>;
};

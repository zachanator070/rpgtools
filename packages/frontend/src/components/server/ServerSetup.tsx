import React, {useEffect} from "react";
import useUnlockServer from "../../hooks/server/useUnlockServer.js";
import { useNavigate } from "react-router-dom";
import useLogin from "../../hooks/authentication/useLogin.js";
import ColumnedContent from "../widgets/ColumnedContent.js";
import InputForm from "../widgets/input/InputForm.js";
import FormItem from "../widgets/input/FormItem.js";
import TextInput from "../widgets/input/TextInput.js";
import PasswordInput from "../widgets/input/PasswordInput.js";
import KeyIcon from "../widgets/icons/KeyIcon.js";
import MailIcon from "../widgets/icons/MailIcon.js";
import PersonIcon from "../widgets/icons/PersonIcon.js";
import InlineMargin from "../widgets/InlineMargin.js";
import useServerConfig from "../../hooks/server/useServerConfig.js";

export default function ServerSetup() {
	const { unlockServer, loading, errors } = useUnlockServer();
	const navigate = useNavigate();
	const {refetch} = useServerConfig();
	const { login } = useLogin(async () => {
		await refetch();
		navigate('/');
	});

	return <ColumnedContent>
		<>
			<div>
				<div style={{textAlign: 'center'}}>
					<h1>Server needs unlocking</h1>
					<p>
						The server has not been configured with an admin user yet, please
						retrieve the server unlock code from the server logs or from the
						server config table in the database, then register
						an admin user.
					</p>
				</div>

				<InputForm
					errors={errors}
					loading={loading}
					onSubmit={async ({unlockCode, email, username, password}) => {
						await unlockServer(
							{unlockCode, email, username, password},
							{
								onCompleted: async () => {
									await login({username, password})
								}
							});
					}}
					buttonText={'Unlock'}
				>
					<FormItem label={<>Server Unlock Code <InlineMargin size={1}><KeyIcon/></InlineMargin></>}>
						<TextInput name={"unlockCode"} id="adminSecret"/>
					</FormItem>
					<FormItem label={<>Email <InlineMargin size={1}><MailIcon/></InlineMargin></>}>
						<TextInput name={"email"} id="registerEmail"/>
					</FormItem>
					<FormItem label={<>Username <InlineMargin size={1}><PersonIcon/></InlineMargin></>}>
						<TextInput name={"username"} id="registerDisplayName"/>
					</FormItem>
					<FormItem label={<>Password <InlineMargin size={1}><KeyIcon/></InlineMargin></>}>
						<PasswordInput name={"password"} id="registerPassword"/>
					</FormItem>
					<FormItem label={<>Repeat Password <InlineMargin size={1}><KeyIcon/></InlineMargin></>}>
						<PasswordInput name={"repeatPassword"} id="registerRepeatPassword"/>
					</FormItem>
				</InputForm>
			</div>
		</>
	</ColumnedContent>;
};

import React from "react";
import useUnlockServer from "../../hooks/server/useUnlockServer";
import { useHistory } from "react-router-dom";
import useLogin from "../../hooks/authentication/useLogin";
import ColumnedContent from "../widgets/ColumnedContent";
import InputForm from "../widgets/input/InputForm";
import FormItem from "../widgets/input/FormItem";
import TextInput from "../widgets/input/TextInput";
import PasswordInput from "../widgets/input/PasswordInput";
import KeyIcon from "../widgets/icons/KeyIcon";
import MailIcon from "../widgets/icons/MailIcon";
import PersonIcon from "../widgets/icons/PersonIcon";
import InlineMargin from "../widgets/InlineMargin";

export default function ServerSetup() {
	const { unlockServer, loading, errors } = useUnlockServer();
	const history = useHistory();

	const { login } = useLogin(() => {
		history.push("/");
	});

	return <ColumnedContent>
		<>
			<div>
				<div style={{textAlign: 'center'}}>
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

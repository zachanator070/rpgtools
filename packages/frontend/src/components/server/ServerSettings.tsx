import React, { useState } from "react";
import useServerConfig from "../../hooks/server/useServerConfig";
import LoadingView from "../LoadingView";
import { Link } from "react-router-dom";
import useInviteUser from "../../hooks/server/useInviteUser";
import PermissionEditor from "../permissions/PermissionEditor";
import { SERVER_CONFIG } from "@rpgtools/common/src/type-constants";
import PrimaryButton from "../widgets/PrimaryButton";
import ItemList from "../widgets/ItemList";
import LeftArrowIcon from "../widgets/icons/LeftArrowIcon";
import ColumnedContent from "../widgets/ColumnedContent";
import useSetDefaultWorld from "../../hooks/server/useSetDefaultWorld";
import SelectWorld from "../select/SelectWorld";

export default function ServerSettings() {
	const { serverConfig, loading, refetch } = useServerConfig();
	const [inviteEmail, setInviteEmail] = useState("");
	const { inviteUser, loading: inviteLoading } = useInviteUser();
	const {setDefaultWorld, loading: setDefaultWorldLoading} = useSetDefaultWorld();
	const [newDefaultWorldId, setNewDefaultWorldId] = useState<string>();

	if (loading) {
		return <LoadingView />;
	}

	return (
		<div className={"margin-lg-top margin-lg-left"}>
			<div style={{display: "flex"}}>
				<div style={{flexGrow: 4}}>
					<Link to={`/ui/`}>
						<LeftArrowIcon />
						Home
					</Link>
				</div>
				<div style={{flexGrow: 20}} />
			</div>
			<h1>Server Settings</h1>
			<hr />
			<ColumnedContent>
				<>
					<h2>Invites</h2>
					<ItemList
						id={"inviteList"}
					>
						{serverConfig.invites.map(item => <div key={item._id}>{item.email}</div>)}
					</ItemList>
				</>
			</ColumnedContent>
			{serverConfig.canWrite && (
				<ColumnedContent style={{ marginTop: "2em"}}>
					<>
						<span className={"margin-lg-right"}>Invite by email:</span>
						<span className={"margin-lg-right"}>
							<input
								type="email"
								id={"inviteEmail"}
								value={inviteEmail}
								onChange={(event) => setInviteEmail(event.target.value)}
							/>
						</span>
						<PrimaryButton
							loading={inviteLoading}
							onClick={async () => {
								await inviteUser({email: inviteEmail});
								setInviteEmail("");
								await refetch();
							}}
						>
							Invite
						</PrimaryButton>
					</>
				</ColumnedContent>
			)}
			<ColumnedContent style={{ marginTop: "2em"}}>
				<>
					<h2>Default World</h2>
					{serverConfig.defaultWorld && <>
						Current default world: <a href={`/ui/defaultWorld`}>{serverConfig.defaultWorld.name}</a>
					</>}
					<div className={'margin-md-top'}>
						{serverConfig.canWrite && <>
							Set Default World:
							<SelectWorld
								onChange={world => setNewDefaultWorldId(world._id)}
							/>
							<div>
								<PrimaryButton
									loading={setDefaultWorldLoading}
									onClick={async () => {
										await setDefaultWorld({worldId: newDefaultWorldId});
									}}
								>
									Save
								</PrimaryButton>
							</div>
						</>}
					</div>
				</>
			</ColumnedContent>
			<ColumnedContent style={{marginTop: "2em"}}>
				<>
					<h2>Server Permissions</h2>
					<PermissionEditor
						subject={serverConfig}
						subjectType={SERVER_CONFIG}
						refetch={async () => {await refetch()}}
					/>
				</>
			</ColumnedContent>
		</div>
	);
};

import React, { useState } from "react";
import useServerConfig from "../../hooks/server/useServerConfig.js";
import LoadingView from "../LoadingView.tsx";
import { Link } from "react-router-dom";
import useGenerateRegisterCodes from "../../hooks/server/useGenerateRegisterCodes.js";
import PermissionEditor from "../permissions/PermissionEditor.tsx";
import { SERVER_CONFIG } from "@rpgtools/common/src/type-constants";
import PrimaryButton from "../widgets/PrimaryButton.tsx";
import NumberInput from "../widgets/input/NumberInput.tsx";
import ItemList from "../widgets/ItemList.tsx";
import LeftArrowIcon from "../widgets/icons/LeftArrowIcon.tsx";
import ColumnedContent from "../widgets/ColumnedContent.tsx";
import useSetDefaultWorld from "../../hooks/server/useSetDefaultWorld.js";
import SelectWorld from "../select/SelectWorld.tsx";

export default function ServerSettings() {
	const { serverConfig, loading, refetch } = useServerConfig();
	const [amount, setAmount] = useState(0);
	const { generateRegisterCodes, loading: generateLoading } = useGenerateRegisterCodes();
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
					<h2>Registration Codes</h2>
					<ItemList
						id={"registerCodeList"}
					>
						{serverConfig.registerCodes.map(item => <div key={item}>{item}</div>)}
					</ItemList>
				</>
			</ColumnedContent>
			{serverConfig.canWrite && (
				<ColumnedContent style={{ marginTop: "2em"}}>
					<>
						<span className={"margin-lg-right"}>Number of codes to generate:</span>
						<span className={"margin-lg-right"}>
							<NumberInput value={amount} onChange={(value) => setAmount(value)} id={"numberCodesToGenerate"}/>
						</span>
						<PrimaryButton
							loading={generateLoading}
							onClick={async () => {
								await generateRegisterCodes({amount});
							}}
						>
							Generate
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

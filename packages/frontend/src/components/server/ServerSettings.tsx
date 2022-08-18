import React, { useState } from "react";
import useServerConfig from "../../hooks/server/useServerConfig";
import LoadingView from "../LoadingView";
import { Link } from "react-router-dom";
import useGenerateRegisterCodes from "../../hooks/server/useGenerateRegisterCodes";
import PermissionEditor from "../permissions/PermissionEditor";
import { SERVER_CONFIG } from "@rpgtools/common/src/type-constants";
import PrimaryButton from "../widgets/PrimaryButton";
import NumberInput from "../widgets/NumberInput";
import ItemList from "../widgets/ItemList";
import LeftArrowIcon from "../widgets/icons/LeftArrowIcon";
import ColumnedContent from "../widgets/ColumnedContent";

export default function ServerSettings() {
	const { serverConfig, loading, refetch } = useServerConfig();
	const [amount, setAmount] = useState(0);
	const { generateRegisterCodes, loading: generateLoading } = useGenerateRegisterCodes();

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
						{serverConfig.registerCodes.map(item => <>{item}</>)}
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

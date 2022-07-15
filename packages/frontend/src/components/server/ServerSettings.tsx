import React, { useState } from "react";
import { Button, Col, Input, InputNumber, List, Row } from "antd";
import useServerConfig from "../../hooks/server/useServerConfig";
import LoadingView from "../LoadingView";
import { Link } from "react-router-dom";
import { LeftOutlined } from "@ant-design/icons";
import useGenerateRegisterCodes from "../../hooks/server/useGenerateRegisterCodes";
import PermissionEditor from "../permissions/PermissionEditor";
import { SERVER_CONFIG } from "@rpgtools/common/src/type-constants";

export default function ServerSettings() {
	const { serverConfig, loading, refetch } = useServerConfig();
	const [amount, setAmount] = useState(0);
	const { generateRegisterCodes, loading: generateLoading } = useGenerateRegisterCodes();

	if (loading) {
		return <LoadingView />;
	}

	return (
		<div className={"margin-lg-top margin-lg-left"}>
			<Row>
				<Col span={4}>
					<Link to={`/ui/`}>
						<LeftOutlined />
						Home
					</Link>
				</Col>
				<Col span={20} />
			</Row>
			<h1>Server Settings</h1>
			<hr />
			<Row>
				<Col span={4} />
				<Col span={16}>
					<h2>Registration Codes</h2>
					<List
						bordered
						dataSource={serverConfig.registerCodes}
						renderItem={(item) => <List.Item>{item}</List.Item>}
						id={"registerCodeList"}
					/>
				</Col>
				<Col span={4} />
			</Row>
			{serverConfig.canWrite && (
				<Row className={"margin-md-top"}>
					<Col span={4} />
					<Col span={16}>
						<span className={"margin-lg-right"}>Number of codes to generate:</span>
						<span className={"margin-lg-right"}>
							<InputNumber value={amount} onChange={async (value) => await setAmount(value)} id={"numberCodesToGenerate"}/>
						</span>
						<Button
							type={"primary"}
							disabled={generateLoading}
							onClick={async () => {
								await generateRegisterCodes({amount});
							}}
						>
							Generate
						</Button>
					</Col>
					<Col span={4} />
				</Row>
			)}
			<Row className={"margin-md-top"}>
				<Col span={4} />
				<Col span={16}>
					<h2>Server Permissions</h2>
					<PermissionEditor
						subject={serverConfig}
						subjectType={SERVER_CONFIG}
						refetch={async () => {await refetch()}}/>
				</Col>
				<Col span={4} />
			</Row>
		</div>
	);
};

import React, {useState} from 'react';
import {Button, Col, Input, InputNumber, List, Row} from "antd";
import useServerConfig from "../../hooks/useServerConfig";
import {LoadingView} from "../LoadingView";
import {Link} from "react-router-dom";
import {LeftOutlined} from "@ant-design/icons";
import {useGenerateRegisterCodes} from "../../hooks/useGenerateRegisterCodes";

export default () => {

	const {serverConfig, loading} = useServerConfig();
	const [amount, setAmount] = useState(0);
	const {generateRegisterCodes, loading: generateLoading} = useGenerateRegisterCodes();

	if(loading){
		return <LoadingView/>;
	}

	return <div className={'margin-lg-top margin-lg-left'}>
		<Row>
			<Col span={4}>
				<Link
					to={`/ui/`}
				>
					<LeftOutlined/>
					Home
				</Link>
			</Col>
			<Col span={20}></Col>
		</Row>
		<h1>Server Settings</h1>
		<hr/>
		<Row>
			<Col span={4}></Col>
			<Col span={16}>
				<h2>Registration Codes</h2>
				<List
					bordered
					dataSource={serverConfig.registerCodes}
					renderItem={item => <List.Item>{item}</List.Item>}
					/>
			</Col>
			<Col span={4}></Col>
		</Row>
		<Row className={'margin-md-top'}>
			<Col span={4}></Col>
			<Col span={16}>
				<span className={'margin-lg-right'}>
					Number of codes to generate:
				</span>
				<span className={'margin-lg-right'}>
					<InputNumber
						value={amount}
						onChange={async value => await setAmount(value)}
					/>
				</span>
				<Button
					type={'primary'}
					disabled={generateLoading}
					onClick={async () => {await generateRegisterCodes(amount)}}
				>
					Generate
				</Button>
			</Col>
			<Col span={4}></Col>
		</Row>
	</div>;
}
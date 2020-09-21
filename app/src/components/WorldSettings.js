import React, {useState} from 'react';
import useCurrentWorld from "../hooks/world/useCurrentWorld";
import {PermissionEditor} from "./permissions/PermissionEditor";
import {Form, Upload, Button, Col, Input, Row, Modal, Checkbox} from "antd";
import {useRenameWorld} from "../hooks/world/useRenameWorld";
import {WORLD} from "../../../common/src/type-constants";
import {LoadingView} from "./LoadingView";
import {useLoad5eContent} from "../hooks/world/useLoad5eContent";
import {useImportContent} from "../hooks/world/useImportContent";
import {ToolTip} from "./ToolTip";
import {UploadOutlined} from '@ant-design/icons';

export default () => {
	const {currentWorld, loading: currentWorldLoading} = useCurrentWorld();
	const [newName, setNewName] = useState();
	const {renameWorld, loading} = useRenameWorld();
	const {load5eContent, loading: contentLoading} = useLoad5eContent();
	const {importContent, loading: importLoading} = useImportContent();
	const [getCC, setGetCC] = useState();
	const [getTob, setGetTob] = useState();

	if(currentWorldLoading){
		return <LoadingView/>;
	}

	if(!currentWorld){
		return <div>404 - World not found</div>;
	}

	const formItemLayout = {
		labelCol: { span: 2 },
		wrapperCol: { span: 22 },
	};

	const tailLayout = {
		wrapperCol: { offset: 2, span: 22 },
	};

	return <div className='margin-md-left margin-md-top margin-lg-bottom'>
		<h1>Settings for {currentWorld.name}</h1>
		<hr/>
		<Row className={'margin-lg-top'}>
			<Col span={4}/>
			<Col span={16}>
				<h2>Permissions</h2>
				<div className={'margin-lg-top'}>
					<PermissionEditor subject={currentWorld} subjectType={WORLD}/>
				</div>
			</Col>
			<Col span={4}/>
		</Row>

		{currentWorld.canWrite &&
		<>
			<Row className={'margin-lg-top'}>
				<Col span={4}/>
				<Col span={16}>
					<h2>Rename World</h2>
					<div style={{display: 'flex'}} className={'margin-lg-top'}>
						<div className='margin-md-right'>New Name:</div>
						<div>
							<Input value={newName} onChange={async (e) => {
								await setNewName(e.target.value)
							}}/>
						</div>
					</div>
					<Button className={'margin-md-top'} onClick={async () => {
						await renameWorld(currentWorld._id, newName)
					}} disabled={loading}>Submit</Button>
				</Col>
				<Col span={4}/>
			</Row>
			<Row className={'margin-lg-top'}>
				<Col span={4}/>
				<Col span={16}>
					<Modal visible={contentLoading} closable={false} footer={null}>
						<LoadingView/> Loading 5e content ...
					</Modal>
					<h2>Load 5e Content</h2>
					<div className={'margin-lg'}>
						<Checkbox onChange={async (e) => await setGetCC(e.target.checked)}>Creature Codex</Checkbox>
						<Checkbox onChange={async (e) => await setGetTob(e.target.checked)}>Tome of Beasts</Checkbox>
					</div>
					<div className={'margin-lg-top'}>
						<Button
							type={'primary'}
							loading={contentLoading}
							onClick={async () => {
								await load5eContent({worldId: currentWorld._id, creatureCodex: getCC, tomeOfBeasts: getTob});
							}}
						>
							Load
						</Button>
					</div>
				</Col>
				<Col span={4}/>
			</Row>
			<Row className={'margin-lg-top'}>
				<Col span={4}/>
				<Col span={16}>
					<Modal visible={importLoading} closable={false} footer={null}>
						<LoadingView/> Importing content ...
					</Modal>
					<h2>Import Content</h2>
					<div className={'margin-lg-top'}>
						<Form
							onFinish={async ({file}) => {
								await importContent({worldId: currentWorld._id, zipFile: file[0].originFileObj});
							}}
						>
							<Form.Item
								{...formItemLayout}
								label={<div><ToolTip>Supported file types: <br/><ul><li>.zip</li></ul></ToolTip> File</div>}
								name="file"
								rules={[
									{required: true, message: 'File required'},
									{validator: async (rule, value) => {
											// this function has to be async b/c the validator has to return a promise
											if(!value || value.length !== 1){
												return;
											}
											const file = value[0];
											const supportedTypes = ['zip'];
											const parts = file.name.split('.');

											const type = parts.length > 0 ? parts[parts.length - 1] : null;
											if(!supportedTypes.includes(type)){
												throw new Error(`File type ${type} not supported`);
											}
										}}
								]}
								getValueFromEvent={(e) => {
									return e.fileList.length > 0 ? [e.fileList[0]] : [];
								}}
								valuePropName="fileList"
							>
								<Upload
									multiple={false}
									beforeUpload={() => false}
								>
									<Button icon={<UploadOutlined />}>Select File</Button>
								</Upload>
							</Form.Item>
							<Form.Item {...tailLayout}>
								<Button type="primary" htmlType="submit" loading={loading}>
									Submit
								</Button>
							</Form.Item>
						</Form>
					</div>
				</Col>
				<Col span={4}/>
			</Row>
		</>
		}

	</div>;
}
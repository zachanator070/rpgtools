import React, { useState } from "react";
import { Button, Checkbox, Form, Input, Modal } from "antd";
import useCreateWorld from "../../hooks/world/useCreateWorld";
import { useHistory } from "react-router-dom";
import { useSetCurrentWorld } from "../../hooks/world/useSetCurrentWorld";
import { PUBLIC_WORLD_PERMISSIONS } from "@rpgtools/common/src/permission-constants";
import { ToolTip } from "../ToolTip";

interface CreateWorldModalProps {
	visibility: boolean;
	setVisibility: (visibility: boolean) => Promise<void>;
}

export const CreateWorldModal = ({ visibility, setVisibility }: CreateWorldModalProps) => {
	const history = useHistory();
	const [name, setName] = useState("");
	const [isPublic, setPublic] = useState(true);

	const { setCurrentWorld } = useSetCurrentWorld();

	const { createWorld, loading, errors } = useCreateWorld(async (data) => {
		await setCurrentWorld({worldId: data.createWorld._id});
		history.push(`/ui/world/${data.createWorld._id}/map/${data.createWorld.wikiPage._id}`);
	});

	const formItemLayout = {
		labelCol: { span: 4 },
		wrapperCol: { span: 14 },
	};
	const noLabelItem = {
		wrapperCol: { span: 10, offset: 4 },
	};
	return (
		<Modal
			title="Create World"
			visible={visibility}
			onCancel={async () => {
				await setVisibility(false);
			}}
			footer={null}
		>
			{errors && errors.join("/n")}
			<Form layout="horizontal">
				<Form.Item label="Name" required={true} {...formItemLayout}>
					<Input onChange={(e) => setName(e.target.value)} id={'newWorldName'}/>
				</Form.Item>
				<Form.Item {...noLabelItem}>
					<Checkbox onChange={() => setPublic(!isPublic)} checked={isPublic}>
						Public World
					</Checkbox>
					<ToolTip>
						<>
							Public worlds will have the following permissions given to any visitor:
							<br />
							<ul>
								{PUBLIC_WORLD_PERMISSIONS.map((permission) => (
									<li key={permission}>
										{permission}
										<br />
									</li>
								))}
							</ul>
						</>
					</ToolTip>
				</Form.Item>
				<Form.Item {...noLabelItem}>
					<Button
						type="primary"
						disabled={loading}
						onClick={async () => {
							await createWorld({name, public: isPublic});
							await setVisibility(false);
						}}
						id={'submit'}
					>
						Submit
					</Button>
				</Form.Item>
			</Form>
		</Modal>
	);
};

import React, {useState} from "react";
import DiceAttribute from "./DiceAttribute";
import useCurrentCharacter from "../../hooks/game/useCurrentCharacter";
import LoadingView from "../LoadingView";
import DiceRoller from "./DiceRoller";
import ToolTip from "../ToolTip";
import {Button, Form, Input, Modal} from "antd";
import useSetCharacterAttributes, {CharacterAttributeInput} from "../../hooks/game/useSetCharacterAttributes";
import {GameCharacterAttribute} from "../../types";

export default function DiceOptions() {
	const { currentCharacter } = useCurrentCharacter();
	const [addAttributeVisible, setAddAttributeVisible] = useState<boolean>(false);
	const {setCharacterAttributes, loading} = useSetCharacterAttributes();
	if (!currentCharacter) {
		return <LoadingView />;
	}
	return (
		<div
			style={{
				overflow: "auto",
				height: "100%",
			}}
		>
			<Modal
				visible={addAttributeVisible}
				title={`Add New Attribute`}
				footer={null}
				onCancel={() => setAddAttributeVisible(false)}
			>
				<Form
					initialValues={{
						value: 0,
					}}
					onFinish={async ({ name, value }) => {
						const newAttribute: CharacterAttributeInput = {name, value: parseInt(value)};
						await setCharacterAttributes({
							attributes: [newAttribute, ...currentCharacter.attributes.map(oldAttribute => {
								return {_id: oldAttribute._id, name: oldAttribute.name, value: oldAttribute.value}
							})]
						});
						setAddAttributeVisible(false);
					}}
				>
					<Form.Item name={"name"} label={`Name`}>
						<Input type={"string"} style={{ width: "75px" }} />
					</Form.Item>
					<Form.Item name={"value"} label={`Value`}>
						<Input type={"number"} style={{ width: "75px" }} />
					</Form.Item>
					<Form.Item>
						<Button type="primary" htmlType="submit" loading={loading} disabled={loading}>
							Submit
						</Button>
					</Form.Item>
				</Form>
			</Modal>
			<div className={"margin-lg-bottom"}>
				<h2 style={{ display: "inline" }}>Attribute Checks</h2>
				<span className={"margin-lg-left"}>
					<ToolTip>
						<p>Click on an attribute to roll a skill check</p>
					</ToolTip>
				</span>
			</div>
			<div
				style={{
					display: "flex",
					justifyContent: "space-around",
					flexWrap: "wrap",
				}}
			>
				{currentCharacter.attributes.map(attribute => <DiceAttribute attribute={attribute} key={attribute._id}/>)}
			</div>
			<Button onClick={() => setAddAttributeVisible(true)}>Add Attribute</Button>
			<DiceRoller />
		</div>
	);
};

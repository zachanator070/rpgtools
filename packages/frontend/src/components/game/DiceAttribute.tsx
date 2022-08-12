import React, { useState } from "react";
import useGameChat from "../../hooks/game/useGameChat";
import { EditOutlined } from "@ant-design/icons";
import { Button, Input, Form, Modal } from "antd";
import useCurrentGame from "../../hooks/game/useCurrentGame";
import useSetCharacterAttributes, {CharacterAttributeInput} from "../../hooks/game/useSetCharacterAttributes";
import {GameCharacterAttribute} from "../../types";
import useCurrentCharacter from "../../hooks/game/useCurrentCharacter";

interface DiceAttributeProps {
	attribute: GameCharacterAttribute
}
export default function DiceAttribute({ attribute }: DiceAttributeProps) {
	const { gameChat } = useGameChat();
	const { currentGame } = useCurrentGame();
	const {currentCharacter} = useCurrentCharacter();
	const { setCharacterAttributes } = useSetCharacterAttributes();

	const [editVisibility, setEditVisibility] = useState(false);

	return (
		<div
			style={{
				textAlign: "center",
				width: "5em",
			}}
		>
			<div
				style={{
					borderRadius: "15px",
					border: "thin solid black",
					cursor: "pointer",
				}}
				onClick={async () => {
					let parsedBonus = attribute.value.toString();
					if (attribute.value > 0) {
						parsedBonus = "+" + parsedBonus;
					}
					await gameChat({gameId: currentGame._id, message: `/roll 1d20${attribute.value !== 0 ? parsedBonus : ""}`});
				}}
			>
				<h2>{attribute.name}</h2>
				<h3>
					{attribute.value > 0 ? "+" : ""}
					{attribute.value}
				</h3>
			</div>
			<div>
				<a
					onClick={() => {
						setEditVisibility(true);
					}}
				>
					<EditOutlined />
				</a>
			</div>
			<Modal
				visible={editVisibility}
				title={`Edit ${attribute}`}
				footer={null}
				onCancel={() => setEditVisibility(false)}
			>
				<Form
					initialValues={{
						value: attribute.value,
					}}
					onFinish={async ({ value }) => {
						const attributes: GameCharacterAttribute[] = [];
						for (let oldAttribute of currentCharacter.attributes) {
							if (oldAttribute._id === attribute._id) {
								attributes.push({
									_id: oldAttribute._id,
									name: oldAttribute.name,
									value: parseInt(value),
								});
							} else {
								attributes.push({
									_id: oldAttribute._id,
									name: oldAttribute.name,
									value: oldAttribute.value,
								});
							}
						}
						await setCharacterAttributes({attributes});
						setEditVisibility(false);
					}}
				>
					<Form.Item name={"value"} label={`${attribute.name}`}>
						<Input type={"number"} style={{ width: "75px" }} />
					</Form.Item>
					<Form.Item>
						<Button type="primary" htmlType="submit">
							Submit
						</Button>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

import React, { useState } from "react";
import useGameChat from "../../hooks/game/useGameChat";
import { EditOutlined } from "@ant-design/icons";
import { Button, Input, Form, Modal } from "antd";
import useCurrentGame from "../../hooks/game/useCurrentGame";
import useSetCharacterAttributes from "../../hooks/game/useSetCharacterAttributes";

interface DiceAttributeProps {
	attribute: string;
	value: number;
}
export default function DiceAttribute({ attribute, value }: DiceAttributeProps) {
	const { gameChat } = useGameChat();
	const { currentGame } = useCurrentGame();
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
					let parsedBonus = value.toString();
					if (value > 0) {
						parsedBonus = "+" + parsedBonus;
					}
					await gameChat({gameId: currentGame._id, message: `/roll 1d20${value !== 0 ? parsedBonus : ""}`});
				}}
			>
				<h2>{attribute}</h2>
				<h3>
					{value > 0 ? "+" : ""}
					{value}
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
				title={`Edit ${attribute} Bonus`}
				footer={null}
				onCancel={() => setEditVisibility(false)}
			>
				<Form
					initialValues={{
						bonus: value,
					}}
					onFinish={async ({ bonus }) => {
						const variables: any = {};
						variables[attribute.toLowerCase()] = parseInt(bonus);
						await setCharacterAttributes({...variables});
						setEditVisibility(false);
					}}
				>
					<Form.Item name={"bonus"} label={`${attribute} Bonus`}>
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

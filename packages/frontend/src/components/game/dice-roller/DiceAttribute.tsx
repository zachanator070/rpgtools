import React, { useState } from "react";
import useGameChat from "../../../hooks/game/useGameChat";
import useCurrentGame from "../../../hooks/game/useCurrentGame";
import useSetCharacterAttributes from "../../../hooks/game/useSetCharacterAttributes";
import {GameCharacterAttribute} from "../../../types";
import useCurrentCharacter from "../../../hooks/game/useCurrentCharacter";
import InputForm from "../../widgets/input/InputForm";
import FormItem from "../../widgets/input/FormItem";
import NumberInput from "../../widgets/input/NumberInput";
import FullScreenModal from "../../widgets/FullScreenModal";
import EditIcon from "../../widgets/icons/EditIcon";

interface DiceAttributeProps {
	attribute: GameCharacterAttribute
}
export default function DiceAttribute({ attribute }: DiceAttributeProps) {
	const { gameChat } = useGameChat();
	const { currentGame } = useCurrentGame();
	const {currentCharacter} = useCurrentCharacter();
	const { setCharacterAttributes, loading, errors } = useSetCharacterAttributes();

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
					<EditIcon />
				</a>
			</div>
			<FullScreenModal
				visible={editVisibility}
				title={`Edit ${attribute}`}
				setVisible={setEditVisibility}
			>
				<InputForm
					loading={loading}
					errors={errors}
					onSubmit={async ({ value }) => {
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
					<FormItem label={`${attribute.name}`}>
						<NumberInput defaultValue={attribute.value} name={"value"} style={{ width: "75px" }} />
					</FormItem>
				</InputForm>
			</FullScreenModal>
		</div>
	);
};

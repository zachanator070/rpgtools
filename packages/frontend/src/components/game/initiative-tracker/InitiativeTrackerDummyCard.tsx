import React from "react";
import { INITIATIVE_CARD } from "./DragAndDropConstants";
import { useDrop } from "react-dnd";
import { GameCharacter } from "../../../types";
import { DraggableCharacterItem } from "./InitiativeTrackerCard";

interface InitiativeTrackerDummyCardProps {
	side: "left" | "right";
	data: GameCharacter[];
	setData: (roster: GameCharacter[]) => Promise<void>;
}

export default function InitiativeTrackerDummyCard({
	side,
	data,
	setData,
}: InitiativeTrackerDummyCardProps) {
	const [, dropRef] = useDrop({
		accept: INITIATIVE_CARD,
		drop: (draggedItem: DraggableCharacterItem) => {
			const newData = data.filter((oldItem) => oldItem.name !== draggedItem.name);
			const draggedCharacter = data.find(
				(character: GameCharacter) => character.name === draggedItem.name,
			);
			if (side === "left") {
				setData([draggedCharacter, ...newData]);
			} else {
				setData([...newData, draggedCharacter]);
			}
		},
	});

	return (
		<div
			style={{
				flex: "1 1",
				height: "100%",
			}}
			ref={dropRef}
		/>
	);
}

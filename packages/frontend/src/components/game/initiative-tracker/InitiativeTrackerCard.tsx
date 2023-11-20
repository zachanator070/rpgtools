import React, { CSSProperties } from "react";
import { useDrag, useDrop } from "react-dnd";
import { INITIATIVE_CARD } from "./DragAndDropConstants";
import useCurrentGame from "../../../hooks/game/useCurrentGame";
import { GameCharacter } from "../../../types";

export interface DraggableCharacterItem {
	type: string;
	name: string;
}

interface InitiativeTrackerCardProps {
	character: GameCharacter;
	data: GameCharacter[];
	setData: (roster: GameCharacter[]) => Promise<void>;
	loading: boolean;
}

export default function InitiativeTrackerCard({
	character,
	data,
	setData,
	loading,
}: InitiativeTrackerCardProps) {
	const { currentGame } = useCurrentGame();

	const [, dragRef] = useDrag<DraggableCharacterItem, void, void>({
		type: INITIATIVE_CARD,
		item: {
			type: INITIATIVE_CARD,
			name: character.name,
		},
		canDrag: () => currentGame.canWrite && !loading,
	});

	const [, dropRef] = useDrop({
		accept: INITIATIVE_CARD,
		canDrop: (item: DraggableCharacterItem) => item.name !== character.name,
		drop: async (draggedItem) => {
			const newData = [];
			for (const oldItem of data.filter((oldItem) => oldItem.name !== draggedItem.name)) {
				if (oldItem.name === character.name) {
					newData.push(draggedItem);
				}
				newData.push(oldItem);
			}
			await setData([...newData]);
		},
	});

	const cardStyle: CSSProperties = {
		backgroundColor: character.color,
		fontWeight: 600,
		borderRadius: "5px",
		padding: "5px 8px",
		margin: "5px",
		color: "white",
	};

	return (
		<div
			style={cardStyle}
			ref={(element) => {
				dropRef(element);
				dragRef(element);
			}}
		>
			{character.name}
		</div>
	);
}

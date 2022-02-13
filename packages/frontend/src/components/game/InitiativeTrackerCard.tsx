import React from "react";
import {DragObjectWithType, useDrag, useDrop} from "react-dnd";
import { INITIATIVE_CARD } from "./DragAndDropConstants";
import useCurrentGame from "../../hooks/game/useCurrentGame";
import {GameCharacter} from "../../types";

export interface DraggableCharacterItem extends DragObjectWithType {
	type: string;
	name: string;
}

interface InitiativeTrackerCardProps {
	name: string;
	data: GameCharacter[];
	setData: (roster: GameCharacter[]) => Promise<any>;
	loading: boolean;
}

export const InitiativeTrackerCard = ({
	name,
	data,
	setData,
	loading,
}: InitiativeTrackerCardProps) => {
	const { currentGame } = useCurrentGame();

	const [props, dragRef] = useDrag<DraggableCharacterItem, void, void>({
		item: {
			type: INITIATIVE_CARD,
			name,
		},
		canDrag: () => currentGame.canWrite && !loading,
	});

	const [dropProps, dropRef] = useDrop({
		accept: INITIATIVE_CARD,
		canDrop: (item: DraggableCharacterItem, monitor) => item.name !== name,
		drop: async (draggedItem, monitor) => {
			const newData = [];
			for (let oldItem of data.filter(
				(oldItem) => oldItem.name !== draggedItem.name
			)) {
				if (oldItem.name === name) {
					newData.push(draggedItem);
				}
				newData.push(oldItem);
			}
			await setData([...newData]);
		},
	});

	return (
		<div
			style={{
				backgroundColor: "white",
				fontWeight: 600,
				borderRadius: "5px",
				padding: "5px 8px",
				margin: "5px",
			}}
			ref={(element) => {
				dropRef(element);
				dragRef(element);
			}}
		>
			{name}
		</div>
	);
};

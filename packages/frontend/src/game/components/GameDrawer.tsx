import React, { useEffect, useState } from "react";
import GameChat from "./GameChat";
import ToolOptions from "./tool-options/ToolOptions";
import DiceOptions from "./dice-roller/DiceOptions";
import useGameChatSubscription from "../../hooks/game/useGameChatSubscription";
import useCurrentCharacter from "../../hooks/game/useCurrentCharacter";
import {
	ADD_MODEL_CONTROLS,
	FOG_CONTROLS,
	PAINT_CONTROLS,
	SELECT_LOCATION_CONTROLS,
	SELECT_MODEL_CONTROLS
} from "../GameState";
import SlidingDrawer from "../../components/widgets/SlidingDrawer";
import TabCollection from "../../components/widgets/TabCollection";

const GAME_CONTROLS_WITH_CONTEXT = [
	SELECT_MODEL_CONTROLS,
	SELECT_LOCATION_CONTROLS,
	ADD_MODEL_CONTROLS,
	PAINT_CONTROLS,
	FOG_CONTROLS,
];

interface GameDrawerProps {
	controlsMode: string;
	setGameWikiId: (wikiId: string) => void;
}

export default function GameDrawer({ controlsMode, setGameWikiId }: GameDrawerProps) {
	const [visible, setVisible] = useState<boolean>(true);
	const [activeKey, setActiveKey] = useState<string>("Chat");
	const { gameChat } = useGameChatSubscription();
	const { currentCharacter } = useCurrentCharacter();

	useEffect(() => {
		if (gameChat && gameChat.receiver === "Server" && gameChat.sender === currentCharacter.name) {
			setVisible(true);
			setActiveKey("Chat");
		}
	}, [gameChat]);

	useEffect(() => {
		if (GAME_CONTROLS_WITH_CONTEXT.includes(controlsMode)) {
			setVisible(true);
			setActiveKey("Tool Options");
		}
	}, [controlsMode]);

	return (
		<SlidingDrawer
			placement={"right"}
			startVisible={true}
			visible={visible}
			setVisible={setVisible}
		>
			<TabCollection
				activeKey={activeKey}
				onChange={(key) => setActiveKey(key)}
				style={{
					paddingTop: "1em",
					height: '100%'
				}}
				tabs={[
					{
						title: 'Chat',
						children: <GameChat />
					},
					{
						title: 'Tool Options',
						children: <ToolOptions
							controlsMode={controlsMode}
							setGameWikiId={async (wikiId: string) => setGameWikiId(wikiId)}
						/>
					},
					{
						title: 'Dice',
						children: <DiceOptions />
					}
				]}
			/>
		</SlidingDrawer>
	);
};

import React, { useEffect, useState } from "react";
import { SlidingDrawer } from "../SlidingDrawer";
import { Tabs } from "antd";
import { GameChat } from "./GameChat";
import { ToolOptions } from "./ToolOptions";
import {
	ADD_MODEL_CONTROLS,
	FOG_CONTROLS,
	PAINT_CONTROLS,
	SELECT_LOCATION_CONTROLS,
	SELECT_MODEL_CONTROLS,
} from "../../rendering/GameRenderer";
import { DiceOptions } from "./DiceOptions";
import { useGameChatSubscription } from "../../hooks/game/useGameChatSubscription";
import useCurrentUser from "../../hooks/authentication/useCurrentUser";
import { useCurrentCharacter } from "../../hooks/game/useCurrentCharacter";

const { TabPane } = Tabs;

const GAME_CONTROLS_WITH_CONTEXT = [
	SELECT_MODEL_CONTROLS,
	SELECT_LOCATION_CONTROLS,
	ADD_MODEL_CONTROLS,
	PAINT_CONTROLS,
	FOG_CONTROLS,
];

export const GameDrawer = ({ renderer, controlsMode, setGameWikiId }) => {
	const [visible, setVisible] = useState(true);
	const [activeKey, setActiveKey] = useState("1");
	const { gameChat } = useGameChatSubscription();
	const { currentCharacter } = useCurrentCharacter();

	useEffect(() => {
		if (gameChat && gameChat.receiver === "Server" && gameChat.sender === currentCharacter.name) {
			setVisible(true);
			setActiveKey("1");
		}
	}, [gameChat]);

	useEffect(() => {
		if (GAME_CONTROLS_WITH_CONTEXT.includes(controlsMode)) {
			setVisible(true);
			setActiveKey("2");
		}
	}, [controlsMode]);

	return (
		<SlidingDrawer
			placement={"right"}
			startVisible={true}
			visible={visible}
			setVisible={setVisible}
		>
			<Tabs
				defaultActiveKey="1"
				activeKey={activeKey}
				onChange={(key) => setActiveKey(key)}
				type={"card"}
				style={{
					height: "100%",
				}}
			>
				<TabPane
					tab="Chat"
					key="1"
					style={{
						height: "100%",
					}}
				>
					<GameChat />
				</TabPane>
				<TabPane tab="Tool Options" key="2">
					<ToolOptions
						renderer={renderer}
						controlsMode={controlsMode}
						setGameWikiId={setGameWikiId}
					/>
				</TabPane>
				<TabPane
					tab="Dice"
					key="3"
					style={{
						height: "100%",
					}}
				>
					<DiceOptions />
				</TabPane>
			</Tabs>
		</SlidingDrawer>
	);
};

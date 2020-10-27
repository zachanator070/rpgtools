import React, { useState } from "react";
import tetrahedron from "../../icons/tetrahedron.svg";
import cube from "../../icons/cube.svg";
import octahedron from "../../icons/octahedron.svg";
import decahedron from "../../icons/decahedron.svg";
import dodecahedron from "../../icons/dodecahedron.svg";
import icosahedron from "../../icons/icosahedron.svg";
import doubleDecahedron from "../../icons/double-decahedron.svg";

import { DiceIcon } from "./DiceIcon";
import { Button } from "antd";
import { useGameChat } from "../../hooks/game/useGameChat";
import useCurrentGame from "../../hooks/game/useCurrentGame";
import { ToolTip } from "../ToolTip";

export const DiceRoller = () => {
	const [d4, setD4] = useState(0);
	const [d6, setD6] = useState(0);
	const [d8, setD8] = useState(0);
	const [d10, setD10] = useState(0);
	const [d12, setD12] = useState(0);
	const [d20, setD20] = useState(0);
	const [d100, setD100] = useState(0);
	const { currentGame } = useCurrentGame();
	const { gameChat } = useGameChat();

	const getDiceCommand = (dice, count) => {
		if (count !== 0) {
			return `${count}${dice} `;
		}
		return "";
	};

	return (
		<div className={"margin-lg-top"}>
			<div className={"margin-lg-bottom"}>
				<h2 style={{ display: "inline" }}>Roll Dice</h2>
				<span className={"margin-lg-left"}>
					<ToolTip>
						<p>Left click a dice to add it to selection, right click to remove it.</p>
					</ToolTip>
				</span>
			</div>
			<div
				className={"margin-lg-bottom"}
				style={{
					display: "flex",
					justifyContent: "space-between",
					flexWrap: "wrap",
				}}
			>
				<DiceIcon tooltip={"d4"} count={d4} setCount={setD4} icon={tetrahedron} />
				<DiceIcon tooltip={"d6"} count={d6} setCount={setD6} icon={cube} />
				<DiceIcon tooltip={"d8"} count={d8} setCount={setD8} icon={octahedron} />
				<DiceIcon tooltip={"d10"} count={d10} setCount={setD10} icon={decahedron} />
				<DiceIcon tooltip={"d12"} count={d12} setCount={setD12} icon={dodecahedron} />
				<DiceIcon tooltip={"d20"} count={d20} setCount={setD20} icon={icosahedron} />
				<DiceIcon tooltip={"d100"} count={d100} setCount={setD100} icon={doubleDecahedron} />
			</div>
			<Button
				type={"primary"}
				disabled={
					d4 === 0 && d6 === 0 && d8 === 0 && d10 === 0 && d12 === 0 && d20 === 0 && d100 === 0
				}
				onClick={async () => {
					let diceCommand = "";
					diceCommand += getDiceCommand("d4", d4);
					diceCommand += getDiceCommand("d6", d6);
					diceCommand += getDiceCommand("d8", d8);
					diceCommand += getDiceCommand("d10", d10);
					diceCommand += getDiceCommand("d12", d12);
					diceCommand += getDiceCommand("d20", d20);
					diceCommand += getDiceCommand("d100", d100);
					diceCommand = "/roll " + diceCommand;
					await gameChat(currentGame._id, diceCommand);
				}}
			>
				Roll
			</Button>
		</div>
	);
};

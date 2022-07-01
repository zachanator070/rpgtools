import React, {useReducer} from "react";
import tetrahedron from "../../icons/tetrahedron.svg";
import cube from "../../icons/cube.svg";
import octahedron from "../../icons/octahedron.svg";
import decahedron from "../../icons/decahedron.svg";
import dodecahedron from "../../icons/dodecahedron.svg";
import icosahedron from "../../icons/icosahedron.svg";
import doubleDecahedron from "../../icons/double-decahedron.svg";

import { DiceIcon } from "./DiceIcon";
import {Button} from "antd";
import { useGameChat } from "../../hooks/game/useGameChat";
import useCurrentGame from "../../hooks/game/useCurrentGame";
import { ToolTip } from "../ToolTip";

export const SET_COUNT_ACTION = 'SET_COUNT_ACTION';
export const SET_BONUS_ACTION = 'SET_BONUS_ACTION';

const diceReducer = (state, action) => {
	switch (action.type){
		case SET_COUNT_ACTION:
			return {...state, count: action.payload};
		case SET_BONUS_ACTION:
			return {...state, bonus: action.payload};
		default:
			throw new Error(`Dice reducer action not supported: ${action}`);
	}
}

export const DiceRoller = () => {
	const [d4, setD4] = useReducer(diceReducer, {name: 'd4', count: 0, bonus: 0});
	const [d6, setD6] = useReducer(diceReducer, {name: 'd6', count: 0, bonus: 0});
	const [d8, setD8] = useReducer(diceReducer, {name: 'd8', count: 0, bonus: 0});
	const [d10, setD10] = useReducer(diceReducer, {name: 'd10', count: 0, bonus: 0});
	const [d12, setD12] = useReducer(diceReducer, {name: 'd12', count: 0, bonus: 0});
	const [d20, setD20] = useReducer(diceReducer, {name: 'd20', count: 0, bonus: 0});
	const [d100, setD100] = useReducer(diceReducer, {name: 'd100', count: 0, bonus: 0});
	const { currentGame } = useCurrentGame();
	const { gameChat } = useGameChat();

	const getDiceCommand = (dice) => {
		if (dice.count !== 0) {
			let bonus = '';
			if(dice.bonus !== 0){
				if(dice.bonus>0){
					bonus = `+${dice.bonus}`;
				}
				else{
					bonus = dice.bonus;
				}
			}
			return `${dice.count}${dice.name}${bonus} `;
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
				<DiceIcon tooltip={"d4"} count={d4.count} reducer={setD4} icon={tetrahedron} {...d4}/>
				<DiceIcon tooltip={"d6"} count={d6.count} reducer={setD6} icon={cube} {...d6}/>
				<DiceIcon tooltip={"d8"} count={d8.count} reducer={setD8} icon={octahedron} {...d8}/>
				<DiceIcon tooltip={"d10"} count={d10.count} reducer={setD10} icon={decahedron} {...d10}/>
				<DiceIcon tooltip={"d12"} count={d12.count} reducer={setD12} icon={dodecahedron} {...d12}/>
				<DiceIcon tooltip={"d20"} count={d20.count} reducer={setD20} icon={icosahedron} {...d20}/>
				<DiceIcon tooltip={"d100"} count={d100.count} reducer={setD100} icon={doubleDecahedron} {...d100}/>
			</div>
			<Button
				type={"primary"}
				disabled={
					d4 === 0 && d6 === 0 && d8 === 0 && d10 === 0 && d12 === 0 && d20 === 0 && d100 === 0
				}
				onClick={async () => {
					let diceCommand = "";
					diceCommand += getDiceCommand(d4);
					diceCommand += getDiceCommand(d6);
					diceCommand += getDiceCommand(d8);
					diceCommand += getDiceCommand(d10);
					diceCommand += getDiceCommand(d12);
					diceCommand += getDiceCommand(d20);
					diceCommand += getDiceCommand(d100);
					diceCommand = "/roll " + diceCommand;
					await gameChat({gameId: currentGame._id, message: diceCommand});
				}}
			>
				Roll
			</Button>
		</div>
	);
};

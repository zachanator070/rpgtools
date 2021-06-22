import React from "react";
import { DiceAttribute } from "./DiceAttribute";
import { InfoCircleOutlined } from "@ant-design/icons";
import { useCurrentCharacter } from "../../hooks/game/useCurrentCharacter";
import { LoadingView } from "../LoadingView";
import { DiceRoller } from "./DiceRoller";
import { ToolTip } from "../ToolTip";

export const DiceOptions = ({ renderer }) => {
	const { currentCharacter } = useCurrentCharacter();
	if (!currentCharacter) {
		return <LoadingView />;
	}
	return (
		<div
			style={{
				overflow: "auto",
				height: "100%",
			}}
		>
			<div className={"margin-lg-bottom"}>
				<h2 style={{ display: "inline" }}>Attribute Checks</h2>
				<span className={"margin-lg-left"}>
					<ToolTip>
						<p>Click on an attribute to roll a skill check</p>
					</ToolTip>
				</span>
			</div>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					flexWrap: "wrap",
				}}
			>
				<DiceAttribute attribute={"STR"} value={currentCharacter.str} />
				<DiceAttribute attribute={"DEX"} value={currentCharacter.dex} />
				<DiceAttribute attribute={"CON"} value={currentCharacter.con} />
				<DiceAttribute attribute={"INT"} value={currentCharacter.int} />
				<DiceAttribute attribute={"WIS"} value={currentCharacter.wis} />
				<DiceAttribute attribute={"CHA"} value={currentCharacter.cha} />
			</div>
			<DiceRoller />
		</div>
	);
};

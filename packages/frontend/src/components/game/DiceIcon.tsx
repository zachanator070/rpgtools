import React from "react";
import {SET_BONUS_ACTION, SET_COUNT_ACTION} from "./DiceRoller";
import ToolTip from "../generic/ToolTip";
import NumberBadge from "../generic/NumberBadge";
import NumberInput from "../generic/NumberInput";

interface DiceIconProps {
	reducer: any;
	count: number;
	bonus: number;
	icon: string;
	tooltip: string;
}

export default function DiceIcon ({ reducer, count, bonus, icon, tooltip }: DiceIconProps) {
	return (
		<ToolTip title={tooltip}>
			<div className={'margin-md'}>
				<span
					style={{
						width: "5em",
					}}
					onClick={() => reducer({type: SET_COUNT_ACTION, payload: count + 1 })}
					onContextMenu={(e) => {
						if (count > 0) {
							reducer({type: SET_COUNT_ACTION, payload: count - 1});
						}
						e.preventDefault();
					}}
				>
				<NumberBadge count={count}>
					<img src={icon} style={{ width: "4em" }} alt={tooltip} />
				</NumberBadge>
			</span>
				<span className={'margin-md'}>
				+
			</span>
				<NumberInput value={bonus} onChange={(value) => reducer({type: SET_BONUS_ACTION, payload: value})}/>
			</div>

		</ToolTip>
	);
};

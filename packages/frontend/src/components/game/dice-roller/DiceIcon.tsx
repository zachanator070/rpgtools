import React, { Dispatch, FunctionComponent } from "react";
import { DiceAction, SET_BONUS_ACTION, SET_COUNT_ACTION } from "./DiceRoller";
import ToolTip from "../../widgets/ToolTip";
import NumberBadge from "../../widgets/NumberBadge";
import NumberInput from "../../widgets/input/NumberInput";

interface DiceIconProps {
	dispatch: Dispatch<DiceAction>;
	count: number;
	bonus: number;
	icon: FunctionComponent;
	tooltip: string;
}

export default function DiceIcon({ dispatch, count, bonus, icon, tooltip }: DiceIconProps) {
	return (
		<ToolTip title={tooltip}>
			<div className={"margin-md"}>
				<span
					style={{
						width: "5em",
					}}
					onClick={() => dispatch({ type: SET_COUNT_ACTION, payload: count + 1 })}
					onContextMenu={(e) => {
						if (count > 0) {
							dispatch({ type: SET_COUNT_ACTION, payload: count - 1 });
						}
						e.preventDefault();
					}}
				>
					<NumberBadge count={count}>
						<img src={icon as never} style={{ width: "4em" }} alt={tooltip} />
					</NumberBadge>
				</span>
				<span className={"margin-md"}>+</span>
				<NumberInput
					value={bonus}
					onChange={(value) => dispatch({ type: SET_BONUS_ACTION, payload: value })}
				/>
			</div>
		</ToolTip>
	);
}

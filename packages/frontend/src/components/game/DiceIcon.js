import React from "react";
import {Badge, InputNumber, Tooltip} from "antd";
import {SET_BONUS_ACTION, SET_COUNT_ACTION} from "./DiceRoller";

export const DiceIcon = ({ reducer, count, bonus, icon, tooltip }) => {
	return (
		<Tooltip title={tooltip}>
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
				<Badge count={count}>
					<img src={icon} style={{ width: "4em" }} alt={tooltip} />
				</Badge>
			</span>
				<span className={'margin-md'}>
				+
			</span>
				<InputNumber value={bonus} onChange={(value) => reducer({type: SET_BONUS_ACTION, payload: value})}/>
			</div>

		</Tooltip>
	);
};

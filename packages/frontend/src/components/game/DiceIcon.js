import React from "react";
import { Badge, Tooltip } from "antd";

export const DiceIcon = ({ setCount, count, icon, tooltip }) => {
	return (
		<Tooltip title={tooltip}>
			<div
				style={{
					flex: "1",
					width: "5em",
				}}
				onClick={() => setCount(count + 1)}
				onContextMenu={(e) => {
					if (count > 0) {
						setCount(count - 1);
					}
					e.preventDefault();
				}}
			>
				<Badge count={count}>
					<img src={icon} style={{ width: "4em" }} alt={tooltip} />
				</Badge>
			</div>
		</Tooltip>
	);
};

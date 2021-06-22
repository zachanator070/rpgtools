import React from "react";
import { Alert } from "antd";

export default ({ errors }) => {
	if (!errors || errors.length === 0) {
		return <></>;
	}

	return (
		<div>
			{errors.map((error) => (
				<Alert key={error} message={error} type={"error"} showIcon closable />
			))}
		</div>
	);
};

import React from "react";
import { Tooltip } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";

export const ToolTip = ({ children }) => {
	return (
		<Tooltip title={children}>
			<QuestionCircleOutlined />
		</Tooltip>
	);
};

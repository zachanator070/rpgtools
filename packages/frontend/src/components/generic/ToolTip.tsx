import React from "react";
import { Tooltip } from "antd";
import QuestionMarkIcon from "./QuestionMarkIcon";

export default function ToolTip({ title, children }: {title: React.ReactNode, children?: React.ReactNode}) {
	return (
		<Tooltip title={title}>
			{children || <QuestionMarkIcon/>}
		</Tooltip>
	);
};

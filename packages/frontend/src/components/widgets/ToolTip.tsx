import React from "react";
import { Tooltip } from "antd";
import QuestionMarkIcon from "./QuestionMarkIcon";
import {WidgetProps} from "./WidgetProps";

interface ToolTipProps extends WidgetProps {
	title: React.ReactNode;
	children?: React.ReactNode;
}

export default function ToolTip({ title, children }: ToolTipProps) {
	return (
		<Tooltip title={title} placement="top">
			{children || <QuestionMarkIcon/>}
		</Tooltip>
	);
};

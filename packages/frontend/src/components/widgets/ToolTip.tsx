import React from "react";
import { Tooltip } from "antd";
import QuestionMarkIcon from "./icons/QuestionMarkIcon";
import {WidgetProps} from "./WidgetProps";

interface ToolTipProps extends WidgetProps {
	title: React.ReactNode;
	children?: React.ReactNode;
}

export default function ToolTip({ title, children, className }: ToolTipProps) {
	return (
		<div className={className}>
			<Tooltip title={title} placement="top">
				{children || <QuestionMarkIcon />}
			</Tooltip>
		</div>
	);
};

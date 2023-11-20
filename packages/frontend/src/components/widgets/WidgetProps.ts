import React, { CSSProperties } from "react";

export interface WidgetProps {
	id?: string;
	style?: CSSProperties;
	ref?: React.Ref<string>;
	className?: string;
}

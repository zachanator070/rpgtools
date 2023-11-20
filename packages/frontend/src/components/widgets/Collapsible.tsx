import React from "react";
import { Collapse } from "antd";

export default function Collapsible({ title, children }) {
	return (
		<Collapse ghost>
			<Collapse.Panel key={"1"} header={title}>
				{children}
			</Collapse.Panel>
		</Collapse>
	);
}

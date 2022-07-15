import React, {ReactElement, CSSProperties, useState} from "react";
import { Button, Drawer } from "antd";
import { MenuOutlined } from "@ant-design/icons";

interface SlidingDrawerProps {
	title?: string;
	placement: "right" | "top" | "bottom" | "left";
	children: ReactElement;
	startVisible: boolean;
	visible?: boolean;
	setVisible?: (visible: boolean) => void;
}

export default function SlidingDrawer({
	title,
	placement,
	children,
	startVisible,
	visible,
	setVisible,
}: SlidingDrawerProps) {
	if (visible === undefined || setVisible === undefined) {
		[visible, setVisible] = useState(startVisible || false);
	}
	const buttonStyle: CSSProperties = {
		position: "absolute",
		padding: "2em",
		top: "0%",
	};

	if (placement === "right") {
		buttonStyle.right = "0";
	} else {
		buttonStyle.left = "0";
	}

	return (
		<>
			<div style={buttonStyle}>
				<Button onClick={() => setVisible(true)}>
					<MenuOutlined />
				</Button>
			</div>
			<Drawer
				title={title}
				placement={placement || "right"}
				closable={true}
				onClose={() => setVisible(false)}
				visible={visible}
				mask={false}
				maskClosable={false}
				getContainer={false}
				style={{ position: "absolute" }}
				width={"512px"}
			>
				{children}
			</Drawer>
		</>
	);
};

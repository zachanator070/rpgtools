import React, { useState } from "react";
import { Button, Drawer } from "antd";
import { MenuOutlined } from "@ant-design/icons";

export const SlidingDrawer = ({
	title,
	placement,
	children,
	startVisible,
	visible,
	setVisible,
}) => {
	if (visible === undefined || setVisible === undefined) {
		[visible, setVisible] = useState(startVisible || false);
	}
	const buttonStyle = {
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
				<Button onClick={async () => await setVisible(true)}>
					<MenuOutlined />
				</Button>
			</div>
			<Drawer
				title={title}
				placement={placement || "right"}
				closable={true}
				onClose={async () => await setVisible(false)}
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

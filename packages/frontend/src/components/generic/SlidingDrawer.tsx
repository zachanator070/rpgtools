import React, { CSSProperties, useState} from "react";
import {Drawer} from "antd";
import PrimaryButton from "./PrimaryButton";
import HamburgerMenuIcon from "./icons/HamburgerMenuIcon";

interface SlidingDrawerProps {
	title?: string;
	placement: "right" | "top" | "bottom" | "left";
	children: React.ReactNode;
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
				<PrimaryButton onClick={() => setVisible(true)}>
					<HamburgerMenuIcon />
				</PrimaryButton>
			</div>
			<Drawer
				title={title}
				placement={placement || "right"}
				closable={false}
				onClose={() => setVisible(false)}
				visible={visible}
				mask={false}
				maskClosable={false}
				getContainer={false}
				style={{ position: "absolute" }}
				width={"512px"}
			>
				<div style={{textAlign: placement == 'left' ? 'right' : 'left'}}>
					<div style={{display: 'flex', justifyContent: 'space-around'}}>
						<PrimaryButton onClick={() => setVisible(false)}>Close</PrimaryButton>
					</div>
				</div>
				{children}
			</Drawer>
		</>
	);
};

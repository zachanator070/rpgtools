import React from 'react';
import {Icon} from "antd";

export const SlidingDrawer = ({side, show, setShow, children}) => {

	let leftButton = null;
	let rightButton = null;
	if (side === 'left') {
		rightButton = <div className={`drawer-button`}>
			<a href='#' onClick={() => {
				setShow(!show)
			}}>
				{show ? <Icon type="double-left"/> : <Icon type="double-right"/>}
			</a>
		</div>;
	} else {
		leftButton = <div className={`drawer-button`} style={{left: '-50px'}}>
			<a href='#' onClick={() => {
				setShow(!show)
			}}>
				{show ? <Icon type="double-right"/> : <Icon type="double-left"/>}
			</a>
		</div>;
	}

	const drawerStyle = {
		height: `100%`,
		width: show ? `33%` : '0%',
	};

	return (
		<div style={drawerStyle} className={`drawer absolute-${side}`}>
			{leftButton}
			<div className={`drawer-content`} style={{display: show ? null : 'none'}}>
				{children}
			</div>
			{rightButton}
		</div>
	);
};
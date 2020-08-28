 import React, {useState} from 'react';
 import {Button, Drawer} from "antd";
 import {MenuOutlined} from '@ant-design/icons';

export const SlidingDrawer = ({title, placement, children, startVisible}) => {

	const [visible, setVisible] = useState(startVisible || false);

	return <>
		<div style={{
			position: 'absolute',
			padding: '2em',
			right: '0',
			top: '0%',
		}}>
			<Button onClick={async () => await setVisible(true)}>
				<MenuOutlined />
			</Button>
		</div>
		<Drawer
			title={title}
			placement={placement || 'right'}
			closable={true}
			onClose={async () => await setVisible(false)}
			visible={visible}
			mask={false}
			maskClosable={false}
			getContainer={false}
			style={{ position: 'absolute'}}
			width={'512'}
		>
			{children}
		</Drawer>
	</>;
};
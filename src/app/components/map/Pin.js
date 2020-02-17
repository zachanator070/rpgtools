import React, {Component} from 'react';
import {Popover} from "antd";
import {useHistory} from 'react-router-dom';
import useCurrentWorld from "../../hooks/useCurrentWorld";

export const Pin = ({pin, translate}) => {

	const history = useHistory();
	const {currentWorld} = useCurrentWorld();

	const editButton = pin.canWrite ?
		<a href='#' className='margin-md-left' onClick={() => {
		}}>Edit Pin</a>
		: null;

	let pinPopupContent = <div>
		<h2>Empty Pin</h2>
		{editButton}
	</div>;

	if (pin.page) {
		pinPopupContent = <div>
			<h2>{pin.page.name}</h2>
			<h3>{pin.page.type}</h3>
			<a href='#' onClick={() => {
			}}>Details</a>
			{pin.page.type === 'place' ?
				<a className='margin-md-left' href='#' onClick={() => {
					history.push(`/ui/world/${currentWorld._id}/map/${pin.page._id}`)
				}}>Open Map</a> : null}
			{editButton}
		</div>;
	}

	const coordinates = translate(pin.x, pin.y);

	return (
		<Popover
			content={pinPopupContent}
			trigger="click"
			key={pin._id}
			overlayStyle={{zIndex: '10'}}
		>
			<div style={{
				position: 'absolute',
				left: coordinates[0] - 5,
				top: coordinates[1] - 5,
				zIndex: 1,
				borderRadius: "50%",
				width: "15px",
				height: "15px",
				backgroundColor: "crimson",
				border: "3px solid powderblue"
			}}/>
		</Popover>
	);
};

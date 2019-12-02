import React, {Component} from 'react';
import {Popover} from "antd";

class Pin extends Component {
	render() {
		const editButton = this.props.currentWorld && this.props.currentWorld.canWrite ?
			<a href='#' className='margin-md-left' onClick={() => {
				this.props.setPinBeingEdited(this.props.pin);
				this.props.showEditPinModal(true);
			}}>Edit Pin</a>
			: null;

		let pinPopupContent = <div>
			<h2>Empty Pin</h2>
			{editButton}
		</div>;

		if (this.props.pin.page) {
			pinPopupContent = <div>
				<h2>{this.props.pin.page.name}</h2>
				<h3>{this.props.pin.page.type}</h3>
				<a href='#' onClick={() => {
					this.props.findAndSetDisplayWiki(this.props.pin.page._id);
					this.props.showLeftDrawer(true);
				}}>Details</a>
				{this.props.pin.page.type === 'place' && this.props.pin.page.mapImage ?
					<a className='margin-md-left' href='#' onClick={() => {
						this.props.gotoPage('/ui/map', {map: this.props.pin.page.mapImage._id})
					}}>Open Map</a> : null}
				{editButton}
			</div>;
		}

		const coordinates = this.props.translate(this.props.pin.x, this.props.pin.y);

		return (
			<Popover
				content={pinPopupContent}
				trigger="click"
				key={this.props.pin._id}
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
	}
}

export default Pin;
import React, {Component} from 'react';
import {Icon} from "antd";

class SlidingDrawer extends Component {

	constructor(props) {
		super(props);
		this.state = {
			width: 0
		}
	}

	componentDidMount() {
		this.loadDefaultWidth();
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		this.loadDefaultWidth();
	}

	loadDefaultWidth = () => {
		if (this.state.width === 0 && this.props.maxWidth !== 0) {
			this.setState({
				width: this.props.maxWidth / 3
			})
		}
	};

	render() {
		let leftButton = null;
		let rightButton = null;
		if (this.props.side === 'left') {
			rightButton = <div className={`drawer-button`}>
				<a href='#' onClick={() => {
					this.props.setShow(!this.props.show)
				}}>
					{this.props.show ? <Icon type="double-left"/> : <Icon type="double-right"/>}
				</a>
			</div>;
		} else {
			leftButton = <div className={`drawer-button`} style={{left: '-50px'}}>
				<a href='#' onClick={() => {
					this.props.setShow(!this.props.show)
				}}>
					{this.props.show ? <Icon type="double-right"/> : <Icon type="double-left"/>}
				</a>
			</div>;
		}

		const drawerStyle = {
			height: `${this.props.height}px`,
			width: this.props.show ? `${this.state.width}px` : '0px',
		};

		return (
			<div style={drawerStyle} className={`drawer absolute-${this.props.side}`}>
				{leftButton}
				<div className={`drawer-content`} style={{display: this.props.show ? null : 'none'}}>
					{this.props.children}
				</div>
				{rightButton}
			</div>
		);
	}
}

export default SlidingDrawer;
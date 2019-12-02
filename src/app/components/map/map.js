import React, {Component} from 'react';
import {Dropdown, Icon, Menu} from "antd";
import GameActionFactory from "../../redux/actions/gameactionfactory";

class Map extends Component {

	constructor(props) {
		super(props);
		this.state = {
			lastMouseX: null,
			lastMouseY: null,
			width: 0,
			height: 0,
			defaultCalculated: true,
			listenersAdded: false,
		};
	}

	updateWindowDimensions = () => {
		if (this.refs.mapContainer && (this.refs.mapContainer.offsetWidth !== this.state.width || this.refs.mapContainer.offsetHeight !== this.state.height)) {
			this.setState({
				width: this.refs.mapContainer.offsetWidth,
				height: this.refs.mapContainer.offsetHeight,
				defaultCalculated: false
			});
		}
	};

	updateMapPosition = (evt) => {
		if (this.state.lastMouseX && this.state.lastMouseY) {
			let newX = this.props.currentMap.x + (evt.clientX - this.state.lastMouseX) / this.props.currentMap.zoom;
			let newY = this.props.currentMap.y + (evt.clientY - this.state.lastMouseY) / this.props.currentMap.zoom;
			this.props.setCurrentMapPosition(newX, newY);
		}
		this.setState({
			lastMouseX: evt.clientX,
			lastMouseY: evt.clientY
		});
	};

	startMapUpdate = (mousedownEvent) => {
		if (mousedownEvent.button !== 0) {
			return;
		}
		this.refs.map.addEventListener('mousemove', this.updateMapPosition, false);
	};

	stopMapUpdate = (mouseUpEvent) => {
		this.refs.map.removeEventListener('mousemove', this.updateMapPosition);
	};

	addMapPanListener = () => {
		const map = this.refs.map;
		if (map) {
			map.addEventListener('mousedown', this.startMapUpdate, false);
			map.addEventListener('mouseup', this.stopMapUpdate, false);
			this.setState({listenersAdded: true});
		}
	};

	removeMapPanListener = () => {
		const map = this.refs.map;
		if (map) {
			map.removeEventListener('mousedown', this.startMapUpdate, false);
			map.removeEventListener('mouseup', this.stopMapUpdate, false);
			this.setState({listenersAdded: false});
		}
	};

	componentDidMount() {
		this.updateWindowDimensions();
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		this.updateWindowDimensions();
		if (!this.props.currentGame || this.props.currentGame.brushOptions.on === GameActionFactory.BRUSH_OFF) {
			if (!this.state.listenersAdded) {
				this.addMapPanListener();
			}
		} else if (this.state.listenersAdded) {
			this.removeMapPanListener();
		}
		if (this.props.currentMap.zoom === 0 || prevProps.currentMap.image._id !== this.props.currentMap.image._id) {
			this.setState({
				defaultCalculated: false
			});
		}
		if (!this.state.defaultCalculated) {
			this.calcDefaultPosition();
		}
	}

	calcDefaultPosition = () => {
		if (this.state.width === 0 || this.state.height === 0) {
			return;
		}

		this.setState({
			defaultCalculated: true
		});

		let smallestRatio = this.state.width / this.props.currentMap.image.width;
		if (this.state.height / this.props.currentMap.image.height < smallestRatio) {
			smallestRatio = this.state.height / this.props.currentMap.image.height;
		}
		this.props.setCurrentMapZoom(smallestRatio);
		this.props.setCurrentMapPosition(-this.props.currentMap.image.width / 2, -this.props.currentMap.image.height / 2);
	};

	handleWheelEvent = (event) => {
		let zoomRate = .1;
		if (event.deltaY > 0) {
			zoomRate *= -1;
		}
		const newZoom = this.props.currentMap.zoom + zoomRate;
		if (newZoom < 2 && newZoom > 0) {
			this.props.setCurrentMapZoom(newZoom);
		}

	};

	translate = (x, y) => {

		x += this.props.currentMap.x;
		y += this.props.currentMap.y;

		x *= this.props.currentMap.zoom;
		y *= this.props.currentMap.zoom;

		x += this.state.width / 2;
		y += this.state.height / 2;

		x = Math.floor(x);
		y = Math.floor(y);

		return [x, y];

	};

	reverseTranslate = (x, y) => {
		return [
			(x - this.state.width / 2) / this.props.currentMap.zoom - this.props.currentMap.x,
			(y - this.state.height / 2) / this.props.currentMap.zoom - this.props.currentMap.y
		];
	};

	getChunks = () => {
		let chunks = [];
		for (let chunk of this.props.currentMap.image.chunks) {

			const coordinates = this.translate(chunk.x * 250, chunk.y * 250);
			const x = coordinates[0];
			const y = coordinates[1];

			let width = chunk.width;
			width *= this.props.currentMap.zoom;
			width = Math.ceil(width);

			let height = chunk.height;
			height *= this.props.currentMap.zoom;
			height = Math.ceil(height);

			chunks.push(
				<img
					key={chunk._id}
					src={`/api/chunks/data/${chunk._id}`}
					style={{position: 'absolute', left: x, top: y, width: width, height: height}}
					draggable="false"
					className='map-tile'
				/>
			);
		}
		return chunks;
	};

	getDropdownMenu = () => {
		const menuItems = [];
		for (let item of this.props.menuItems || []) {
			menuItems.push(
				<Menu.Item key={item.name} onClick={() => {
					const boundingBox = this.refs.map.getBoundingClientRect();
					const x = this.state.lastMouseX - boundingBox.x;
					const y = this.state.lastMouseY - boundingBox.y;
					const coords = this.reverseTranslate(x, y);
					item.onClick(coords[0], coords[1]);
				}}>{item.name}</Menu.Item>
			);
		}

		return menuItems;
	};

	render() {
		if (!this.props.currentMap) {
			return <div>No Current Map</div>;
		}
		if (!this.props.currentWorld) {
			return <div>No Current World</div>;
		}
		if (this.props.currentMap.image.chunks.length < this.props.currentMap.image.chunkHeight * this.props.currentMap.image.chunkWidth) {
			setTimeout(() => {
				this.props.getAndSetMap(this.props.currentMap.image._id);
			}, 10000);
			return <div className='text-align-center margin-lg'><Icon type="loading"
			                                                          style={{fontSize: 24, marginRight: '15px'}} spin/>Map
				is rendering. This may take a few minutes...</div>;
		}
		let images = this.getChunks();

		const extras = [];

		for (let extra of this.props.extras || []) {
			extras.push(
				React.cloneElement(extra, {translate: this.translate, reverseTranslate: this.reverseTranslate})
			);
		}

		const map = <div
			ref='map'
			className='margin-none overflow-hidden flex-grow-1 position-relative flex-column'
			onWheel={this.handleWheelEvent}
			onMouseDown={(event) => {
				this.setState({lastMouseX: event.clientX, lastMouseY: event.clientY})
			}}
		>
			{images}
			{extras}
		</div>;
		const menuItems = this.getDropdownMenu();
		const mapContainer =
			<div ref='mapContainer' className='flex-grow-1 flex-column'>
				{this.props.currentWorld.canWrite && menuItems.length > 0 ?
					<Dropdown
						overlay={
							<Menu>
								{menuItems}
							</Menu>
						}
						trigger={['contextMenu']}
					>
						{map}
					</Dropdown>
					:
					map
				}
			</div>;

		return mapContainer;
	}

}

export default Map;
import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import {connect} from 'react-redux';
import DefaultViewContainer from "../defaultviewcontainer";
import WikiActionFactory from "../../redux/actions/wikiactionfactory";
import Map from "./Map";
import MapActionFactory from "../../redux/actions/mapactionfactory";
import WikiView from "../wiki/WikiView";
import UIActionFactory from "../../redux/actions/uiactionfactory";
import DefaultMapView from "./defaultmapview";
import SlidingDrawer from "../SlidingDrawer";
import MapBreadCrumbs from "./MapBreadCrumbs";
import Pin from "./Pin";

class MapView extends Component {

	constructor(props) {
		super(props);
		this.state = {
			width: 0,
			height: 0
		};
	}

	componentDidMount() {
		this.updateWindowDimensions();
		window.addEventListener('resize', this.updateWindowDimensions);
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.updateWindowDimensions);
	}

	updateWindowDimensions = () => {
		if (this.refs.container && (this.refs.container.offsetWidth !== this.state.width || this.refs.container.offsetHeight !== this.state.height)) {
			this.setState({width: this.refs.container.offsetWidth, height: this.refs.container.offsetHeight});
		}
	};

	componentDidUpdate(prevProps, prevState, snapshot) {
		this.updateWindowDimensions();
	}

	getPins = () => {
		let pins = [];
		for (let pin of this.props.allPins.filter((pin) => {
			return pin.map._id === this.props.currentMap.image._id
		})) {
			pins.push(
				<Pin
					currentWorld={this.props.currentWorld}
					setPinBeingEdited={this.props.setPinBeingEdited}
					showEditPinModal={this.props.showEditPinModal}
					pin={pin}
					findAndSetDisplayWiki={this.props.findAndSetDisplayWiki}
					showLeftDrawer={this.props.showLeftDrawer}
					gotoPage={this.props.gotoPage}
					key={pin._id}
				/>
			);
		}

		return pins;
	};

	render() {
		if (!this.props.currentWorld) {
			return (<DefaultViewContainer/>);
		}
		const pins = this.getPins();

		let map = <Map
			setCurrentMapPosition={this.props.setCurrentMapPosition}
			setCurrentMapZoom={this.props.setCurrentMapZoom}
			currentMap={this.props.currentMap}
			currentWorld={this.props.currentWorld}
			menuItems={[
				{
					onClick: (mouseX, mouseY) => {
						let pin = {
							x: mouseX,
							y: mouseY,
							map: this.props.currentMap.image._id
						};
						this.props.createPin(pin);
					},
					name: 'New Pin'
				}
			]}
			extras={pins}
			getAndSetMap={this.props.getAndSetMap}
		/>;

		if (!this.props.currentMap.image) {
			map = <DefaultMapView
				uploadImageFromMap={this.props.uploadImageFromMap}
				ui={this.props.ui}
				setMapUploadStatus={this.props.setMapUploadStatus}
			/>;
		}

		return (
			<div id='mapContainer' ref='container' style={{position: 'relative'}}
			     className='overflow-hidden flex-column flex-grow-1'>
				<MapBreadCrumbs
					gotoPage={this.props.gotoPage}
					currentWorld={this.props.currentWorld}
					currentMap={this.props.currentMap}
					allWikis={this.props.allWikis}
					allPins={this.props.allPins}
				/>
				<div className='flex-grow-1 flex-column'>
					{this.props.displayWiki ?
						<SlidingDrawer
							side='left'
							show={this.props.ui.showLeftDrawer}
							setShow={this.props.showLeftDrawer}
							height={this.state.height}
							maxWidth={this.state.width}
						>
							<WikiView
								gotoPage={this.props.gotoPage}
								currentWiki={this.props.displayWiki}
								currentWorld={this.props.currentWorld}
								allPins={this.props.allPins}
							/>
						</SlidingDrawer>
						: null}
					{map}
				</div>
			</div>
		);
	}
}

const mapStateToProps = state => {
	return {
		currentUser: state.currentUser,
		currentWorld: state.currentWorld,
		currentMap: state.currentMap,
		allPins: state.allPins,
		allWikis: state.allWikis,
		displayWiki: state.displayWiki,
		ui: state.ui,
	}
};

const mapDispatchToProps = dispatch => {
	return {
		uploadImageFromMap: (file) => {
			dispatch(WikiActionFactory.uploadImageFromMap(file));
		},
		setCurrentMapPosition: (x, y) => {
			dispatch(MapActionFactory.setCurrentMapPosition(x, y));
		},
		showLeftDrawer: (show) => {
			dispatch(UIActionFactory.showLeftDrawer(show));
		},
		gotoPage: (path, params = null, override = false) => {
			dispatch(UIActionFactory.gotoPage(path, params, override));
		},
		setCurrentMapZoom: (zoom) => {
			dispatch(MapActionFactory.setCurrentMapZoom(zoom));
		},
		createPin: (pin) => {
			dispatch(MapActionFactory.createPin(pin));
		},
		findAndSetDisplayWiki: (wikiId) => {
			dispatch(WikiActionFactory.findAndSetDisplayWiki(wikiId));
		},
		showEditPinModal: (show) => {
			dispatch(UIActionFactory.showEditPinModal(show));
		},
		setPinBeingEdited: (pin) => {
			dispatch(MapActionFactory.setPinBeingEdited(pin));
		},
		setMapUploadStatus: (status) => {
			dispatch(UIActionFactory.setMapUploadStatus(status));
		},
		getAndSetMap: (mapId) => {
			dispatch(MapActionFactory.getAndSetMap(mapId));
		}
	}
};
const MapContainer = connect(
	mapStateToProps,
	mapDispatchToProps
)(withRouter(MapView));

export default MapContainer;
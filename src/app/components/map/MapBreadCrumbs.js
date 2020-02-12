import React, {Component} from 'react';
import {Breadcrumb} from "antd";

class MapBreadCrumbs extends Component {

	getWikiPageFromMapId = (mapId) => {
		for (let page of this.props.allWikis) {
			if (page.mapImage && page.mapImage._id === mapId) {
				return page;
			}
		}
	};

	getPinFromPageId = (pageId) => {
		for (let pin of this.props.allPins) {
			if (pin.page && pin.page._id === pageId) {
				return pin;
			}
		}
	};

	render() {
		if (!this.props.currentMap.image || !this.props.currentWorld || this.props.allWikis.length === 0) {
			return <div></div>;
		}

		let currentMap = this.props.currentMap.image;
		const path = [];
		while (true) {
			const currentPage = this.getWikiPageFromMapId(currentMap._id);
			if (!currentPage) {
				break;
			}
			const currentPin = this.getPinFromPageId(currentPage._id);
			path.push({
				name: currentPage.name,
				id: currentMap._id
			});

			if (currentPage._id === this.props.currentWorld.wikiPage._id) {
				break;
			}
			if (!currentPin) {
				break;
			}
			currentMap = currentPin.map;
		}

		const breadCrumbs = [];
		for (let map of path.reverse()) {
			breadCrumbs.push(
				<Breadcrumb.Item key={map.id}>
					<a href="#" onClick={() => {
						this.props.gotoPage('/ui/map', {map: map.id})
					}}>{map.name}</a>
				</Breadcrumb.Item>
			);
		}

		return (
			<div className='breadcrumbs'>
				<Breadcrumb>
					{breadCrumbs}
				</Breadcrumb>
			</div>
		);
	}
}

export default MapBreadCrumbs;
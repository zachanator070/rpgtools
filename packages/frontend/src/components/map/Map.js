import React, {useEffect, useRef, useState} from 'react';
import {Dropdown, Icon, Menu} from "antd";
import useCurrentMap from "../../hooks/map/useCurrentMap";
import {LoadingView} from "../LoadingView";

export const Map = ({menuItems, extras}) => {

	const [width, setWidth] = useState(0);
	const [height, setHeight] = useState(0);

	const zoom = useRef(1);
	const lastMouseY = useRef(0);
	const lastMouseX = useRef(0);
	const x = useRef(0);
	const y = useRef(0);
	const [coordsHash, setCoordsHash] = useState(null);

	const mapContainer = useRef({offsetWidth: 1, offsetHeight: 1});
	const map = useRef(null);

	const {currentMap, loading} = useCurrentMap();

	const updateWindowDimensions = async () => {
		if (mapContainer.current && (mapContainer.current.offsetWidth !== width || mapContainer.current.offsetHeight !== height)) {
			await setWidth(mapContainer.current.offsetWidth);
			await setHeight(mapContainer.current.offsetHeight);
		}
	};

	useEffect(() => {
		window.addEventListener('resize', updateWindowDimensions);
		return () => {
			window.removeEventListener('resize', updateWindowDimensions);
		};
	}, []);

	useEffect(() => {
		(async () => {
			await updateWindowDimensions();
		})();
	}, [mapContainer.current]);

	const updateMapPosition = async (evt) => {
		const eventX = evt.clientX;
		const eventY = evt.clientY;
		if (lastMouseX.current && lastMouseY.current) {
			let newX = x.current + (eventX - lastMouseX.current) / zoom.current;
			let newY = y.current + (eventY - lastMouseY.current) / zoom.current;
			// console.log(`Setting map coords to ${newX}, ${newY}`);
			x.current = newX;
			y.current = newY;
		}
		lastMouseX.current = eventX;
		lastMouseY.current = eventY;
		await setCoordsHash(`${x.current}.${y.current}`);
	};

	const startMoving = (event) => {
		if(event.button === 0){
			map.current.addEventListener('mousemove', updateMapPosition);
		}
	};

	const stopMoving = () => {
		map.current.removeEventListener('mousemove', updateMapPosition);
	};
	useEffect(() => {
		map.current.addEventListener('mousedown', startMoving);
		map.current.addEventListener('mouseup', stopMoving);
		return () => {
			map.current.removeEventListener('mousedown', startMoving);
			map.current.removeEventListener('mouseup', stopMoving);
		};
	}, []);

	useEffect(() => {
		(async () => {
			await calcDefaultPosition();
		})();

	}, [currentMap, width, height]);
	
	const calcDefaultPosition = async () => {
		if (width === 0 || height === 0) {
			return;
		}

		let smallestRatio = width / currentMap.mapImage.width;
		if (height / currentMap.mapImage.height < smallestRatio) {
			smallestRatio = height / currentMap.mapImage.height;
		}
		zoom.current = smallestRatio;
		x.current = -currentMap.mapImage.width / 2;
		y.current = -currentMap.mapImage.height / 2;
		await setCoordsHash(`${x.current}.${y.current}`);
	};

	const handleWheelEvent = async (event) => {
		let zoomRate = .1;
		if (event.deltaY > 0) {
			zoomRate *= -1;
		}
		const newZoom = zoom.current + zoomRate;
		if (newZoom < 2 && newZoom > 0) {
			zoom.current = newZoom;
			await setCoordsHash(`${x.current}.${y.current}.${zoom.current}`);
		}

	};

	// translates world to view coordinates
	const translate = (worldX, worldY) => {

		worldX += x.current;
		worldY += y.current;

		worldX *= zoom.current;
		worldY *= zoom.current;

		worldX += width / 2;
		worldY += height / 2;

		worldX = Math.floor(worldX);
		worldY = Math.floor(worldY);

		return [worldX, worldY];

	};

	const reverseTranslate = (worldX, worldY) => {
		return [
			(worldX - width / 2) / zoom.current - x.current,
			(worldY - height / 2) / zoom.current - y.current
		];
	};

	const getChunks = () => {
		let chunks = [];
		for (let chunk of currentMap.mapImage.chunks) {

			const coordinates = translate(chunk.x * 250, chunk.y * 250);
			const newX = coordinates[0];
			const newY = coordinates[1];

			let width = chunk.width;
			width *= zoom.current;
			width = Math.ceil(width);

			let height = chunk.height;
			height *= zoom.current;
			height = Math.ceil(height);

			chunks.push(
				<img
					alt=''
					key={chunk._id}
					src={`/images/${chunk.fileId}`}
					style={{
						position: 'absolute',
						left: newX,
						top: newY,
						width: width,
						height: height,
					}}
					draggable={false}
					className='map-tile'
					onMouseDown="if (event.preventDefault) event.preventDefault()"
				/>
			);
		}
		return chunks;
	};

	if(!menuItems){
		menuItems = [];
	}
	const getDropdownMenu = () => {
		const items = [];
		for (let item of menuItems) {
			items.push(
				<Menu.Item key={item.name} onClick={() => {
					const boundingBox = map.current.getBoundingClientRect();
					const newPinX = lastMouseX.current - boundingBox.x;
					const newPinY = lastMouseY.current - boundingBox.y;
					const coords = reverseTranslate(newPinX, newPinY);
					item.onClick(coords[0], coords[1]);
				}}>{item.name}</Menu.Item>
			);
		}

		return items;
	};


	if (loading) {
		return <LoadingView/>;
	}

	let images = getChunks();

	const clonedExtras = [];

	for (let extra of extras || []) {
		clonedExtras.push(
			React.cloneElement(extra, {translate: translate, reverseTranslate: reverseTranslate})
		);
	}

	const mapComponent = <div
		ref={map}
		className='margin-none overflow-hidden flex-grow-1 position-relative flex-column'
		onWheel={handleWheelEvent}
		onMouseDown={(event) => {
			lastMouseX.current = event.clientX;
			lastMouseY.current = event.clientY;
		}}
	>
		{images}
		{clonedExtras}
	</div>;

	const menu = getDropdownMenu();

	return (
		<div ref={mapContainer} className='flex-grow-1 flex-column'>
			{currentMap.canWrite && menu.length > 0 ?
				<Dropdown
					overlay={
						<Menu>
							{menu}
						</Menu>
					}
					trigger={['contextMenu']}
				>
					{mapComponent}
				</Dropdown>
				:
				mapComponent
			}
		</div>
	);
};


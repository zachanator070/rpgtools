import React, {ReactElement, useEffect, useRef, useState} from "react";
import { Dropdown, Menu } from "antd";
import useCurrentMap from "../../hooks/map/useCurrentMap";
import { LoadingView } from "../LoadingView";

interface MapProps {
	menuItems: MapMenuItem[];
	extras: ReactElement[];
}

interface MapMenuItem {
	name: string;
	onClick: (mouseX: number, mouseY: number) => Promise<any>
}

export const Map = ({ menuItems, extras }: MapProps) => {
	const [width, setWidth] = useState(0);
	const [height, setHeight] = useState(0);

	const zoom = useRef(1);
	const lastMouseY = useRef(0);
	const lastMouseX = useRef(0);
	const x = useRef(0);
	const y = useRef(0);
	const [coordsHash, setCoordsHash] = useState(null);

	const mapContainer = useRef<HTMLDivElement>();
	const map = useRef(null);
	const mapCanvas = useRef<HTMLCanvasElement>();

	const { currentMap, loading } = useCurrentMap();

	const updateWindowDimensions = async () => {
		if (
			mapContainer.current &&
			(mapContainer.current.offsetWidth !== width ||
				mapContainer.current.offsetHeight !== height)
		) {
			await setWidth(mapContainer.current.offsetWidth);
			await setHeight(mapContainer.current.offsetHeight);
		}
	};

	useEffect(() => {
		window.addEventListener("resize", updateWindowDimensions);
		return () => {
			window.removeEventListener("resize", updateWindowDimensions);
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
		if (event.button === 0) {
			map.current.addEventListener("mousemove", updateMapPosition);
		}
	};

	const stopMoving = () => {
		map.current.removeEventListener("mousemove", updateMapPosition);
	};
	useEffect(() => {
		map.current.addEventListener("mousedown", startMoving);
		map.current.addEventListener("mouseup", stopMoving);
		return () => {
			map.current.removeEventListener("mousedown", startMoving);
			map.current.removeEventListener("mouseup", stopMoving);
		};
	}, []);

	useEffect(() => {
		if (currentMap && width && height) {
			calcDefaultPosition();
			getChunks();
		}
	}, [currentMap, width, height]);

	const calcDefaultPosition = () => {
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
		setCoordsHash(`${x.current}.${y.current}`);
	};

	const handleWheelEvent = async (event) => {
		let zoomRate = 0.1;
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
			(worldY - height / 2) / zoom.current - y.current,
		];
	};

	const getChunks = () => {
		for (let chunk of currentMap.mapImage.chunks) {
			const standardChunkWidth = 250;
			const standardChunkHeight = 250;

			let newWidth = chunk.width;
			newWidth = Math.ceil(newWidth);

			let newHeight = chunk.height;
			newHeight = Math.ceil(newHeight);

			const newX = chunk.x * standardChunkWidth;
			const newY = chunk.y * standardChunkHeight;

			const base_image = new Image(chunk.width, chunk.height);
			base_image.src = `/images/${chunk.fileId}`;
			const mapContext = mapCanvas.current.getContext("2d");
			base_image.onload = () => {
				mapContext.drawImage(base_image, newX, newY);
			};
		}
	};

	if (!menuItems) {
		menuItems = [];
	}
	const getDropdownMenu = () => {
		const items = [];
		for (let item of menuItems) {
			items.push(
				<Menu.Item
					key={item.name}
					onClick={async () => {
						const boundingBox = map.current.getBoundingClientRect();
						const newPinX = lastMouseX.current - boundingBox.x;
						const newPinY = lastMouseY.current - boundingBox.y;
						const coords = reverseTranslate(newPinX, newPinY);
						await item.onClick(coords[0], coords[1]);
					}}
				>
					{item.name}
				</Menu.Item>
			);
		}

		return items;
	};

	if (loading) {
		return <LoadingView />;
	}

	const clonedExtras = [];

	for (let extra of extras || []) {
		clonedExtras.push(
			React.cloneElement(extra, {
				translate: translate,
				reverseTranslate: reverseTranslate,
			})
		);
	}

	const mapComponent = (
		<div
			ref={map}
			className="margin-none overflow-hidden flex-grow-1 position-relative flex-column"
			onWheel={handleWheelEvent}
			onMouseDown={(event) => {
				lastMouseX.current = event.clientX;
				lastMouseY.current = event.clientY;
			}}
		>
			<canvas
				ref={mapCanvas}
				style={{
					position: "absolute",
					left: translate(0, 0)[0],
					top: translate(0, 0)[1],
					width: currentMap.mapImage.width * zoom.current,
					height: currentMap.mapImage.height * zoom.current,
				}}
				width={currentMap.mapImage.width}
				height={currentMap.mapImage.height}
			/>
			{clonedExtras}
		</div>
	);

	const menu = getDropdownMenu();

	return (
		<div ref={mapContainer} className="flex-grow-1 flex-column">
			{currentMap.canWrite && menu.length > 0 ? (
				<Dropdown overlay={<Menu>{menu}</Menu>} trigger={["contextMenu"]}>
					{mapComponent}
				</Dropdown>
			) : (
				mapComponent
			)}
		</div>
	);
};

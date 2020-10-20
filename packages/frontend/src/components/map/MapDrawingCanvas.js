import React, {Component} from 'react';
import {v4 as uuidv4} from "uuid";
import GameActionFactory from "../../redux/actions/gameactionfactory";

class MapDrawingCanvas extends Component {

	constructor(props) {
		super(props);
		this.state = {
			mousex: 0,
			mousey: 0,
			currentPath: [],
			strokesDrawn: [],
			nodesDrawn: [],
		};
		this.currentPathUuid = uuidv4();
	}

	startDrawing = () => {
		if (this.refs.brush && this.refs.canvasContainer) {
			this.draw();
			this.refs.brush.addEventListener('mousemove', this.draw, false);
			this.refs.canvasContainer.addEventListener('mousemove', this.draw, false);
		}
	};

	stopDrawing = () => {
		if (this.refs.brush && this.refs.canvasContainer) {
			this.refs.brush.removeEventListener('mousemove', this.draw, false);
			this.refs.canvasContainer.removeEventListener('mousemove', this.draw, false);
			this.setState({
				currentPath: [],
				strokesDrawn: this.state.strokesDrawn.splice(this.state.strokesDrawn.indexOf(this.currentPathUuid), 1)
			});
		}
	};

	draw = () => {
		const currentPath = this.state.currentPath.slice(0);
		const coords = this.props.reverseTranslate(this.state.mousex, this.state.mousey);
		currentPath.push({
			_id: uuidv4(),
			x: coords[0],
			y: coords[1]
		});
		this.setState({currentPath: currentPath});
	};

	renderCanvas = (strokes) => {
		const context = this.refs.canvas.getContext('2d');
		const recentlyDrawnStrokes = [];
		const recentlyDrawnNodes = [];
		for (let stroke of strokes) {
			if (this.state.strokesDrawn.includes(stroke._id) && stroke._id !== null) {
				break;
			}
			context.strokeStyle = `rgba(${stroke.color.r}, ${stroke.color.g}, ${stroke.color.b}, ${stroke.color.a})`;
			context.fillStyle = `rgba(${stroke.color.r}, ${stroke.color.g}, ${stroke.color.b}, ${stroke.color.a})`;

			switch (stroke.type) {
				case GameActionFactory.BRUSH_BOX: {
					for (let path of stroke.path) {
						const size = stroke.size * this.props.currentGame.zoom;
						context.lineWidth = 5;
						const x = path.x * this.props.currentGame.zoom - size / 2;
						const y = path.y * this.props.currentGame.zoom - size / 2;
						if (this.state.nodesDrawn.includes(path._id)) {
							continue;
						}
						if (stroke.filled) {
							context.fillRect(x, y, size, size);
						} else {
							context.strokeRect(x, y, size, size);
						}
						recentlyDrawnNodes.push(path._id);
					}
					break;
				}
				case GameActionFactory.BRUSH_CIRCLE: {
					for (let path of stroke.path) {
						if (this.state.nodesDrawn.includes(path._id)) {
							continue;
						}
						const size = stroke.size * this.props.currentGame.zoom;
						const x = path.x * this.props.currentGame.zoom;
						const y = path.y * this.props.currentGame.zoom;
						context.lineWidth = 5; //maybe make this configurable one day
						context.beginPath();
						if (stroke.filled) {
							context.ellipse(x, y, size / 2, size / 2, 0, 0, Math.PI * 2);
							context.fill();
						} else {
							context.ellipse(x, y, size / 2, size / 2, 0, 0, Math.PI * 2);
							context.stroke();
						}
						recentlyDrawnNodes.push(path._id);
					}
					break;
				}
				case GameActionFactory.BRUSH_LINE: {
					context.lineWidth = stroke.size * this.props.currentGame.zoom;
					context.lineCap = 'round';
					let lastNode = null;
					context.beginPath();
					for (let path of stroke.path) {
						if (!lastNode || this.state.nodesDrawn.includes(path._id)) {
							lastNode = path;
						} else {
							const lastX = lastNode.x * this.props.currentGame.zoom;
							const lastY = lastNode.y * this.props.currentGame.zoom;
							context.moveTo(lastX, lastY);
							const x = path.x * this.props.currentGame.zoom;
							const y = path.y * this.props.currentGame.zoom;
							context.lineTo(x, y);
							recentlyDrawnNodes.push(path._id);
							lastNode = path;
						}
					}
					context.stroke();
					break;
				}
				case GameActionFactory.BRUSH_ERASER: {
					for (let path of stroke.path) {
						if (this.state.nodesDrawn.includes(path._id)) {
							continue;
						}
						const size = stroke.size * this.props.currentGame.zoom;
						const x = path.x * this.props.currentGame.zoom - size / 2;
						const y = path.y * this.props.currentGame.zoom - size / 2;
						context.clearRect(x, y, size, size);
						recentlyDrawnNodes.push(path._id);
					}
					break;
				}
				default:
					break;
			}
			recentlyDrawnStrokes.push(stroke._id);
		}
		let alreadyDrawnStrokes = this.state.strokesDrawn.splice(0);
		alreadyDrawnStrokes = alreadyDrawnStrokes.concat(recentlyDrawnStrokes);
		this.setState({strokesDrawn: alreadyDrawnStrokes});
		let alreadyDrawnNodes = this.state.nodesDrawn.splice(0);
		alreadyDrawnNodes = alreadyDrawnNodes.concat(recentlyDrawnNodes);
		this.setState({nodesDrawn: alreadyDrawnNodes});
	};

	componentDidUpdate(prevProps, prevState, snapshot) {
		if (this.refs.canvas && this.props.brushOptions &&
			(prevState.currentPath.length !== this.state.currentPath.length || prevProps.currentGame.game.strokes.length !== this.props.currentGame.game.strokes.length)
		) {
			const strokes = this.props.currentGame.game.strokes.slice(0);
			if (this.state.currentPath.length > 0) {
				strokes.push({
					path: this.state.currentPath,
					color: this.props.brushOptions.color,
					size: this.props.brushOptions.size,
					type: this.props.brushOptions.type,
					filled: this.props.brushOptions.filled,
					_id: this.currentPathUuid,
				});
			}
			if (prevState.currentPath.length !== this.state.currentPath.length && this.state.strokesDrawn.includes(this.currentPathUuid)) {
				this.state.strokesDrawn.splice(this.state.strokesDrawn.indexOf(this.currentPathUuid), 1);
			}
			this.renderCanvas(strokes);
		}
	}

	render() {
		if (!this.props.brushOptions) {
			return (<div></div>);
		}
		const size = this.props.brushOptions.size * this.props.currentGame.zoom;
		let style = {
			width: size,
			height: size,
			position: "absolute",
			display: "block",
			left: this.state.mousex - size / 2,
			top: this.state.mousey - size / 2,
			zIndex: 5
		};
		const colorObj = this.props.brushOptions.color;
		const color = `rgba(${colorObj.r}, ${colorObj.g}, ${colorObj.b}, ${colorObj.a})`;
		if ((this.props.brushOptions.filled || this.props.brushOptions.type === GameActionFactory.BRUSH_LINE) && this.props.brushOptions.type !== GameActionFactory.BRUSH_ERASER) {
			style.backgroundColor = color;
		} else if (this.props.brushOptions.type === GameActionFactory.BRUSH_ERASER) {
			style.backgroundColor = 'white';
		} else {
			style.borderStyle = 'solid';
			style.borderWidth = 'thick';
			style.borderColor = color;
		}

		if (this.props.brushOptions.type === GameActionFactory.BRUSH_CIRCLE || this.props.brushOptions.type === GameActionFactory.BRUSH_LINE) {
			style.borderRadius = this.props.brushOptions.size;
		}

		const coordinates = this.props.translate(0, 0);
		const dimensions = this.props.translate(this.props.currentMap.image.width, this.props.currentMap.image.height);
		let mouseOnCanvas = this.state.mousex > coordinates[0] && this.state.mousex < coordinates[0] + dimensions[0] &&
			this.state.mousey > coordinates[1] && this.state.mousey < coordinates[1] + dimensions[1];
		return (
			<div ref='canvasContainer' className='flex-grow-1' style={{zIndex: 1}}>
				{this.props.brushOptions.on === GameActionFactory.BRUSH_ON && mouseOnCanvas ?
					<div
						ref='brush'
						style={style}
						onMouseDown={this.startDrawing}
						onMouseUp={this.stopDrawing}
						onMouseMove={(e) => {
							if (this.refs.canvasContainer) {
								const boundingBox = this.refs.canvasContainer.getBoundingClientRect();
								this.setState({mousex: e.clientX - boundingBox.x, mousey: e.clientY - boundingBox.y})
							}
						}}
					/>
					:
					null
				}
				<canvas
					ref='canvas'
					width={dimensions[0] - coordinates[0]}
					height={dimensions[1] - coordinates[1]}
					style={{
						position: 'absolute',
						left: coordinates[0],
						top: coordinates[1],
					}}
					onMouseMove={(e) => {
						if (this.refs.canvasContainer) {
							const boundingBox = this.refs.canvasContainer.getBoundingClientRect();
							this.setState({mousex: e.clientX - boundingBox.x, mousey: e.clientY - boundingBox.y})
						}
					}}
				>
				</canvas>
			</div>
		);
	}
}

export default MapDrawingCanvas;
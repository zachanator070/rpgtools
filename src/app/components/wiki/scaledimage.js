import React, {Component} from 'react';

class ScaledImage extends Component {

	constructor(props) {
		super(props);
		this.state = {
			width: 0,
			height: 0
		};
	}

	onImgLoad = ({target: img}) => {
		this.resize();
	};

	componentDidUpdate(prevProps, prevState, snapshot) {
		if (prevState.width !== this.state.width || prevState.height !== this.state.height || prevProps.width !== this.props.width || prevProps.height !== this.props.height) {
			this.resize();
		}
	}

	resize = () => {
		if (this.props.width === 0 || this.props.height === 0 || !this.refs.scaledImage) {
			return;
		}
		const height = this.refs.scaledImage.naturalHeight;
		const width = this.refs.scaledImage.naturalWidth;
		const widthScale = this.props.width / width;
		const heightScale = this.props.height / height;
		let biggestScale = widthScale;
		if (heightScale > widthScale) {
			biggestScale = heightScale;
		}
		if (biggestScale > 1) {
			biggestScale = 1;
		}
		this.setState({
			width: width * biggestScale,
			height: height * biggestScale
		});
	}

	render() {
		return (
			<img alt='' ref='scaledImage' style={{width: this.state.width, height: this.state.height}}
			     onLoad={this.onImgLoad} src={this.props.src}/>
		);
	}
}

export default ScaledImage;
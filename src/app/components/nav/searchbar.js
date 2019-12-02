import React, {Component} from 'react';
import {Col, Input, List, Row} from "antd";
import {withRouter} from 'react-router-dom';

class SearchBar extends Component {

	constructor(props) {
		super(props);
		this.state = {
			showResults: false
		}
	}

	search = (name) => {
		this.props.searchWikis({world: this.props.currentWorld._id, name: name});
		this.setState({showResults: true});
	};

	componentDidMount() {
		window.addEventListener('mousedown', this.hideDropdown);
	};

	componentWillUnmount() {
		window.removeEventListener('mousedown', this.hideDropdown);
	}

	hideDropdown = (event) => {
		if (!event.target.matches('.searchResult') && !event.target.matches('.ant-input') && !event.target.matches('.ant-list-item-content')) {
			this.setState({showResults: false});
		}
	};

	render() {
		return (
			<div>
				<Row className='text-align-center'>
					<Input.Search
						placeholder="input search text"
						onChange={event => this.search(event.target.value)}
						onSearch={value => this.search(value)}
						onClick={() => {
							if (this.props.wikiSearchResults.length > 0) {
								this.setState({showResults: true})
							}
						}}
						style={{width: '80%'}}
						type='text'
					/>
				</Row>
				<Row>
					<Col span={4}></Col>
					<Col span={16} style={{display: this.state.showResults ? null : 'none'}}>
						<div
							style={{position: 'relative', width: '100%'}}
							className='searchResult'
						>
							<List
								bordered
								className='search-results'
								style={{position: 'absolute', width: 'inherit'}}
								dataSource={this.props.wikiSearchResults}
								renderItem={item => (
									<a href='#' onClick={() => {
									}}>
										<List.Item
											className='searchResult'
											onClick={() => {
												if (!this.props.history.location.pathname.includes('/ui/wiki')) {
													this.props.findAndSetDisplayWiki(item._id);
												} else {
													this.props.gotoPage('/ui/wiki/view', {wiki: item._id});
												}
												this.props.showLeftDrawer(true);
												this.setState({showResults: false});
											}}
										>
											<div className='searchResult'>
												{item.name}
											</div>
										</List.Item>
									</a>
								)}
							>
							</List>
						</div>
					</Col>
					<Col span={4}></Col>
				</Row>
			</div>
		);
	}
}

export default withRouter(SearchBar);
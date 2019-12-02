import React, {Component} from 'react';
import UIActionFactory from "../../redux/actions/uiactionfactory";
import connect from "react-redux/es/connect/connect";
import {Router, withRouter} from "react-router-dom";
import {Col, Row} from "antd";
import FolderView from "./folderview";
import DefaultViewContainer from "../defaultviewcontainer";
import WikiView from "./wikiview";
import WikiEdit from "./wikiedit";
import {Route, Switch} from "react-router";
import WikiActionFactory from "../../redux/actions/wikiactionfactory";

class Wiki extends Component {

	render() {

		if (!this.props.currentWorld) {
			return (
				<DefaultViewContainer/>
			);
		}

		return (
			<Row>
				<Col span={4} className='padding-md'>
					<FolderView
						currentWorld={this.props.currentWorld}
						currentWiki={this.props.currentWiki}
						gotoPage={this.props.gotoPage}
						updateFolder={this.props.updateFolder}
						createFolder={this.props.createFolder}
						deleteFolder={this.props.deleteFolder}
						createWiki={this.props.createWikiPage}
					/>
				</Col>
				<Col span={16}>
					<Router history={this.props.history}>
						<Switch>
							<Route path='/ui/wiki/edit' render={() => {
								return (
									<WikiEdit
										gotoPage={this.props.gotoPage}
										currentWiki={this.props.currentWiki}
										saveWiki={this.props.saveWiki}
										deleteWikiPage={this.props.deleteWikiPage}
										currentWorld={this.props.currentWorld}
										currentMap={this.props.currentMap}
										searchWikis={this.props.searchWikis}
									/>
								);
							}}/>
							<Route path='/ui/wiki/view' render={() => {
								return (
									<WikiView
										gotoPage={this.props.gotoPage}
										currentWiki={this.props.currentWiki}
										currentWorld={this.props.currentWorld}
										allPins={this.props.allPins}
										currentMap={this.props.currentMap}
										searchWikis={this.props.searchWikis}
									/>
								);
							}}/>
						</Switch>
					</Router>
				</Col>
				<Col span={4} className='padding-md'>
				</Col>
			</Row>
		);
	}
}

const mapStateToProps = state => {
	return {
		currentWorld: state.currentWorld,
		currentWiki: state.currentWiki,
		allPins: state.allPins
	}
};

const mapDispatchToProps = dispatch => {
	return {
		gotoPage: (path, params = null, override = false) => {
			dispatch(UIActionFactory.gotoPage(path, params, override));
		},
		saveWiki: (name, type, coverToUpload, mapToUpload, content) => {
			dispatch(WikiActionFactory.saveWiki(name, type, coverToUpload, mapToUpload, content));
		},
		createWikiPage: (name, type, folder) => {
			dispatch(WikiActionFactory.createWiki(name, type, folder));
		},
		updateFolder: (folder) => {
			dispatch(WikiActionFactory.updateFolder(folder));
		},
		createFolder: (folder, parent) => {
			dispatch(WikiActionFactory.createFolder(folder, parent));
		},
		deleteFolder: (folder) => {
			dispatch(WikiActionFactory.deleteFolder(folder));
		},
		deleteWikiPage: (page) => {
			dispatch(WikiActionFactory.deleteWikiPage(page));
		},
		searchWikis: (params, cb) => {
			dispatch(WikiActionFactory.searchWikis(params, cb));
		}
	}
};

const WikiContainer = connect(
	mapStateToProps,
	mapDispatchToProps
)(withRouter(Wiki));

export default WikiContainer;
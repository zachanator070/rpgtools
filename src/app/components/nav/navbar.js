import React from 'react';
import {Button, Col, Divider, Row} from 'antd';
import {Link} from "react-router-dom";
import WorldMenu from "./worldmenu";
import useCurrentUser from "../../hooks/useCurrentUser";
import useCurrentWorld from "../../hooks/useCurrentWorld";
import useCurrentWiki from "../../hooks/useCurrentWiki";
import useLogout from "../../hooks/useLogout";
import LoadingView from "../loadingview";
import useSetLoginModalVisibility from "../../hooks/useSetLoginModalVisibility";
import useSetRegisterModalVisibility from "../../hooks/useSetRegisterModalVisibility";

export default function NavBar() {

	const {currentUser, loading} = useCurrentUser();
	const {currentWorld} = useCurrentWorld();
	const {currentWiki} = useCurrentWiki();
	const {setLoginModalVisibility} = useSetLoginModalVisibility();
	const {setRegisterModalVisibility} = useSetRegisterModalVisibility();

	const {logout} = useLogout();

	if (loading) {
		return <LoadingView/>;
	}

	let currentMap = null;
	let loginOptions = null;

	if (currentUser) {
		loginOptions = (
			<span style={{position: 'absolute', right: '0px'}}>
                <span className='margin-md-right'>Hello {currentUser.username}</span>
                <span>
                    <Button type='primary' onClick={logout}>Logout</Button>
                </span>
            </span>
		);
	} else {
		loginOptions = (
			<div>
				<div className='text-align-right margin-sm-top '>
					<a href='#' className='margin-sm'
					   onClick={async () => await setLoginModalVisibility(true)}>Login</a> or
					<a href='#' onClick={async () => await setRegisterModalVisibility(true)}
					   className='margin-sm'>Register</a>
				</div>
			</div>
		);
	}

	return (
		<div className='shadow-sm padding-sm nav-bar'>
			<Row>
				<Col span={4}>
					<div className='margin-md-left'>
						<WorldMenu currentUser={currentUser}/>
					</div>
				</Col>
				{currentWorld ?
					<>
						<Col span={4}>
							<div className='margin-sm-top'>
								<Divider type='vertical'/>
								<Link to={`ui/world/${currentWorld._id}/map/${
									currentMap ? currentMap.image :
										currentWorld.wikiPage.mapImage ? currentWorld.wikiPage.mapImage._id : null}`}>Map</Link>
								<Divider type='vertical'/>
								<Link
									to={`ui/world/${currentWorld._id}/${currentWiki ? currentWiki._id : currentWorld.wikiPage._id}`}>Wiki</Link>
								<Divider type='vertical'/>
							</div>
						</Col>
						<Col span={10}>
							Search Bar
						</Col>
					</>
					:
					<Col span={14}>
						<></>
					</Col>
				}
				<Col span={6}>
					{loginOptions}
				</Col>
			</Row>
		</div>
	);
};
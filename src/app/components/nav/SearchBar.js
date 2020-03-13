import React, {useEffect, useState} from 'react';
import {Col, Input, List, Row} from "antd";
import {useSearchWikiPages} from "../../hooks/useSearchWikiPages";
import {useHistory} from 'react-router-dom';
import useCurrentWorld from "../../hooks/useCurrentWorld";
import {LoadingView} from "../LoadingView";

export const SearchBar = () => {

	const [showResults, setShowResults] = useState(false);

	const {searchWikiPages, wikis, loading} = useSearchWikiPages();
	const {currentWorld, loading: currentWorldLoading} = useCurrentWorld();

	const history = useHistory();

	const search = async (phrase) => {
		await searchWikiPages(phrase, currentWorld._id);
		setShowResults(true);
	};

	const hideDropdown = (event) => {
		if (!event.target.matches('.searchResult') && !event.target.matches('.ant-input') && !event.target.matches('.ant-list-item-content')) {
			setShowResults(false);
		}
	};

	useEffect(() => {
		window.addEventListener('mousedown', hideDropdown);
		return () => {
			window.removeEventListener('mousedown', hideDropdown);
		}
	});

	if(currentWorldLoading){
		return <LoadingView/>;
	}

	return (
		<div>
			<Row className='text-align-center' style={{paddingLeft: '10%', paddingRight: '10%'}}>
				<Input.Search
					placeholder="input search text"
					onChange={event => search(event.target.value)}
					onSearch={value => search(value)}
					onClick={() => {
						if (wikis.length > 0) {
							setShowResults(true);
						}
					}}
					type='text'
				/>
			</Row>
			<Row>
				<Col span={4}></Col>
				<Col span={16} style={{display: showResults ? null : 'none'}}>
					<div
						style={{position: 'relative', width: '100%'}}
						className='searchResult'
					>
						<List
							bordered
							className='search-results shadow-sm'
							style={{position: 'absolute', width: 'inherit'}}
							dataSource={wikis}
							locale={{emptyText: <div>No results :(</div>}}
							renderItem={item => (
								<a href='#' onClick={() => {
								}}>
									<List.Item
										className='searchResult'
										onClick={() => {
											history.push(`/ui/world/${currentWorld._id}/wiki/${item._id}/view`);
											setShowResults(false);
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
};
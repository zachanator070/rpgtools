import useCurrentWiki from "../../hooks/wiki/useCurrentWiki";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import { LoadingView } from "../LoadingView";
import React, { useEffect, useState } from "react";
import { DownOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { Tree } from "antd";
import { Link } from "react-router-dom";
import { FolderMenu } from "./FolderMenu";
import { useWikisInFolder } from "../../hooks/wiki/useWikisInFolder";
import { useFolders } from "../../hooks/wiki/useFolders";
import { useGetFolderPath } from "../../hooks/wiki/useGetFolderPath";

export const FolderView = () => {
	const { currentWiki, loading: wikiLoading } = useCurrentWiki();
	const { currentWorld, loading: worldLoading } = useCurrentWorld();
	const [expandedKeys, setExpandedKeys] = useState();
	const [treeData, setTreeData] = useState();
	const { fetch: fetchWikis, fetchMore, wikisInFolder } = useWikisInFolder();
	const { folders, foldersLoading } = useFolders();
	const { fetch: fetchFolderPath, data: folderPath } = useGetFolderPath();

	const getFolderTreeData = (folder) => {
		const populatedFolder = folders.find(
			(otherFolder) => otherFolder._id === folder._id
		);
		const data = {
			title: populatedFolder.name,
			key: populatedFolder._id,
			isLeaf: false,
			folder: populatedFolder,
			children: [],
		};
		data.children.push(...populatedFolder.children.map(getFolderTreeData));
		return data;
	};

	const getPageTreeData = (page) => {
		return {
			title: page.name,
			key: page._id,
			isLeaf: true,
		};
	};

	const findTreeNode = (key, currentNode) => {
		if (currentNode.key === key) {
			return currentNode;
		}
		for (let child of currentNode.children) {
			const childResult = findTreeNode(key, child);
			if (childResult) {
				return childResult;
			}
		}
	};

	useEffect(() => {
		if (wikisInFolder) {
			for (let wiki of wikisInFolder.docs) {
				const node = findTreeNode(wiki.folder._id, treeData);
				node.children.push(getPageTreeData(wiki));
			}
			if (wikisInFolder.nextPage) {
				(async () => {
					await fetchMore({ page: wikisInFolder.nextPage });
				})();
			}
		}
	}, [wikisInFolder]);

	useEffect(() => {
		if (expandedKeys) {
			(async () => {
				for (let key of expandedKeys) {
					await fetchWikis({ folderId: key });
				}
			})();
		}
	}, [expandedKeys]);

	useEffect(() => {
		if (folderPath) {
			setExpandedKeys(folderPath.map((folder) => folder._id));
		}
	}, [folderPath]);

	useEffect(() => {
		if (currentWiki && folders && currentWorld) {
			setTreeData([getFolderTreeData(currentWorld.rootFolder)]);
			(async () => {
				await fetchFolderPath({ wikiId: currentWiki._id });
			})();
		}
	}, [currentWiki, folders, currentWorld]);

	if (
		wikiLoading ||
		worldLoading ||
		!expandedKeys ||
		!treeData ||
		foldersLoading
	) {
		return <LoadingView />;
	}

	return (
		<div>
			<span>
				<InfoCircleOutlined className={"margin-md"} /> Right click on folders
				for more options
			</span>
			<Tree
				showLine
				switcherIcon={<DownOutlined />}
				showIcon={true}
				defaultExpandedKeys={expandedKeys}
				titleRender={(node) => {
					if (node.isLeaf) {
						return (
							<Link to={`/ui/world/${currentWorld._id}/wiki/${node.key}/view`}>
								{node.title}
							</Link>
						);
					}
					return <FolderMenu folder={node.folder} />;
				}}
				selectable={false}
				onSelect={(keys, { selected, selectedNodes, node, event }) => {
					console.log(keys);
				}}
				onExpand={(expandedKeys, { expanded, node }) => {
					console.log(node);
				}}
				treeData={treeData}
			/>
		</div>
	);
};

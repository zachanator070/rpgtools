import useCurrentWiki from "../../hooks/wiki/useCurrentWiki";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import {LoadingView} from "../LoadingView";
import React, {useEffect, useState} from "react";
import {DownOutlined, FileTextOutlined, FolderOutlined, InfoCircleOutlined} from '@ant-design/icons';
import {Tree} from 'antd';
import {Link, useHistory} from 'react-router-dom';
import {FolderMenu} from "./FolderMenu";


export const FolderView = () => {
    const {currentWiki} = useCurrentWiki();
    const {currentWorld, loading: worldLoading} = useCurrentWorld();
    const history = useHistory();
    const [renderWiki, setRenderWiki] = useState();
    const [expandedKeys, setExpandedKeys] = useState();
    const [treeData, setTreeData] = useState();

    const getFolderTreeData = (folder) => {
        const populatedFolder = currentWorld.folders.find(otherFolder => otherFolder._id === folder._id);
        const data = {
            title: populatedFolder.name,
            key: populatedFolder._id,
            isLeaf: false,
            folder: populatedFolder,
            children: []
        }
        data.children.push(...populatedFolder.children.map(getFolderTreeData));
        data.children.push(...populatedFolder.pages.map(getPageTreeData));
        return data;
    }

    const getPageTreeData = (page) => {
        return {
            title: page.name,
            key: page._id,
            isLeaf: true,
        }
    }

    const bfs = (folder, target, path) => {
        const currentPath = [...path, folder._id];
        const populatedFolder = currentWorld.folders.find(otherFolder => otherFolder._id === folder._id);
        for(let page of populatedFolder.pages){
            if(page._id === target._id){
                return currentPath;
            }
        }
        for(let child of populatedFolder.children){
            const newPath = bfs(child, target, currentPath);
            if(newPath.length > 0){
                return newPath;
            }
        }
        return [];
    }

    useEffect(() => {
        if(currentWiki && !renderWiki){
            setRenderWiki(currentWiki);
        }
    }, [currentWiki]);

    useEffect(() => {
        if(renderWiki && currentWorld){
            setExpandedKeys(bfs(currentWorld.rootFolder, renderWiki, []));
            setTreeData([getFolderTreeData(currentWorld.rootFolder)]);
        }
    }, [renderWiki, currentWorld]);

    if(!renderWiki || worldLoading || !expandedKeys || !treeData){
        return <LoadingView/>;
    }

    return <div>
        <span><InfoCircleOutlined className={'margin-md'}/> Right click on folders for more options</span>
        <Tree
            showLine
            switcherIcon={<DownOutlined />}
            showIcon={true}
            defaultExpandedKeys={expandedKeys}
            titleRender={(node) => {
                if(node.isLeaf){
                    return <Link to={`/ui/world/${currentWorld._id}/wiki/${node.key}/view`}>{node.title}</Link>
                }
                return <FolderMenu folder={node.folder}/>;
            }}
            selectable={false}
            onSelect={(keys, {selected, selectedNodes, node, event}) => {
                console.log(keys);
            }}
            onExpand={(expandedKeys, {expanded, node}) => {
                console.log(node);
            }}
            treeData={treeData}
        />
    </div>
};
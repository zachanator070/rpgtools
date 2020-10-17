import React from 'react';
import {useWikisInFolder} from "../../hooks/wiki/useWikisInFolder";
import {useFolders} from "../../hooks/wiki/useFolders";
import {LoadingView} from "../LoadingView";
import {useEffect, useState} from "react";
import {DownOutlined, RightOutlined} from "@ant-design/icons";
import {Link} from "react-router-dom";

export const FolderTree = ({folder, initialExpanded, indent=0}) => {
    const {fetch, fetchMore, wikisInFolder, loading: wikisLoading} = useWikisInFolder({folderId: folder._id});
    const {folders, foldersLoading} = useFolders();
    const [expanded, setExpanded] = useState(false);
    const [pages, setPages] = useState([]);

    const getWikiComponent = (wiki) => <div key={wiki._id}><Link to={`/ui/world/${wiki.world._id}/wiki/${wiki._id}/view`}>{wiki.name}</Link></div>;

    useEffect(() => {
        if(initialExpanded && initialExpanded.includes(folder._id)){
            setExpanded(true);
        }
    }, [initialExpanded]);

    useEffect(() => {
        if(wikisInFolder && !wikisLoading){
            setPages([...wikisInFolder.docs.map(getWikiComponent)]);
            (async () => {
                if(wikisInFolder.nextPage){
                    await fetchMore({folderId: folder._id, page: wikisInFolder.nextPage});
                }
            })();
        }

    }, [wikisInFolder, wikisLoading]);

    useEffect(() => {
        if(expanded && !wikisInFolder){
            (async () => {
                await fetch({folderId: folder._id});
            })();
        }
    }, [expanded, wikisInFolder]);

    if(foldersLoading || !folders){
        return <LoadingView/>;
    }

    const arrow = expanded ? <DownOutlined /> : <RightOutlined />;

    const children = folder.children.map(child => <FolderTree key={child._id} indent={indent + 1} folder={folders.find(otherFolder => otherFolder._id === child._id)}/> );

    return <div>
        <a
            href='#'
            onClick={() => setExpanded(!expanded)}
        >
            {wikisLoading ? <LoadingView/> : arrow} {folder.name}
        </a>
        <div
            key={folder._id}
            style={{
                display: 'flex'
            }}
        >
            <div
                style={{
                    width: (indent + 1) * 5
                }}
            />
            <div>
                {expanded && pages}
                {expanded && children}
            </div>
        </div>
    </div>;

};
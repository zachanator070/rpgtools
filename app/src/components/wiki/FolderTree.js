import React from 'react';
import {useWikisInFolder} from "../../hooks/wiki/useWikisInFolder";
import {useFolders} from "../../hooks/wiki/useFolders";
import {LoadingView} from "../LoadingView";
import {useEffect, useState} from "react";
import {DownOutlined, FileTextOutlined, FolderOpenOutlined, FolderOutlined, RightOutlined} from "@ant-design/icons";
import {Link} from "react-router-dom";
import {FolderMenu} from "./FolderMenu";

export const FolderTree = ({folder, initialExpanded, indent=0}) => {
    const {fetch, fetchMore, wikisInFolder, loading: wikisLoading, refetch} = useWikisInFolder({folderId: folder._id});
    const {folders, foldersLoading} = useFolders();
    const [expanded, setExpanded] = useState(false);
    const [pages, setPages] = useState([]);
    const [animateArrow, setAnimateArrow] = useState(false)

    const getWikiComponent = (wiki) => <div key={wiki._id}>
        <Link
            style={{
                color: 'rgba(0, 0, 0, 0.85)',
                textDecoration: 'none'
            }}
            to={`/ui/world/${wiki.world._id}/wiki/${wiki._id}/view`}
        >
            <FileTextOutlined style={{
                marginRight: '5px'
            }}/>
            {wiki.name}
        </Link>
    </div>;

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
        return <div><LoadingView/></div>;
    }

    const arrowClass = animateArrow ?
            expanded ? 'arrow-rotate' : 'arrow-rotate-back'
        : null;
    const arrow = <DownOutlined style={{
        animation: arrowClass && `${arrowClass} .5s`,
        transform: !expanded && 'rotate(-90deg)'
    }}/>
    const folderIcon = expanded ? <FolderOpenOutlined /> : <FolderOutlined />;

    const children = folder.children.map(child => <FolderTree key={child._id} indent={indent + 1} folder={folders.find(otherFolder => otherFolder._id === child._id)}/> );

    return <div>
        <div
            style={{
                cursor: 'pointer'
            }}
            onClick={(event) => {
                setExpanded(!expanded)
                setAnimateArrow(true);
            }}
        >
            <FolderMenu
                folder={folder}
                refetchWikis={refetch}
            >
                {arrow} {folderIcon} {folder.name}
            </FolderMenu>

        </div>
        {expanded && <>
            {wikisLoading ? <LoadingView/> :
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
                        {pages}
                        {children}
                    </div>
                </div>
            }
        </>}
    </div>;

};
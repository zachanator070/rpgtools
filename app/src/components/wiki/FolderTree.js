import React, {useRef} from 'react';
import {useWikisInFolder} from "../../hooks/wiki/useWikisInFolder";
import {useFolders} from "../../hooks/wiki/useFolders";
import {LoadingView} from "../LoadingView";
import {useEffect, useState} from "react";
import {DownOutlined, FileTextOutlined, FolderOpenOutlined, FolderOutlined, RightOutlined} from "@ant-design/icons";
import {Link} from "react-router-dom";
import {FolderMenu} from "./FolderMenu";
import {useParams} from 'react-router-dom';
import {useGetFolderPath} from "../../hooks/wiki/useGetFolderPath";

export const FolderTree = ({folder, initialExpanded, indent=0}) => {
    const params = useParams();
    const {fetchMore, wikisInFolder, loading: wikisLoading, refetch: refetchWikis} = useWikisInFolder({folderId: folder._id});
    const {folders, loading: foldersLoading, refetch: refetchFolders} = useFolders({worldId: params.world_id});
    const {getFolderPath, loading: folderPathLoading} = useGetFolderPath({wikiId: params.wiki_id});
    const [expanded, setExpanded] = useState(false);
    const [pages, setPages] = useState([]);
    const [animateArrow, setAnimateArrow] = useState(false);
    const isMounted = useRef(false);

    useEffect(() => {
        if(getFolderPath){
            setExpanded(expanded || getFolderPath.find(otherFolder => otherFolder._id === folder._id));
        }
    }, [getFolderPath])

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
        isMounted.current = true;
        if(wikisInFolder && !wikisLoading && isMounted.current && isMounted.current){
            setPages([...wikisInFolder.docs.map(getWikiComponent)]);
            (async () => {
                if(wikisInFolder.nextPage && isMounted.current){
                    await fetchMore({folderId: folder._id, page: wikisInFolder.nextPage});
                }
            })();
        }
        return () => isMounted.current = false;
    }, [wikisInFolder, wikisLoading]);

    if(foldersLoading){
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

    const childrenFolders = folder.children.map(child => folders.find(otherFolder => otherFolder._id === child._id));
    // race condition where we rerender before folders have been passed to this component correctly
    if(childrenFolders.filter(child => child === undefined).length > 0){
        return <LoadingView/>;
    }
    const childrenComponents = childrenFolders.map(child => <FolderTree key={child._id} indent={indent + 1} folder={child}/> );

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
                refetchFolders={refetchFolders}
                refetchWikis={refetchWikis}
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
                        {childrenComponents}
                    </div>
                </div>
            }
        </>}
    </div>;

};
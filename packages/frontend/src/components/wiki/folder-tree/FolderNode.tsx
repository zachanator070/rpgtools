import React, {useContext, useEffect, useState} from 'react';
import FolderMenu from "./FolderMenu.js";
import DownArrowIcon from "../../widgets/icons/DownArrowIcon.js";
import OpenFolderIcon from "../../widgets/icons/OpenFolderIcon.js";
import FolderIcon from "../../widgets/icons/FolderIcon.js";
import WikiList from "./WikiList.js";
import useFolders from "../../../hooks/wiki/useFolders.js";
import LoadingView from "../../LoadingView.js";
import {WikiFolder} from "../../../types.js";
import {WikiFolderTreeExpanded} from "./FolderTree.js";

export default function FolderNode({folderId, indent = 0}: {folderId: string, indent?: number}) {

    const [animateArrow, setAnimateArrow] = useState(false);
    const {expanded, expand, collapse} = useContext(WikiFolderTreeExpanded);
    const [folder, setFolder] = useState<WikiFolder>();
    const {folders, loading: foldersLoading, refetch} = useFolders();

    useEffect(() => {
        if(folders) {
            setFolder(folders.find((folderItem) => folderItem._id === folderId))
        }
    }, [folders]);

    const isExpanded = expanded.includes(folderId);

    const arrowClass = animateArrow
        ? isExpanded
            ? "arrow-rotate"
            : "arrow-rotate-back"
        : null;

    if(foldersLoading || !folder) {
        return <LoadingView/>;
    }

    return <div>
        <div
            style={{
                cursor: "pointer",
            }}
            onClick={(event) => {
                if (event.type === 'click') {
                    if(isExpanded) {
                        collapse(folderId);
                    } else {
                        expand(folderId);
                    }
                    setAnimateArrow(true);
                }
            }}
        >
            <FolderMenu folder={folder} refetch={refetch}>
                <>
                    <DownArrowIcon
                        style={{
                            animation: arrowClass && `${arrowClass} .5s`,
                            transform: !isExpanded && "rotate(-90deg)",
                        }}
                    />
                    <span className={'margin-sm-left margin-sm-right'}>
                        {isExpanded ? <OpenFolderIcon /> : <FolderIcon />}
                    </span>
                    {folder.name}
                </>
            </FolderMenu>
        </div>
        {isExpanded && (
            <>
                <div
                    key={folder._id}
                    style={{
                        display: "flex",
                    }}
                >
                    <div
                        style={{
                            width: (indent + 1) * 5,
                        }}
                    />
                    <div>
                        <WikiList folder={folder}/>
                        {folder.children.map(child => <FolderNode folderId={child._id} indent={indent + 1} key={child._id}/>)}
                    </div>
                </div>
            </>
        )}
    </div>
}
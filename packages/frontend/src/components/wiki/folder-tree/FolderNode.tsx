import React, {useContext, useEffect, useState} from 'react';
import FolderMenu from "../FolderMenu";
import DownArrowIcon from "../../widgets/icons/DownArrowIcon";
import OpenFolderIcon from "../../widgets/icons/OpenFolderIcon";
import FolderIcon from "../../widgets/icons/FolderIcon";
import WikiList from "./WikiList";
import useFolders from "../../../hooks/wiki/useFolders";
import LoadingView from "../../LoadingView";
import {WikiFolder} from "../../../types";
import {WikiFolderTreeExpanded} from "./FolderTree";

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
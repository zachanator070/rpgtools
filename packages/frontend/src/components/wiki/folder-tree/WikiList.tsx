import React from 'react';
import {WikiFolder} from "../../../types";
import {Link} from "react-router-dom";
import FileIcon from "../../widgets/icons/FileIcon";
import useWikisInFolder from "../../../hooks/wiki/useWikisInFolder";
import LoadingView from "../../LoadingView";

export default function WikiList({folder}: {folder: WikiFolder}) {

    const {
        wikisInFolder,
        loading: wikisLoading,
    } = useWikisInFolder({ folderId: folder._id });

    if(wikisLoading) {
        return <LoadingView/>;
    }

    return <>
        {wikisInFolder.docs.map(wiki => <div key={wiki._id}>
            <Link
                style={{
                    color: "rgba(0, 0, 0, 0.85)",
                    textDecoration: "none",
                }}
                to={`/ui/world/${wiki.world._id}/wiki/${wiki._id}/view`}
            >
					<span style={{
                        marginRight: "5px",
                    }}>
						<FileIcon/>
					</span>
                {wiki.name}
            </Link>
        </div>)}
    </>;
}
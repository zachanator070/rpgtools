import React, { useEffect, useState } from "react";
import { WikiFolder } from "../../../types";
import FolderNode from "./FolderNode";
import useGetFolderPath from "../../../hooks/wiki/useGetFolderPath";
import { useParams } from "react-router-dom";

interface FolderTreeProps {
	folder: WikiFolder;
	indent?: number;
}

interface WikiFolderTreeExpandedContext {
	expanded: string[];
	expand: (id: string) => void;
	collapse: (id: string) => void;
}
export const WikiFolderTreeExpanded = React.createContext<WikiFolderTreeExpandedContext>({
	expanded: [],
	expand: () => null,
	collapse: () => null,
});

export default function FolderTree({ folder }: FolderTreeProps) {
	const { wiki_id } = useParams();
	const [expanded, setExpanded] = useState([]);
	const expand = (id: string) => {
		setExpanded([...expanded, id]);
	};
	const collapse = (id: string) => {
		setExpanded([...expanded].filter((otherId) => otherId !== id));
	};
	const { getFolderPath } = useGetFolderPath({ wikiId: wiki_id });

	useEffect(() => {
		if (getFolderPath && expanded.length === 0) {
			setExpanded(getFolderPath.map((pathFolder) => pathFolder._id));
		}
	}, [getFolderPath]);

	return (
		<div>
			<WikiFolderTreeExpanded.Provider value={{ expanded, expand, collapse }}>
				<FolderNode folderId={folder._id} />
			</WikiFolderTreeExpanded.Provider>
		</div>
	);
}

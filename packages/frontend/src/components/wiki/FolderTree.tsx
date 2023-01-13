import React from "react";
import useWikisInFolder from "../../hooks/wiki/useWikisInFolder";
import useFolders from "../../hooks/wiki/useFolders";
import LoadingView from "../LoadingView";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FolderMenu from "./FolderMenu";
import { useParams } from "react-router-dom";
import useGetFolderPath from "../../hooks/wiki/useGetFolderPath";
import {WikiFolder} from "../../types";
import DownArrowIcon from "../widgets/icons/DownArrowIcon";
import FolderIcon from "../widgets/icons/FolderIcon";
import OpenFolderIcon from "../widgets/icons/OpenFolderIcon";
import FileIcon from "../widgets/icons/FileIcon";

interface FolderTreeProps {
	folder: WikiFolder;
	initialExpanded?: string[];
	indent?: number;
	refetch: () => Promise<void>;
}

export default function FolderTree({ folder, initialExpanded, indent = 0, refetch }: FolderTreeProps){
	const params = useParams();
	const {
		wikisInFolder,
		loading: wikisLoading,
	} = useWikisInFolder({ folderId: folder._id });
	const {
		folders,
		loading: foldersLoading,
	} = useFolders({ worldId: params.world_id });
	const { getFolderPath, loading: folderPathLoading } = useGetFolderPath({
		wikiId: params.wiki_id,
	});
	const [expanded, setExpanded] = useState(false);
	const [pages, setPages] = useState([]);
	const [animateArrow, setAnimateArrow] = useState(false);

	useEffect(() => {
		if (getFolderPath) {
			setExpanded(
				expanded ||
					getFolderPath.find((otherFolder) => otherFolder._id === folder._id) != null
			);
		}
	}, [getFolderPath]);

	const getWikiComponent = (wiki) => {
		if(!wiki._id) {
			return <LoadingView/>;
		}
		return (
			<div key={wiki._id}>
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
			</div>
		)
	};

	useEffect(() => {
		if (initialExpanded && initialExpanded.includes(folder._id)) {
			setExpanded(true);
		}
	}, [initialExpanded]);

	useEffect(() => {
		if (wikisInFolder) {
			setPages([...wikisInFolder.docs].map(getWikiComponent));
		}
	}, [wikisInFolder]);

	if (foldersLoading) {
		return (
			<div>
				<LoadingView />
			</div>
		);
	}

	const arrowClass = animateArrow
		? expanded
			? "arrow-rotate"
			: "arrow-rotate-back"
		: null;
	const arrow = (
		<DownArrowIcon
			style={{
				animation: arrowClass && `${arrowClass} .5s`,
				transform: !expanded && "rotate(-90deg)",
			}}
		/>
	);
	const folderIcon = expanded ? <OpenFolderIcon /> : <FolderIcon />;

	const childrenFolders = folder.children.map((child) =>
		folders.find((otherFolder) => otherFolder._id === child._id)
	).sort((a,b) => a.name < b.name ? -1 : 1);
	// race condition where we rerender before folders have been passed to this component correctly
	if (childrenFolders.filter((child) => child === undefined).length > 0) {
		return <LoadingView />;
	}
	const childrenComponents = childrenFolders.map((child) => (
		<FolderTree key={child._id} indent={indent + 1} folder={child} refetch={refetch}/>
	));

	return (
		<div>
			<div
				style={{
					cursor: "pointer",
				}}
				onClick={(event) => {
					setExpanded(!expanded);
					setAnimateArrow(true);
				}}
			>
				<FolderMenu folder={folder} refetch={refetch}>
					<>
						{arrow} {folderIcon} {folder.name}
					</>
				</FolderMenu>
			</div>
			{expanded && (
				<>
					{wikisLoading ? (
						<LoadingView />
					) : (
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
								{pages}
								{childrenComponents}
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
};

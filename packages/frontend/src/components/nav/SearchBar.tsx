import React, {CSSProperties} from "react";
import { useNavigate } from "react-router-dom";
import useCurrentWorld from "../../hooks/world/useCurrentWorld.js";
import LoadingView from "../LoadingView.js";
import SelectWiki from "../select/SelectWiki.js";

export default function SearchBar({style}: {style?: CSSProperties}) {
	const navigate = useNavigate();
	const { currentWorld, loading } = useCurrentWorld();
	if (loading) {
		return <LoadingView />;
	}
	return (
		<>
			<SelectWiki
				style={style}
				onChange={async (wiki) => {
					navigate(`/ui/world/${currentWorld._id}/wiki/${wiki._id}/view`);
				}}
			/>
		</>
	);
};

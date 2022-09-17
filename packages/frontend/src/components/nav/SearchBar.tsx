import React from "react";
import { useNavigate } from "react-router-dom";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import LoadingView from "../LoadingView";
import SelectWiki from "../select/SelectWiki";

export default function SearchBar() {
	const navigate = useNavigate();
	const { currentWorld, loading } = useCurrentWorld();
	if (loading) {
		return <LoadingView />;
	}
	return (
		<>
			<SelectWiki
				style={{ width: "100%" }}
				onChange={async (wiki) => {
					navigate(`/ui/world/${currentWorld._id}/wiki/${wiki._id}/view`);
				}}
			/>
		</>
	);
};

import React from "react";
import { useHistory } from "react-router-dom";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import { LoadingView } from "../LoadingView";
import { SelectWiki } from "../select/SelectWiki";

export const SearchBarV2 = () => {
	const history = useHistory();
	const { currentWorld, loading } = useCurrentWorld();
	if (loading) {
		return <LoadingView />;
	}
	return (
		<>
			<SelectWiki
				style={{ width: "100%" }}
				onChange={(wiki) => {
					history.push(`/ui/world/${currentWorld._id}/wiki/${wiki._id}/view`);
				}}
			/>
		</>
	);
};

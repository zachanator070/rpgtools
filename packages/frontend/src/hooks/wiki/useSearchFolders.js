import useCurrentWorld from "../world/useCurrentWorld";
import { useState } from "react";

export const useSearchFolders = () => {
	const { currentWorld, loading } = useCurrentWorld();
	const [filter, setFilter] = useState({ name: "" });

	return {
		searchFolders: async (name) => {
			await setFilter({ name });
		},
		folders: currentWorld
			? currentWorld.folders.filter((folder) =>
					folder.name.toLowerCase().includes(filter.name.toLowerCase())
			  )
			: [],
		loading,
	};
};

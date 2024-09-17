import { useState } from "react";
import useGetModels from "./useGetModels";
import {Model} from "../../types";

interface SearchModelsResult {
	searchModels: (name: string) => Promise<void>;
	models: Model[];
	loading: boolean;
}

export default function useSearchModels(): SearchModelsResult {
	const { models, loading } = useGetModels();
	const [filter, setFilter] = useState({ name: "" });

	return {
		searchModels: async (name) => {
			await setFilter({ name });
		},
		models: models
			? models.filter((model) =>
					model.name.toLowerCase().includes(filter.name.toLowerCase())
			  )
			: [],
		loading,
	};
};

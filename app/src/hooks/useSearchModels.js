import {useState} from "react";
import {useGetModels} from "./useGetModels";

export const useSearchModels = () => {
	const {models, loading} = useGetModels();
	const [filter, setFilter] = useState({name: ''});

	return {
		searchModels: async (name) => {
			await setFilter({name});
		},
		models: models ? models.filter(model => model.name.toLowerCase().includes(filter.name.toLowerCase())) : [],
		loading,
	}
};
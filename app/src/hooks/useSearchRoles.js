import useCurrentWorld from "./useCurrentWorld";
import {useState} from "react";

export const useSearchRoles = () => {
	const {currentWorld, loading} = useCurrentWorld();
	const [filter, setFilter] = useState({name: ''});

	return {
		searchRoles: async (name) => {
			await setFilter({name});
		},
		roles: currentWorld ? currentWorld.roles.filter(role => role.name.includes(filter.name)) : [],
		loading,
	}
};
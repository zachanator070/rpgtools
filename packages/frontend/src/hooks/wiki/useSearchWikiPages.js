import useCurrentWorld from "../world/useCurrentWorld";
import {useEffect, useState} from "react";
import {ARTICLE} from "@rpgtools/common/src/type-constants";

export const useSearchWikiPages = () => {
	const {currentWorld, loading} = useCurrentWorld();
	const [allWikis, setAllWikis] = useState([]);
	const [filter, setFilter] = useState({name: null, types: null});
	useEffect(() => {
		(async () => {
			if(currentWorld){
				let newWikis = [];
				for(let folder of currentWorld.folders){
					newWikis = newWikis.concat(folder.pages);
				}
				await setAllWikis(newWikis);
			}
		})();
	},[currentWorld]);

	const getWikis = (name, types) => name ? allWikis.filter(wiki => wiki.name.toLowerCase().includes(name.toLowerCase()) && (types === null || types.includes(wiki.type))) : []

	return {
		searchWikiPages: async (name, types = null) => {
			await setFilter({name, types});
			return getWikis(name, types);
		},
		loading,
		wikis: getWikis(filter.name, filter.types),
	}
};
import useCurrentWorld from "../world/useCurrentWorld";
import {useEffect, useState} from "react";
import {ARTICLE} from "../../../../common/src/type-constants";

export const useSearchWikiPages = () => {
	const {currentWorld, loading} = useCurrentWorld();
	const [allWikis, setAllWikis] = useState([]);
	const [filter, setFilter] = useState({name: null, type: null});
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

	const getWikis = (name, type) => name ? allWikis.filter(wiki => wiki.name.toLowerCase().includes(name.toLowerCase()) && (type === null || wiki.type === type)) : []

	return {
		searchWikiPages: async (name, type = null) => {
			await setFilter({name, type});
			return getWikis(name, type);
		},
		loading,
		wikis: getWikis(filter.name, filter.type),
	}
};
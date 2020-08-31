import useCurrentWorld from "./useCurrentWorld";
import {useEffect, useState} from "react";
import {ARTICLE} from "../../../common/src/type-constants";

export const useSearchWikiPages = () => {
	const {currentWorld, loading} = useCurrentWorld();
	const [allWikis, setAllWikis] = useState([]);
	const [filter, setFilter] = useState({name: null, type: null});
	useEffect(() => {
		(async () => {
			if(!loading){
				let newWikis = [];
				for(let folder of currentWorld.folders){
					newWikis = newWikis.concat(folder.pages);
				}
				await setAllWikis(newWikis);
			}
		})();
	},[currentWorld]);

	return {
		searchWikiPages: async (name, type = null) => {
			await setFilter({name, type});
		},
		loading,
		wikis: filter.name ? allWikis.filter(wiki => wiki.name.toLowerCase().includes(filter.name.toLowerCase()) && (filter.type === null || wiki.type === filter.type)) : [],
	}
};
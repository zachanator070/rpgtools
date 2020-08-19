import useCurrentWorld from "./useCurrentWorld";
import {useEffect, useState} from "react";
import {ARTICLE} from "../../../common/src/type-constants";

export const useSearchWikiPages = () => {
	const {currentWorld, loading} = useCurrentWorld();
	const [allWikis, setAllWikis] = useState([]);
	const [filter, setFilter] = useState({name: '', type: null});
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
		searchWikiPages: async (name, type) => {
			await setFilter({name, type});
		},
		loading,
		wikis: allWikis.filter(wiki => wiki.name.includes(filter.name) && (filter.type === undefined || wiki.type === filter.type)),
	}
};
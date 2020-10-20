import useCurrentWorld from "../world/useCurrentWorld";

export const useAllWikis = () => {
	const {currentWorld, loading} = useCurrentWorld();
	if(loading){
		return {allWikis: []};
	}
	let allWikis = [];
	for(let folder of currentWorld.folders){
		allWikis = allWikis.concat(folder.pages);
	}
	return {
		allWikis
	};
};
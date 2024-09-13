import React, {useContext} from "react";
import SlidingDrawer from "../widgets/SlidingDrawer.js";
import WikiView from "../wiki/view/WikiView.js";
import MapWikiContext from "../../MapWikiContext.js";
import useGetWiki from "../../hooks/wiki/useGetWiki.js";

export default function MapDrawer() {
	const { mapWikiId, showMapDrawer, setShowMapDrawer } = useContext(MapWikiContext);
	const {wiki, loading} = useGetWiki(mapWikiId);

	return (
		<SlidingDrawer placement={"left"} visible={showMapDrawer} setVisible={setShowMapDrawer} startVisible={false}>
			<WikiView currentWiki={wiki} wikiLoading={loading}/>
		</SlidingDrawer>
	);
};

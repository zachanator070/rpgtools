import React, { useEffect } from "react";
import { SlidingDrawer } from "../SlidingDrawer";
import useGameWiki from "../../hooks/wiki/useGameWiki";
import { WikiContent } from "../wiki/WikiContent";
import { LoadingView } from "../LoadingView";

export const GameWikiDrawer = ({ wikiId }) => {
	const { fetch, wiki, loading } = useGameWiki();

	useEffect(() => {
		if (wikiId) {
			(async () => {
				await fetch({ wikiId });
			})();
		}
	}, [wikiId]);

	if (!wikiId) {
		return <></>;
	}
	return (
		<SlidingDrawer placement={"left"} startVisible={true}>
			{loading ? <LoadingView /> : <WikiContent currentWiki={wiki} />}
		</SlidingDrawer>
	);
};

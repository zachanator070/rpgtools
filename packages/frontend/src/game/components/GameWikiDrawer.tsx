import React, { useEffect } from "react";
import useGameWiki from "../../hooks/wiki/useGameWiki.js";
import SlidingDrawer from "../../components/widgets/SlidingDrawer.js";
import LoadingView from "../../components/LoadingView.js";
import WikiView from "../../components/wiki/view/WikiView.js";

interface GameWikiDrawerProps {
	wikiId: string;
}

export default function GameWikiDrawer({ wikiId }: GameWikiDrawerProps) {
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
			{loading ? <LoadingView /> : <WikiView currentWiki={wiki} wikiLoading={loading}/>}
		</SlidingDrawer>
	);
};

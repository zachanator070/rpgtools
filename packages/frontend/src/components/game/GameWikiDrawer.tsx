import React, { useEffect } from "react";
import SlidingDrawer from "../widgets/SlidingDrawer";
import useGameWiki from "../../hooks/wiki/useGameWiki";
import WikiView from "../wiki/view/WikiView";
import LoadingView from "../LoadingView";

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

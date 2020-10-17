
export const clientResolvers = {
	Mutation: {
		setMapWikiVisibility: (_root, {visibility}, {client, cache}) => {
			cache.writeData({data: {mapWikiVisibility: visibility}});
			return visibility;
		},
		setMapWiki: (_, {mapWikiId}, {client, cache}) => {
			cache.writeData({data: {mapWiki: mapWikiId}});
			return mapWikiId;
		},
	},
};
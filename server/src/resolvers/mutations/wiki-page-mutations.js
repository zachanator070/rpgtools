import {Place} from '../../models/place';

export const wikiPageMutations = {
	updatePlace: async (parent, {placeId, mapImageId}, {currentUser}) => {
		const place = await Place.findById(placeId);
		if(!place){
			throw new Error(`Place ${placeId} does not exist`);
		}

		if(!await place.userCanWrite(currentUser)){
			throw new Error(`You do not have permission to write to this page`);
		}

		place.mapImage = mapImageId;
		await place.save();
		await place.populate('mapImage').execPopulate();
		return place;
	}
};
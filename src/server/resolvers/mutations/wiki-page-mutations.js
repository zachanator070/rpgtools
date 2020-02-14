import {Place} from '../../models/place';
import {Image} from '../../models/image';

export const wikiPageMutations = {
	updatePlace: async (parent, {placeId, mapImageId}, {currentUser}) => {
		const place = await Place.findById(placeId);
		if(!place){
			throw new Error(`Place ${placeId} does not exist`);
		}

		if(!await place.userCanWrite(currentUser)){
			throw new Error(`You do not have permission to write to this page`);
		}

		const mapImage = await Image.findById(mapImageId);
		if(!mapImage){
			throw new Error(`Image ${mapImageId} does not exist`);
		}

		place.mapImage = mapImage;
		await place.save();
		return place;
	}
};
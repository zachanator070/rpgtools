import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import {
	Game,
} from "../../../domain-entities/game";
import mongoose from "mongoose";
import {
GameDocument,
	GameModel,
} from "../models/game";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../../di/injectable-types";
import {ObjectId} from "bson";
import {GameRepository} from "../../repository/game-repository";
import {FilterCondition} from "../../filter-condition";
import GameFactory from "../../../domain-entities/factory/game-factory";

@injectable()
export class MongodbGameRepository
	extends AbstractMongodbRepository<Game, GameDocument>
	implements GameRepository
{
	@inject(INJECTABLE_TYPES.GameFactory)
	entityFactory: GameFactory;

	model: mongoose.Model<any> = GameModel;

	hydrateEmbeddedIds(entity: Game) {
		for (let character of entity.characters) {
			if (!character._id) {
				character._id = (new ObjectId()).toString();
			}
			for (let attribute of character.attributes) {
				if (!attribute._id) {
					attribute._id = (new ObjectId()).toString();
				}
			}
		}

		for(let model of entity.models) {
			if(!model._id) {
				model._id = (new ObjectId()).toString();
			}
		}
	}

	findWithModel(modelId: string): Promise<Game[]> {
		return this.find([new FilterCondition("models", {_id: modelId})])
	}

	findByPlayer(userId: string): Promise<Game[]> {
		return this.find([new FilterCondition("characters.player", userId)]);
	}
}

import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import {
	Character, CharacterAttribute,
	FogStroke,
	Game,
	InGameModel,
	Message,
	PathNode,
	Stroke,
} from "../../../domain-entities/game";
import {
	CharacterAttributeDocument,
	CharacterDocument,
	FogStrokeDocument,
	GameDocument,
	GameFactory,
	GameRepository,
	InGameModelDocument,
	MessageDocument,
	PathNodeDocument,
	StrokeDocument,
} from "../../../types";
import mongoose from "mongoose";
import { GameModel } from "../models/game";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../../di/injectable-types";
import {ObjectId} from "bson";

@injectable()
export class MongodbGameRepository
	extends AbstractMongodbRepository<Game, GameDocument>
	implements GameRepository
{
	@inject(INJECTABLE_TYPES.GameFactory)
	gameFactory: GameFactory;

	model: mongoose.Model<any> = GameModel;

	buildEntity(document: GameDocument): Game {
		return this.gameFactory(
			{
				_id: document._id.toString(),
				passwordHash: document.passwordHash,
				world: document.world.toString(),
				map: document.map ? document.map.toString() : null,
				characters: this.buildCharacters(document.characters),
				strokes: this.buildStrokes(document.strokes),
				fog: this.buildFogStrokes(document.fog),
				messages: this.buildMessages(document.messages),
				models: this.buildModels(document.models),
				host: document.host.toString()
			}
		);
	}

	private buildNodePath(path: PathNodeDocument[]): PathNode[] {
		const nodes: PathNode[] = [];
		for (let document of path) {
			nodes.push(new PathNode(document._id.toString(), document.x, document.y));
		}
		return nodes;
	}

	private buildFogStrokes(fog: FogStrokeDocument[]): FogStroke[] {
		const strokes: FogStroke[] = [];
		for (let fogDocument of fog) {
			strokes.push(
				new FogStroke(
					fogDocument._id.toString(),
					this.buildNodePath(fogDocument.path),
					fogDocument.size,
					fogDocument.type
				)
			);
		}
		return strokes;
	}

	private buildStrokes(documents: StrokeDocument[]): Stroke[] {
		const strokes: Stroke[] = [];
		for (let document of documents) {
			strokes.push(
				new Stroke(
					document._id.toString(),
					this.buildNodePath(document.path),
					document.color,
					document.size,
					document.fill,
					document.type
				)
			);
		}
		return strokes;
	}

	private buildCharacters(documents: CharacterDocument[]): Character[] {
		const characters: Character[] = [];
		for (let document of documents) {
			characters.push(
				new Character(
					document._id.toString(),
					document.name,
					document.player.toString(),
					document.color,
					this.buildCharacterAttributes(document.attributes)
				)
			);
		}
		return characters;
	}

	private buildCharacterAttributes(documents: CharacterAttributeDocument[]): CharacterAttribute[] {
		const attributes: CharacterAttribute[] = [];
		for (let document of documents) {
			attributes.push(
				new CharacterAttribute(
					document._id.toString(),
					document.name,
					document.value,
				)
			);
		}
		return attributes;
	}

	private buildMessages(documents: MessageDocument[]): Message[] {
		const messages: Message[] = [];
		for (let document of documents) {
			messages.push(
				new Message(
					document.sender,
					document.senderUser,
					document.receiver,
					document.receiverUser,
					document.message,
					document.timestamp,
					document._id.toString()
				)
			);
		}
		return messages;
	}

	private buildModels(documents: InGameModelDocument[]): InGameModel[] {
		const models: InGameModel[] = [];
		for (let document of documents) {
			models.push(
				new InGameModel(
					document._id.toString(),
					document.model.toString(),
					document.x,
					document.z,
					document.lookAtX,
					document.lookAtZ,
					document.color,
					document.wiki ? document.wiki.toString() : null
				)
			);
		}
		return models;
	}

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
	}
}

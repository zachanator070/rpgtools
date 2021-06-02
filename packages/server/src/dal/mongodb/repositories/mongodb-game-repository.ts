import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import {
	Character,
	FogStroke,
	Game,
	InGameModel,
	Message,
	PathNode,
	Stroke,
} from "../../../domain-entities/game";
import { DatabaseEntity, DomainEntityFactory, GameRepository } from "../../../types";
import { Model } from "mongoose";
import {
	CharacterDocument,
	FogStrokeDocument,
	GameDocument,
	GameModel,
	InGameModelDocument,
	MessageDocument,
	PathNodeDocument,
	StrokeDocument,
} from "../models/game";
import { injectable } from "inversify";

@injectable()
export class MongodbGameRepository
	extends AbstractMongodbRepository<Game, GameDocument>
	implements GameRepository {
	model: Model<any> = GameModel;

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
					document.str,
					document.dex,
					document.con,
					document.int,
					document.wis,
					document.cha
				)
			);
		}
		return characters;
	}

	private buildMessages(documents: MessageDocument[]): Message[] {
		const messages: Message[] = [];
		for (let document of documents) {
			messages.push(
				new Message(
					document.sender,
					document.receiver,
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
					document.gameModel.toString(),
					document.x,
					document.z,
					document.lookAtX,
					document.lookAtZ,
					document.color,
					document.wiki.toString()
				)
			);
		}
		return models;
	}

	build(entity: GameDocument): Game {
		return new Game(
			entity._id.toString(),
			entity.passwordHash,
			entity.world.toString(),
			entity.map.toString(),
			this.buildCharacters(entity.characters),
			this.buildStrokes(entity.strokes),
			this.buildFogStrokes(entity.fog),
			this.buildMessages(entity.messages),
			this.buildModels(entity.models),
			entity.host.toString()
		);
	}

	buildEntity(document: GameDocument): Game {
		return undefined;
	}
}

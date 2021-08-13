import { container } from "./inversify.config";
import { INJECTABLE_TYPES } from "./injectable-types";
import { ApiServer, MongoDBEntity } from "./types";
import { Schema } from "mongoose";

const server = container.get<ApiServer>(INJECTABLE_TYPES.ApiServer);

(async () => {
	await server.start();
})();

export class PathNodeDocument extends MongoDBEntity {
	public x: number;
	public y: number;
}

export class StrokeDocument extends MongoDBEntity {
	public path: PathNodeDocument[];
	public color: string;
	public size: number;
	public fill: boolean;
	public type: string;
}

export class FogStrokeDocument extends MongoDBEntity {
	public path: PathNodeDocument[];
	public size: number;
	public type: string;
}

export class GameDocument extends MongoDBEntity {
	public passwordHash: string;
	public world: Schema.Types.ObjectId;
	public map: Schema.Types.ObjectId;
	public characters: CharacterDocument[];
	public host: Schema.Types.ObjectId;
	public strokes: StrokeDocument[];
	public fog: FogStrokeDocument[];
	public models: InGameModelDocument[];
	public messages: MessageDocument[];
}

export class CharacterDocument extends MongoDBEntity {
	public name: string;
	public player: Schema.Types.ObjectId;
	public color: string;
	public str: number;
	public dex: number;
	public con: number;
	public int: number;
	public wis: number;
	public cha: number;
}

export class MessageDocument extends MongoDBEntity {
	public sender: string;
	public receiver: string;
	public message: string;
	public timestamp: number;
}

export class InGameModelDocument extends MongoDBEntity {
	public gameModel: Schema.Types.ObjectId;
	public x: number;
	public z: number;
	public lookAtX: number;
	public lookAtZ: number;
	public color: string;
	public wiki: Schema.Types.ObjectId;
}

export class WorldDocument extends MongoDBEntity {
	public name: string;
	public wikiPage: Schema.Types.ObjectId;
	public rootFolder: Schema.Types.ObjectId;
	public roles: Schema.Types.ObjectId[];
	public pins: Schema.Types.ObjectId[];
}

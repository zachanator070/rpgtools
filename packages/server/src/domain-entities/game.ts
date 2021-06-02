import { DomainEntity } from "../types";

export class Game implements DomainEntity {
	public _id: string;
	public passwordHash: string;
	public world: string;
	public map?: string;
	public characters: Character[];
	public strokes: Stroke[];
	public fog: FogStroke[];
	public messages: Message[];
	public models: InGameModel[];
	public host: string;

	constructor(
		id: string,
		passwordHash: string,
		worldId: string,
		mapId: string,
		characters: Character[],
		strokes: Stroke[],
		fog: FogStroke[],
		messages: Message[],
		models: InGameModel[],
		hostId: string
	) {
		this._id = id;
		this.passwordHash = passwordHash;
		this.world = worldId;
		this.map = mapId;
		this.characters = characters;
		this.strokes = strokes;
		this.fog = fog;
		this.messages = messages;
		this.models = models;
		this.host = hostId;
	}
}

export class Character implements DomainEntity {
	public _id: string;
	public name: string;
	public player: string;
	public color: string;
	public strength: number;
	public dexterity: number;
	public constitution: number;
	public intelligence: number;
	public wisdom: number;
	public charisma: number;

	constructor(
		id: string,
		name: string,
		playerId: string,
		color: string,
		strength: number,
		dexterity: number,
		constitution: number,
		intelligence: number,
		wisdom: number,
		charisma: number
	) {
		this._id = id;
		this.name = name;
		this.player = playerId;
		this.color = color;
		this.strength = strength;
		this.dexterity = dexterity;
		this.constitution = constitution;
		this.intelligence = intelligence;
		this.wisdom = wisdom;
		this.charisma = charisma;
	}
}

export class Stroke implements DomainEntity {
	public _id: string;
	public path: PathNode[];
	public color: string;
	public size: number;
	public fill: boolean;
	public type: string;

	constructor(
		id: string,
		path: PathNode[],
		color: string,
		size: number,
		fill: boolean,
		type: string
	) {
		this._id = id;
		this.path = path;
		this.color = color;
		this.size = size;
		this.fill = fill;
		this.type = type;
	}
}

export class FogStroke implements DomainEntity {
	public _id: string;
	public path: PathNode[];
	public size: number;
	public type: string;

	constructor(id: string, path: PathNode[], size: number, type: string) {
		this._id = id;
		this.path = path;
		this.size = size;
		this.type = type;
	}
}

export class PathNode implements DomainEntity {
	public _id: string;
	public x: number;
	public y: number;

	constructor(id: string, x: number, y: number) {
		this._id = id;
		this.x = x;
		this.y = y;
	}
}

export class Message implements DomainEntity {
	public sender: string;
	public receiver: string;
	public message: string;
	public timestamp: string;
	public _id: string;

	constructor(sender: string, receiver: string, message: string, timestamp: string, id: string) {
		this.sender = sender;
		this.receiver = receiver;
		this.message = message;
		this.timestamp = timestamp;
		this._id = id;
	}
}

export class InGameModel implements DomainEntity {
	public _id: string;
	public model: string;
	public x: number;
	public z: number;
	public lookAtX: number;
	public lookAtZ: number;
	public color?: string;
	public wikiId?: string;

	constructor(
		id: string,
		modelId: string,
		x: number,
		z: number,
		lookAtX: number,
		lookAtZ: number,
		color: string,
		wikiId: string
	) {
		this._id = id;
		this.model = modelId;
		this.x = x;
		this.z = z;
		this.lookAtX = lookAtX;
		this.lookAtZ = lookAtZ;
		this.color = color;
		this.wikiId = wikiId;
	}
}

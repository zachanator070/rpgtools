import {DomainEntity, Factory, Repository, RepositoryAccessor, UnitOfWork} from "../types";
import { GameAuthorizationPolicy } from "../security/policy/game-authorization-policy";
import { GAME } from "@rpgtools/common/src/type-constants";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";

@injectable()
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

	authorizationPolicy: GameAuthorizationPolicy;
	factory: Factory<Game>;

	type: string = GAME;

	constructor(@inject(INJECTABLE_TYPES.GameAuthorizationPolicy)
					authorizationPolicy: GameAuthorizationPolicy,
				@inject(INJECTABLE_TYPES.GameFactory)
					factory: Factory<Game>) {
		authorizationPolicy.entity = this;
		this.authorizationPolicy = authorizationPolicy;
		this.factory = factory;
	}

	getRepository(accessor: RepositoryAccessor): Repository<DomainEntity> {
		return accessor.gameRepository;
	}
}

export class Character {
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

	type: string;

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

export class Stroke {

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

export class FogStroke {
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

export class PathNode {
	public _id: string;
	public x: number;
	public y: number;

	type: string;

	constructor(id: string, x: number, y: number) {
		this._id = id;
		this.x = x;
		this.y = y;
	}
}

export class Message {
	public sender: string;
	public receiver: string;
	public message: string;
	public timestamp: number;
	public _id: string;

	type: string;

	constructor(sender: string, receiver: string, message: string, timestamp: number, id: string) {
		this.sender = sender;
		this.receiver = receiver;
		this.message = message;
		this.timestamp = timestamp;
		this._id = id;
	}
}

export class InGameModel {
	public _id: string;
	public model: string;
	public x: number;
	public z: number;
	public lookAtX: number;
	public lookAtZ: number;
	public color: string | null;
	public wiki: string | null;

	type: string;

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
		this.wiki = wikiId;
	}
}

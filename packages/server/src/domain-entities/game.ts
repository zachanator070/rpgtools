import {AclEntry, EntityFactory, PermissionControlledEntity, RepositoryAccessor,} from "../types";
import {GameAuthorizationPolicy} from "../security/policy/game-authorization-policy";
import {GAME} from "@rpgtools/common/src/type-constants";
import {inject, injectable} from "inversify";
import {INJECTABLE_TYPES} from "../di/injectable-types";
import {Repository} from "../dal/repository/repository";
import GameModel from "../dal/sql/models/game-model";

@injectable()
export class Game implements PermissionControlledEntity {
	public _id: string;
	public passwordHash: string;
	public world: string;
	public map?: string;
	public characters: Character[];
	public messages: Message[];
	public models: InGameModel[];
	public host: string;
	public acl: AclEntry[];

	authorizationPolicy: GameAuthorizationPolicy;
	factory: EntityFactory<Game, GameModel>;

	type: string = GAME;

	constructor(@inject(INJECTABLE_TYPES.GameAuthorizationPolicy)
					authorizationPolicy: GameAuthorizationPolicy,
				@inject(INJECTABLE_TYPES.GameFactory)
					factory: EntityFactory<Game, GameModel>) {
		authorizationPolicy.entity = this;
		this.authorizationPolicy = authorizationPolicy;
		this.factory = factory;
	}

	getRepository(accessor: RepositoryAccessor): Repository<Game> {
		return accessor.gameRepository;
	}
}

export class Character {
	public _id: string;
	public name: string;
	public player: string;
	public color: string;
	public attributes: CharacterAttribute[];

	type: string;

	constructor(
		id: string,
		name: string,
		playerId: string,
		color: string,
		attributes: CharacterAttribute[]
	) {
		this._id = id;
		this.name = name;
		this.player = playerId;
		this.color = color;
		this.attributes = attributes;
	}
}

export class CharacterAttribute {
	public _id: string;
	public name: string;
	public value: number;

	constructor(
		_id: string,
		name: string,
		value: number
	) {
		this._id = _id;
		this.name = name;
		this.value = value;
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
	public senderUser: string;
	public receiver: string;
	public receiverUser: string;
	public message: string;
	public timestamp: number;
	public _id: string;

	type: string;

	constructor(sender: string, senderUser: string, receiver: string, receiverUser: string, message: string, timestamp: number, id: string) {
		this.sender = sender;
		this.senderUser = senderUser;
		this.receiver = receiver;
		this.receiverUser = receiverUser;
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

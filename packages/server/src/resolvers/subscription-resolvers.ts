import { withFilter } from "graphql-subscriptions";
import { container } from "../di/inversify";
import {EventPublisher, SessionContext} from "../types";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import {MESSAGE_ALL_RECEIVE} from "../services/game-service";

export const GAME_CHAT_EVENT = "GAME_CHAT_EVENT";
export const ROSTER_CHANGE_EVENT = "PLAYER_JOINED_EVENT";
export const GAME_MAP_CHANGE = "GAME_MAP_CHANGE";
export const GAME_STROKE_EVENT = "GAME_STROKE_EVENT";
export const GAME_MODEL_ADDED = "GAME_MODEL_ADDED";
export const GAME_MODEL_DELETED = "GAME_MODEL_DELETED";
export const GAME_MODEL_POSITIONED = "GAME_MODEL_POSITIONED";
export const GAME_FOG_STROKE_ADDED = "GAME_FOG_STROKE_ADDED";

const getPubSub = () => {
	return container.get<EventPublisher>(INJECTABLE_TYPES.EventPublisher);
};

export const SubscriptionResolvers = {
	gameChat: {
		subscribe: withFilter(
			() => getPubSub().asyncIterator([GAME_CHAT_EVENT]),
			(payload, { gameId }, {securityContext}: SessionContext) => {
				return (
					payload.gameId === gameId &&
					(payload.gameChat.senderUser === securityContext.user._id ||
						payload.gameChat.receiverUser === securityContext.user._id ||
						payload.gameChat.receiverUser === MESSAGE_ALL_RECEIVE)
				);
			}
		),
	},
	gameRosterChange: {
		subscribe: withFilter(
			() => getPubSub().asyncIterator([ROSTER_CHANGE_EVENT]),
			(payload, { gameId }) => {
				return payload.gameRosterChange._id === gameId;
			}
		),
	},
	gameMapChange: {
		subscribe: withFilter(
			() => getPubSub().asyncIterator([GAME_MAP_CHANGE]),
			(payload, { gameId }) => {
				return payload.gameMapChange._id === gameId;
			}
		),
	},
	gameStrokeAdded: {
		subscribe: withFilter(
			() => getPubSub().asyncIterator([GAME_STROKE_EVENT]),
			(payload, { gameId }) => {
				return payload.gameId === gameId;
			}
		),
	},
	gameFogStrokeAdded: {
		subscribe: withFilter(
			() => getPubSub().asyncIterator([GAME_FOG_STROKE_ADDED]),
			(payload, { gameId }) => {
				return payload.gameId === gameId;
			}
		),
	},
	gameModelAdded: {
		subscribe: withFilter(
			() => getPubSub().asyncIterator([GAME_MODEL_ADDED]),
			(payload, { gameId }) => {
				return payload.gameId === gameId;
			}
		),
	},
	gameModelDeleted: {
		subscribe: withFilter(
			() => getPubSub().asyncIterator([GAME_MODEL_DELETED]),
			(payload, { gameId }) => {
				return payload.gameId === gameId;
			}
		),
	},
	gameModelPositioned: {
		subscribe: withFilter(
			() => getPubSub().asyncIterator([GAME_MODEL_POSITIONED]),
			(payload, { gameId }) => {
				return payload.gameId === gameId;
			}
		),
	},
};

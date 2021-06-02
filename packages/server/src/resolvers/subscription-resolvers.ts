import { withFilter } from "apollo-server";
import { pubsub } from "../gql-server";

export const GAME_CHAT_EVENT = "GAME_CHAT_EVENT";
export const ROSTER_CHANGE_EVENT = "PLAYER_JOINED_EVENT";
export const GAME_MAP_CHANGE = "GAME_MAP_CHANGE";
export const GAME_STROKE_EVENT = "GAME_STROKE_EVENT";
export const GAME_MODEL_ADDED = "GAME_MODEL_ADDED";
export const GAME_MODEL_DELETED = "GAME_MODEL_DELETED";
export const GAME_MODEL_POSITIONED = "GAME_MODEL_POSITIONED";
export const GAME_FOG_STROKE_ADDED = "GAME_FOG_STROKE_ADDED";

export const SubscriptionResolvers = {
	gameChat: {
		subscribe: withFilter(
			() => pubsub.asyncIterator([GAME_CHAT_EVENT]),
			(payload, { gameId }, { currentUser }) => {
				return (
					payload.gameId === gameId &&
					(payload.gameChat.sender === currentUser.username ||
						payload.gameChat.receiver === currentUser.username ||
						payload.gameChat.receiver === "all")
				);
			}
		),
	},
	gameRosterChange: {
		subscribe: withFilter(
			() => pubsub.asyncIterator([ROSTER_CHANGE_EVENT]),
			(payload, { gameId }) => {
				return payload.gameRosterChange._id.equals(gameId);
			}
		),
	},
	gameMapChange: {
		subscribe: withFilter(
			() => pubsub.asyncIterator([GAME_MAP_CHANGE]),
			(payload, { gameId }) => {
				return payload.gameMapChange._id.equals(gameId);
			}
		),
	},
	gameStrokeAdded: {
		subscribe: withFilter(
			() => pubsub.asyncIterator([GAME_STROKE_EVENT]),
			(payload, { gameId }) => {
				return payload.gameId === gameId;
			}
		),
	},
	gameFogStrokeAdded: {
		subscribe: withFilter(
			() => pubsub.asyncIterator([GAME_FOG_STROKE_ADDED]),
			(payload, { gameId }) => {
				return payload.gameId === gameId;
			}
		),
	},
	gameModelAdded: {
		subscribe: withFilter(
			() => pubsub.asyncIterator([GAME_MODEL_ADDED]),
			(payload, { gameId }) => {
				return payload.gameId === gameId;
			}
		),
	},
	gameModelDeleted: {
		subscribe: withFilter(
			() => pubsub.asyncIterator([GAME_MODEL_DELETED]),
			(payload, { gameId }) => {
				return payload.gameId === gameId;
			}
		),
	},
	gameModelPositioned: {
		subscribe: withFilter(
			() => pubsub.asyncIterator([GAME_MODEL_POSITIONED]),
			(payload, { gameId }) => {
				return payload.gameId === gameId;
			}
		),
	},
};

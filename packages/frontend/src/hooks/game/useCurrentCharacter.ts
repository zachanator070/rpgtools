import useCurrentGame from "./useCurrentGame.js";
import useCurrentUser from "../authentication/useCurrentUser.js";
import {GameCharacter} from "../../types.js";

export default function useCurrentCharacter() {
	const { currentGame } = useCurrentGame();
	const { currentUser } = useCurrentUser();

	const result: {currentCharacter: GameCharacter} = { currentCharacter: null };
	if (currentGame && currentUser) {
		for (const character of currentGame.characters) {
			if (character.player._id === currentUser._id) {
				result.currentCharacter = character;
				return result;
			}
		}
	}
	return result;
};

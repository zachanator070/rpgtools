import useCurrentGame from "./useCurrentGame";
import useCurrentUser from "../authentication/useCurrentUser";
import {GameCharacter} from "../../types";

export default function useCurrentCharacter() {
	const { currentGame } = useCurrentGame();
	const { currentUser } = useCurrentUser();

	const result: {currentCharacter: GameCharacter} = { currentCharacter: null };
	if (currentGame && currentUser) {
		for (let character of currentGame.characters) {
			if (character.player._id === currentUser._id) {
				result.currentCharacter = character;
				return result;
			}
		}
	}
	return result;
};

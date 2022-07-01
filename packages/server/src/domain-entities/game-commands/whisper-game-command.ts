import {
	AbstractGameCommand,
	GameCommandArg,
	GameCommandArgDefinition,
	GameCommandOption,
	GameCommandOptionDefinition,
} from "./abstract-game-command";
import { Character, Message } from "../game";

export class WhisperGameCommand extends AbstractGameCommand {
	args: GameCommandArgDefinition[] = [
		{
			name: "RECEIVER",
			description: "The player to privately receive the message",
			multiple: false,
			optional: false,
		},
		{
			name: "MESSAGE",
			description: "The message to send",
			multiple: true,
			optional: false,
		},
	];
	command = "/w";
	description = "Whisper private message to another player";
	echoCommand = false;
	options: GameCommandOptionDefinition[];

	characters: Character[];
	constructor(characters: Character[]) {
		super();
		this.characters = characters;
	}

	exec(executor: Character, args: GameCommandArg[], options: GameCommandOption[]): Message[] {
		const receiver = args.find((arg) => arg.name === "RECEIVER").value;
		const message = args.find((arg) => arg.name === "MESSAGE").value;
		const response = this.getDefaultResponse(executor);
		let foundPlayer = false;
		for (let character of this.characters) {
			if (character.name === receiver) {
				foundPlayer = true;
				break;
			}
		}
		if (!foundPlayer) {
			response.message = `Player ${receiver} not in game!`;
			return [response];
		}
		response.sender = executor.name;
		response.receiver = receiver;
		response.message = message;
		return [response];
	}
}

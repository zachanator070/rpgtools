import { Character, Message } from "../game.js";
import { v4 as uuidv4 } from "uuid";
import {MESSAGE_SERVER_USER} from "../../services/game-service.js";

export interface GameCommandArgDefinition {
	name: string;
	description: string;
	multiple: boolean;
	optional: boolean;
}

export interface GameCommandArg {
	name: string;
	value: string;
}

export interface GameCommandOptionDefinition {
	name: string;
	description: string;
	args: GameCommandArgDefinition[];
}

export interface GameCommandOption {
	name: string;
}

export abstract class AbstractGameCommand {
	abstract command: string;
	abstract description: string;
	abstract echoCommand: boolean;
	abstract args: GameCommandArgDefinition[];
	abstract options: GameCommandOptionDefinition[];
	getDefaultResponse = (executor: Character): Message => {
		return new Message(
			MESSAGE_SERVER_USER,
			MESSAGE_SERVER_USER,
			executor.name,
			executor.player,
			`Server error: no response message given!`,
			Date.now(),
			uuidv4()
		);
	};
	formatHelpMessage = () => {
		let usage = `${this.command}`;
		if (this.options.length > 0) {
			usage += " [OPTION]...";
		}
		for (const arg of this.args) {
			if (!arg.optional) {
				usage += ` ${arg.name}`;
			} else {
				usage += ` [${arg.name}]`;
			}
		}
		let message = `${this.command}\n Usage: ${usage} \n Description: ${this.description}`;
		if (this.args.length > 0) {
			message += "\nArguments:";
		}
		for (const arg of this.args) {
			message += `\n${arg.name} - ${arg.description}`;
		}
		if (this.options.length > 0) {
			message += "\nOptions:";
		}
		for (const option of this.options) {
			message += `\n${option.name} ${option.args.map((arg) => arg.name).join(" ")} - ${
				option.description
			}`;
			if (option.args.length > 0) {
				message += `\n\tOption Args:`;
				for (const arg of option.args) {
					message += `\n\t${arg.name} - ${arg.description}`;
				}
			}
		}
		return message;
	};

	abstract exec(
		executor: Character,
		args: GameCommandArg[],
		options: GameCommandOption[]
	): Message[];
}

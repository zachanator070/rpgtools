import {
	AbstractGameCommand,
	GameCommandArg,
	GameCommandArgDefinition,
	GameCommandOption,
	GameCommandOptionDefinition,
} from "./abstract-game-command";
import { Character, Message } from "../game";

export class HelpGameCommand extends AbstractGameCommand {
	args: GameCommandArgDefinition[] = [
		{
			name: "COMMAND",
			description: "Only display the help for this command. Includes the / in the command.",
			optional: true,
			multiple: false,
		},
	];
	command = "/help";
	description = "Displays help message for a command, displays all if none specified";
	echoCommand = true;
	options: GameCommandOptionDefinition[] = [
		{
			name: "-g",
			args: [],
			description: "Broadcast help to all users",
		},
	];
	allCommands: AbstractGameCommand[];
	constructor(allCommands: AbstractGameCommand[]) {
		super();
		this.allCommands = allCommands;
	}

	exec(executor: Character, args: GameCommandArg[], options: GameCommandOption[]): Message[] {
		const response = this.getDefaultResponse(executor);
		if (args.length > 0) {
			const helpCommand = this.allCommands.find((command) => command.command === args[0].value);
			if (helpCommand) {
				response.message = this.formatHelpMessage();
			}
		} else {
			response.message =
				"Available server commands:\n\n" +
				this.allCommands.map((command) => command.formatHelpMessage()).join("\n\n");
		}
		if (options.length > 0) {
			response.receiver = "all";
		}
		return [response];
	}
}

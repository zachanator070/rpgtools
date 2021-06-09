import {
	AbstractGameCommand,
	GameCommandArg,
	GameCommandArgDefinition,
	GameCommandOption,
	GameCommandOptionDefinition,
} from "./abstract-game-command";
import { Character, Message } from "../game";

export class RollGameCommand extends AbstractGameCommand {
	args: GameCommandArgDefinition[] = [
		{
			name: "DICE",
			description:
				"The dice that you wish to roll. Formatted <NUM>d<SIDES> where <NUM> is the number of dice to roll and <SIDES> is the number of sides on each dice",
			multiple: true,
			optional: false,
		},
	];
	command: string = "/roll";
	description: string = "Rolls dice for you. Displays results to all players.";
	echoCommand: boolean = true;
	options: GameCommandOptionDefinition[] = [
		{
			name: "-q",
			description: "Roll quietly; do not broadcast results to all players",
			args: [],
		},
	];

	exec(executor: Character, args: GameCommandArg[], options: GameCommandOption[]): Message[] {
		let response = this.getDefaultResponse(executor);
		const matches = args.find((arg) => arg.name === "DICE").value.match(/(\d+d\d+([+-]\d+)?)+/gm);
		if (matches) {
			const rollResults = [];
			for (let match of matches) {
				const newMatches = match.match(/(?<numDice>\d+)d(?<dice>\d+)(?<modifier>[+-]\d+)?/);
				const numDice = parseInt(newMatches.groups.numDice);
				const dice = parseInt(newMatches.groups.dice);
				const modifier = newMatches.groups.modifier ? parseInt(newMatches.groups.modifier) : 0;
				const roller = options.find((option) => option.name === "-q") ? "You" : executor.name;
				let rollResponse = `${roller} roll${roller === "You" ? "" : "s"} ${match} ...\n`;
				let total = 0;
				const rolls = [];
				for (let i = 0; i < numDice; i++) {
					const result = Math.ceil(Math.random() * dice);
					total += result;
					rolls.push(result);
				}
				total += modifier;
				rollResponse += rolls.join("\n") + "\n";
				rollResponse += `Total: ${rolls.join(" + ")}${
					modifier !== 0 ? " + " + modifier : ""
				} = ${total}`;
				rollResults.push(rollResponse);
			}
			response.message = rollResults.join("\n\n");
		} else {
			response.message = this.formatHelpMessage();
		}
		if (!options.find((option) => option.name === "-q")) {
			response.receiver = "all";
		}
		return [response];
	}
}

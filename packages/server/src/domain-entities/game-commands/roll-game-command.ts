import {
	AbstractGameCommand,
	GameCommandArg,
	GameCommandArgDefinition,
	GameCommandOption,
	GameCommandOptionDefinition,
} from "./abstract-game-command";
import { Character, Message } from "../game";
import {MESSAGE_ALL_RECEIVE} from "../../services/game-service";

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
	command = "/roll";
	description = "Rolls dice for you. Displays results to all players.";
	echoCommand = true;
	options: GameCommandOptionDefinition[] = [
		{
			name: "-q",
			description: "Roll quietly; do not broadcast results to all players",
			args: [],
		},
	];

	exec(executor: Character, args: GameCommandArg[], options: GameCommandOption[]): Message[] {
		let response = this.getDefaultResponse(executor);
		const diceArg = args.find((arg) => arg.name === "DICE");
		const matches = diceArg.value.match(/(\d+d\d+([+-]\d+)?)+/gm);
		if (matches) {
			const rollResults: string[] = [];
			const roller = options.find((option) => option.name === "-q") ? "You" : executor.name;
			let rollSummary = `${roller} roll${roller === "You" ? "" : "s"} ${diceArg.value} ...`;
			rollResults.push(rollSummary);
			let rollTotal = 0;
			for (let match of matches) {
				const newMatches = match.match(/(?<numDice>\d+)d(?<diceType>\d+)(?<modifier>[+-]\d+)?/);
				const numDice = parseInt(newMatches.groups.numDice);
				const diceType = parseInt(newMatches.groups.diceType);
				const modifier = newMatches.groups.modifier ? parseInt(newMatches.groups.modifier) : 0;
				const diceTypeRoll = [];
				for (let i = 0; i < numDice; i++) {
					const result = Math.ceil(Math.random() * diceType);
					rollTotal += result;
					diceTypeRoll.push(result);
				}
				rollTotal += modifier;
				let diceTypeResult = `(${numDice}d${diceType}${newMatches.groups.modifier || ''}): ${diceTypeRoll.join(" + ")}`;
				if (modifier > 0) {
					diceTypeResult += ` + ${modifier}`;
				} else if (modifier < 0) {
					const absValueModifier = Math.abs(modifier);
					diceTypeResult += ` - ${absValueModifier}`;
				}
				rollResults.push(diceTypeResult)
			}
			rollResults.push(`Total: ${rollTotal}`);
			response.message = rollResults.join("\n");
		} else {
			response.message = this.formatHelpMessage();
		}
		if (!options.find((option) => option.name === "-q")) {
			response.receiver = MESSAGE_ALL_RECEIVE;
			response.receiverUser = MESSAGE_ALL_RECEIVE;
		}
		return [response];
	}
}

import React, {Ref, useContext, useEffect, useRef, useState} from "react";
import useGameChatSubscription from "../../hooks/game/useGameChatSubscription.js";
import useGameChat from "../../hooks/game/useGameChat.js";
import useCurrentGame from "../../hooks/game/useCurrentGame.js";
import useCurrentCharacter from "../../hooks/game/useCurrentCharacter.js";
import CommentMessage from "../../components/widgets/CommentMessage.tsx";
import TextInput from "../../components/widgets/input/TextInput.tsx";
import PrimaryButton from "../../components/widgets/PrimaryButton.tsx";
import {ControllerContext} from "./GameContent.tsx";
import {DiceType, LoadedDiceRoll} from "../controller/DiceController.js";
import GameControllerFacade from "../GameControllerFacade.js";
import {GameMessage} from "../../types.js";

export default function GameChat() {
	const { currentGame } = useCurrentGame();
	const { currentCharacter } = useCurrentCharacter();
	const [messages, setMessages] = useState<GameMessage[]>([]);
	const chatInput: Ref<HTMLInputElement> = useRef();
	useGameChatSubscription((gameChatMessage) => {
		const rollResultsRegex = /\w+ rolls (\d+d\d+([+-]\d+)? )+\.\.\.\s(\(\d+d\d+([+-]\d+)?\): \d+( [-+] \d+)*\s)+Total: -?\d+/gm;
		const rollResultsMatches = gameChatMessage.message.match(rollResultsRegex);
		if (gameChatMessage.sender === "Server" && rollResultsMatches) {
			if (gameChatMessage.message.includes(currentCharacter.name)) {
				const expectedDiceRolls: LoadedDiceRoll[] = [];
				for (const line of gameChatMessage.message.split("\n")) {
					const groupingRegex = /\((?<numDice>\d+)d(?<diceType>\d+)(?<modifier>[+-]\d+)?\): (?<results>\d+( [-+] \d+)*)/;
					const groupMatch = line.match(groupingRegex);
					if (groupMatch) {
						const diceType = groupMatch.groups.diceType
						const modifier = groupMatch.groups.modifier;
						const results = groupMatch.groups.results
						const expectedValues = results.split(' + ');
						// remove modifier from results
						if (modifier) {
							if (modifier.includes('+')) {
								expectedValues.pop();
							} else {
								const lastValue = expectedValues.pop().replace(/ .+/, '');
								expectedValues.push(lastValue);
							}
						}
						expectedValues.forEach(value => {
							if (diceType === '100') {
								// d10 is valued at 1-10 so 0 is not a possible value
								const tens = Math.floor(parseInt(value) / 10) || 10;
								const ones = parseInt(value) % 10 || 10;
								expectedDiceRolls.push({
									dice: DiceType.D10,
									expectedValue: tens
								});
								expectedDiceRolls.push({
									dice: DiceType.D10,
									expectedValue: ones
								});
							} else {
								expectedDiceRolls.push({
									dice: DiceType[`D${diceType}` as keyof typeof DiceType],
									expectedValue: parseInt(value)
								});
							}

						});
					}
				}
				if (!gameControllerFacade.isRolling()) {
					// roll dice, then add message to be displayed
					gameControllerFacade.rollLoadedDice(expectedDiceRolls, () => {
						setMessages(messages.concat([gameChatMessage]));
					});
				} else {
					// if rolling is already happening, immediate add message to be displayed
					setMessages(messages.concat([gameChatMessage]));
				}

			} else {
				// allow dice to roll on opponents screen before displaying chat
				setTimeout(() => {
					setMessages(messages.concat([gameChatMessage]));
				}, 3000);
			}
		} else {
			setMessages(messages.concat([gameChatMessage]));
		}
	});
	const { gameChat, loading: chatLoading } = useGameChat();
	const [comment, setComment] = useState<string>();
	const [historyIndex, setHistoryIndex] = useState(-1);
	const gameControllerFacade = useContext<GameControllerFacade>(ControllerContext);

	const scrollChat = () => {
		const element = document.getElementById("chat");
		if (element) {
			element.scrollTop = element.scrollHeight;
		}
	};

	useEffect(() => {
		if (currentGame) {
			setMessages(currentGame.messages);
		}
	}, [currentGame]);

	useEffect(() => {
		scrollChat();
	});

	const submitComment = async () => {
		if (comment) {
			await gameChat({gameId: currentGame._id, message: comment});
			setComment(null);
			chatInput.current.focus();
		}
	};

	const getHistory = (index) => {
		const history = messages
			.filter((message) => message.sender === currentCharacter.name)
			.reverse();
		if (index >= 0 && index < history.length) {
			return history[index].message;
		}
		return "";
	};

	let comments = [<div key={"0"}>No messages</div>];

	if (messages.length > 0) {
		comments = messages.map(({ sender, timestamp, message, receiver }) => {
			const date = new Date(parseInt(timestamp));
			if (receiver !== "Server" && receiver !== "all") {
				sender += ` whispers to ${receiver}`;
			}
			return (
				<CommentMessage
					author={sender}
					content={<div style={{whiteSpace: "pre-line"}}>{message}</div>}
					hours={date.getHours()}
					minutes={date.getMinutes()}
					seconds={date.getSeconds()}
					key={sender+receiver+message+timestamp}
				/>
			);
		})
	}

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				gap: '2em',
				marginTop: '2em',
				marginBottom: '2em'
			}}
		>
			<div
				style={{
					height: '50vh',
					overflowY: "scroll",
					display: "flex",
					flexDirection: "column",
				}}
				id={'chat'}
			>
				{comments}
			</div>
			<TextInput
				innerRef={chatInput}
				disabled={chatLoading}
				onChange={(value) => {
					setComment(value.target.value);
				}}
				onKeyDown={async (key) => {
					const historyItem = getHistory(historyIndex + 1);
					switch (key) {
						case "ArrowUp":
							if (historyItem) {
								setComment(historyItem);
								setHistoryIndex(historyIndex + 1);
							}
							break;
						case "ArrowDown":
							if (historyIndex >= 0) {
								setComment(getHistory(historyIndex - 1));
								setHistoryIndex(historyIndex - 1);
							}
							break;
						case "Enter":
							await submitComment();
							break;
						default:
							setHistoryIndex(-1);
							break;

					}
				}}
				value={comment}
			/>
			<PrimaryButton
				submit={true}
				loading={chatLoading}
				onClick={submitComment}
			>
				Add Comment
			</PrimaryButton>
		</div>
	);
};

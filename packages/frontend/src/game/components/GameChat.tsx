import React, {Ref, useEffect, useRef, useState} from "react";
import useGameChatSubscription from "../../hooks/game/useGameChatSubscription";
import useGameChat from "../../hooks/game/useGameChat";
import useCurrentGame from "../../hooks/game/useCurrentGame";
import useCurrentCharacter from "../../hooks/game/useCurrentCharacter";
import PrimaryButton from "../widgets/PrimaryButton";
import CommentMessage from "../widgets/CommentMessage";
import TextInput from "../widgets/input/TextInput";

export default function GameChat() {
	const { currentGame } = useCurrentGame();
	const { currentCharacter } = useCurrentCharacter();
	const [messages, setMessages] = useState([]);
	const chatInput: Ref<HTMLInputElement> = useRef();
	const { data: gameChatMessage } = useGameChatSubscription();
	const { gameChat, loading: chatLoading } = useGameChat();
	const [comment, setComment] = useState<string>();
	const [historyIndex, setHistoryIndex] = useState(-1);

	const scrollChat = () => {
		const element = document.getElementById("chat");
		if (element) {
			element.scrollTop = element.scrollHeight;
		}
	};

	useEffect(() => {
		(async () => {
			if (currentGame) {
				await setMessages(currentGame.messages);
			}
		})();
	}, [currentGame]);

	useEffect(() => {
		(async () => {
			if (gameChatMessage) {
				await setMessages(messages.concat([gameChatMessage]));
			}
		})();
	}, [gameChatMessage]);

	useEffect(() => {
		scrollChat();
	});

	const submitComment = async () => {
		if (comment) {
			await gameChat({gameId: currentGame._id, message: comment});
			await setComment(null);
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
					content={message}
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
				onChange={async (value) => {
					await setComment(value.target.value);
				}}
				onKeyDown={async (key) => {
					switch (key) {
						case "ArrowUp":
							const historyItem = getHistory(historyIndex + 1);
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

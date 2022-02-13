import React, {Ref, useEffect, useRef, useState} from "react";
import { Button, Collapse, Comment, Form, Input, List } from "antd";
import { useGameChatSubscription } from "../../hooks/game/useGameChatSubscription";
import { useGameChat } from "../../hooks/game/useGameChat";
import useCurrentGame from "../../hooks/game/useCurrentGame";
import { useCurrentCharacter } from "../../hooks/game/useCurrentCharacter";

export const GameChat = () => {
	const { currentGame } = useCurrentGame();
	const { currentCharacter } = useCurrentCharacter();
	const [messages, setMessages] = useState([]);
	const chatInput: Ref<Input> = useRef();
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

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "100%",
			}}
		>
			<List
				style={{
					flex: "1 1",
					overflowY: "scroll",
				}}
				id={"chat"}
				dataSource={messages}
				itemLayout="horizontal"
				locale={{ emptyText: <div>No messages</div> }}
				renderItem={({ sender, timestamp, message, receiver }) => {
					const date = new Date(parseInt(timestamp));
					const hours = date.getHours();
					const minutes = "0" + date.getMinutes();
					const seconds = "0" + date.getSeconds();
					if (receiver !== "Server" && receiver !== "all") {
						sender += ` whispers to ${receiver}`;
					}
					return (
						<Comment
							author={sender}
							content={<p>{message}</p>}
							datetime={`${hours}:${minutes.substr(-2)}:${seconds.substr(-2)}`}
						/>
					);
				}}
			/>
			<Comment
				style={{
					flex: "1 1",
				}}
				content={
					<>
						<Form.Item>
							<Input.TextArea
								ref={chatInput}
								disabled={chatLoading}
								rows={4}
								onChange={async (value) => {
									await setComment(value.target.value);
								}}
								onKeyDown={(e) => {
									if (e.key === "ArrowUp") {
										const historyItem = getHistory(historyIndex + 1);
										if (historyItem) {
											setComment(historyItem);
											setHistoryIndex(historyIndex + 1);
										}
									} else if (e.key === "ArrowDown") {
										if (historyIndex >= 0) {
											setComment(getHistory(historyIndex - 1));
											setHistoryIndex(historyIndex - 1);
										}
									} else {
										setHistoryIndex(-1);
									}
								}}
								value={comment}
								onPressEnter={submitComment}
							/>
						</Form.Item>
						<Form.Item>
							<Button
								htmlType="submit"
								loading={chatLoading}
								onClick={submitComment}
								type="primary"
							>
								Add Comment
							</Button>
						</Form.Item>
					</>
				}
			/>
		</div>
	);
};

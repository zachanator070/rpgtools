import React, { useEffect, useRef, useState } from "react";
import { Button, Collapse, Comment, Form, Input, List } from "antd";
import { useGameChatSubscription } from "../../hooks/game/useGameChatSubscription";
import { useGameChat } from "../../hooks/game/useGameChat";
import useCurrentGame from "../../hooks/game/useCurrentGame";
import { CloseOutlined, CommentOutlined } from "@ant-design/icons";

export const GameChat = () => {
  const { currentGame } = useCurrentGame();
  const [messages, setMessages] = useState([]);
  const chatInput = useRef();
  const { data: gameChatMessage } = useGameChatSubscription();
  const { gameChat, loading: chatLoading } = useGameChat();
  const [comment, setComment] = useState();

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
      await gameChat(currentGame._id, comment);
      await setComment(null);
      chatInput.current.focus();
    }
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

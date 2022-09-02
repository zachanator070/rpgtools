import React from 'react';
import {Comment} from 'antd';
import {WidgetProps} from "./WidgetProps";

interface CommentMessageProps extends WidgetProps {
    author: string;
    content: React.ReactNode;
    hours: number;
    minutes: number;
    seconds: number;
}

export default function CommentMessage({author, content, hours, minutes, seconds}: CommentMessageProps){

    return <Comment
        author={author}
        content={content}
        datetime={`${hours}:${minutes}:${seconds}`}
    />;

}
import React from 'react';
import {Comment} from 'antd';

export default function CommentMessage({author, content, hours, minutes, seconds}: {author: string, content: React.ReactNode, hours: number, minutes: number, seconds: number}){

    return <Comment
        author={author}
        content={<p>{content}</p>}
        datetime={`${hours}:${minutes}:${seconds}`}
    />;

}
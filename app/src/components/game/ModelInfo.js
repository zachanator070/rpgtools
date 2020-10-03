import React, {useState} from 'react';
import {useSetModelColor} from "../../hooks/game/useSetModelColor";
import {Button, Input} from "antd";
import {CloseOutlined} from '@ant-design/icons';

export const ModelInfo = ({visible, setVisible, positionedModel}) => {

    const {setModelColor} = useSetModelColor();
    const [color, setColor] = useState();

    let content = null;

    if(!positionedModel){
        content = <h2>No Model Selected</h2>;
    }
    else {
        content = <>
            <div
                className={'margin-md'}
                style={{
                    position: 'relative',
                    top: '0px',
                    right: '0px'
                }}
            >
                <a onClick={async () => await setVisible(false)}>
                    <CloseOutlined />
                </a>
            </div>
            <h2>{positionedModel.model.name}</h2>
            <div className={'margin-md'}>
                Select Color:
            </div>
            <Input
                type={'color'}
                value={color}
                onChange={async (e) => {
                    const value = e.target.value;
                    await setColor(value);
                }}
            />
            <Button
                className={'margin-md'}
                onClick={async () => {
                    await setModelColor({positionedModelId: positionedModel._id, color: color});
                }}
            >
                Set Color
            </Button>
            <Button
                className={'margin-md'}
                onClick={async () => {
                    await setModelColor({positionedModelId: positionedModel._id, color: null});
                }}
            >
                Clear Color
            </Button>
        </>;
    }

    return <div
        style={{
            display: visible ? 'block': 'none',
            position: 'absolute',
            bottom: '0px',
            left: '50%',
            padding: '10px',
            backgroundColor: 'white'
        }}
    >
        {content}
    </div>;
}
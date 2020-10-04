import React, {useEffect, useState} from 'react';
import {useSetModelColor} from "../../hooks/game/useSetModelColor";
import {Button, Input} from "antd";
import useCurrentGame from "../../hooks/game/useCurrentGame";
import {SelectWiki} from "../select/SelectWiki";
import {useSetPositionedModelWiki} from "../../hooks/game/useSetPositionedModelWiki";
import {useGameModelPositionedSubscription} from "../../hooks/game/useGameModelPosistionedSubscription";

export const ModelInfo = ({renderer, setGameWikiId}) => {

    const {currentGame} = useCurrentGame();
    const [positionedModel, setPositionedModel] = useState();
    const [newWiki, setNewWiki] = useState();
    const [color, setColor] = useState();
    const {setModelColor} = useSetModelColor();
    const {setPositionedModelWiki} = useSetPositionedModelWiki();
    const {gameModelPositioned} = useGameModelPositionedSubscription();

    useEffect(() => {
        if(renderer){
            renderer.selectModelControls.subscribe(async (model) => await setPositionedModel(model));
        }
    }, [renderer]);

    useEffect(() => {
        (async () => {
            if(positionedModel){
                await setColor(positionedModel.color);
            }
        })()
    }, [positionedModel]);

    useEffect(() => {
        if(gameModelPositioned && positionedModel && positionedModel._id === gameModelPositioned._id){
            (async () => {
                await setPositionedModel(gameModelPositioned);
            })();
        }
    }, [gameModelPositioned]);

    let content = null;

    let name = null;
    if(positionedModel){
        name = positionedModel.model.name
        if(positionedModel.wiki){
            name = positionedModel.wiki.name;
        }
    }

    if(!positionedModel){
        content = <h2>No Model Selected</h2>;
    }
    else {
        content = <>
            <h2>{name}</h2>
            {positionedModel.wiki &&
                <div className={'margin-lg'}>
                    <a onClick={async () => await setGameWikiId(positionedModel.wiki._id)}>Show Wiki</a>
                </div>
            }
            { currentGame.canModel && <div className={'margin-md'}>
                <span className={'margin-md-right'}>
                    Set Wiki Page:
                </span>
                <SelectWiki onChange={async (wiki) => await setNewWiki(wiki)} showClear={true}/>
                <span className={'margin-md-left'}>
                    <Button
                        type={'primary'}
                        onClick={async () => await setPositionedModelWiki({positionedModelId: positionedModel._id, wikiId: newWiki ? newWiki._id : null})}
                    >Set Wiki</Button>
                </span>
            </div>
            }
            {
                currentGame.canModel && <>
                    <span className={'margin-md'}>
                        Select Color:
                    </span>
                    <Input
                        type={'color'}
                        value={color}
                        defaultValue={positionedModel.color}
                        style={{
                            width: '100px'
                        }}
                        onChange={async (e) => {
                            const value = e.target.value;
                            await setColor(value);
                        }}
                    />
                    <div>

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
                    </div>
                </>
            }
        </>;
    }

    return <div className={'margin-lg'}>
        {content}
    </div>;
}
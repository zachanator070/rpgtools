import React, { useEffect, useRef, useState } from "react";
import {
  ADD_MODEL_CONTROLS,
  CAMERA_CONTROLS,
  DELETE_CONTROLS,
  FOG_CONTROLS,
  GameRenderer,
  MOVE_MODEL_CONTROLS,
  PAINT_CONTROLS,
  ROTATE_MODEL_CONTROLS,
  SELECT_LOCATION_CONTROLS,
  SELECT_MODEL_CONTROLS,
} from "../../rendering/GameRenderer";
import { Progress, Modal, notification } from "antd";
import useAddStroke from "../../hooks/game/useAddStroke";
import { useGameStrokeSubscription } from "../../hooks/game/useGameStrokeSubscription";
import { GameControlsToolbar } from "./GameControlsToolbar";
import { useGameModelAddedSubscription } from "../../hooks/game/useGameModelAddedSubscription";
import { useSetModelPosition } from "../../hooks/game/useSetModelPosition";
import { useGameModelPositionedSubscription } from "../../hooks/game/useGameModelPosistionedSubscription";
import { useDeletePositionedModel } from "../../hooks/game/useDeletePositionedModel";
import { useGameModelDeletedSubscription } from "../../hooks/game/useGameModelDeletedSubscription";
import { useAddFogStroke } from "../../hooks/game/useAddFogStroke";
import { useGameFogSubscription } from "../../hooks/game/useGameFogSubscription";
import { ControlsContextWindow } from "./ControlsContextWindow";
import { GameChat } from "./GameChat";
import { GameWikiDrawer } from "./GameWikiDrawer";
import { InitiativeTracker } from "./InitiativeTracker";
import { GameDrawer } from "./GameDrawer";

export const GameContent = ({ currentGame }) => {
  const renderCanvas = useRef();
  const [renderer, setRenderer] = useState();
  const [showLoading, setShowLoading] = useState(false);
  const [urlLoading, setUrlLoading] = useState();
  const [loadingProgress, setLoadingProgress] = useState();
  const { addStroke } = useAddStroke();
  const { setModelPosition } = useSetModelPosition();
  const { deletePositionedModel } = useDeletePositionedModel();
  const { addFogStroke } = useAddFogStroke();

  const [gameWikiId, setGameWikiId] = useState();

  const [controlsMode, setControlsMode] = useState(CAMERA_CONTROLS);
  const { data: gameStrokeAdded } = useGameStrokeSubscription();
  const { data: gameModelAdded } = useGameModelAddedSubscription();
  const { data: modelPositioned } = useGameModelPositionedSubscription();
  const { gameModelDeleted } = useGameModelDeletedSubscription();
  const { gameFogStrokeAdded } = useGameFogSubscription();
  const renderParent = useRef();

  useEffect(() => {
    (async () => {
      await setRenderer(
        new GameRenderer(
          renderCanvas.current,
          currentGame.map && currentGame.map.mapImage,
          addStroke,
          async (url, itemsLoaded, totalItems) => {
            if (itemsLoaded / totalItems !== 1) {
              await setShowLoading(true);
            } else {
              await setShowLoading(false);
            }
            await setUrlLoading(url);
            await setLoadingProgress(itemsLoaded / totalItems);
          },
          setModelPosition,
          async (positionedModel) => {
            Modal.confirm({
              title: "Confirm Delete",
              content: (
                <>
                  Are you sure you want to delete the model{" "}
                  {positionedModel.model.name} ?
                </>
              ),
              okText: "Yes",
              cancelText: "No",
              onOk: async () => {
                await deletePositionedModel({
                  gameId: currentGame._id,
                  positionedModelId: positionedModel._id,
                });
              },
              closable: false,
            });
          },
          addFogStroke
        )
      );
    })();
    renderCanvas.current.addEventListener("mouseover", (event) => {
      if ((event.toElement || event.relatedTarget) !== renderCanvas.current) {
        return;
      }
      renderCanvas.current.focus();
    });

    renderCanvas.current.addEventListener("keydown", async ({ code }) => {
      if (
        ![
          "KeyP",
          "KeyC",
          "KeyM",
          "KeyR",
          "KeyX",
          "KeyF",
          "KeyS",
          "KeyA",
          "KeyL",
        ].includes(code)
      ) {
        return;
      }
      switch (code) {
        case "KeyC":
          await setControlsMode(CAMERA_CONTROLS);
          break;
        case "KeyP":
          if (currentGame.canPaint) {
            await setControlsMode(PAINT_CONTROLS);
          }
          break;
        case "KeyM":
          if (currentGame.canModel) {
            await setControlsMode(MOVE_MODEL_CONTROLS);
          }
          break;
        case "KeyR":
          if (currentGame.canModel) {
            await setControlsMode(ROTATE_MODEL_CONTROLS);
          }
          break;
        case "KeyX":
          if (currentGame.canModel) {
            await setControlsMode(DELETE_CONTROLS);
          }
          break;
        case "KeyF":
          if (currentGame.canWriteFog) {
            await setControlsMode(FOG_CONTROLS);
          }
          break;
        case "KeyS":
          await setControlsMode(SELECT_MODEL_CONTROLS);
          break;
        case "KeyA":
          if (currentGame.canModel) {
            await setControlsMode(ADD_MODEL_CONTROLS);
          }
          break;
        case "KeyL":
          await setControlsMode(SELECT_LOCATION_CONTROLS);
          break;
      }
    });
  }, []);

  useEffect(() => {
    if (renderer) {
      renderer.changeControls(controlsMode);
    }
  }, [controlsMode]);

  useEffect(() => {
    if (renderer) {
      renderer.updateModel(modelPositioned);
    }
  }, [modelPositioned]);

  useEffect(() => {
    if (gameModelAdded && renderer) {
      renderer.addModel(gameModelAdded);
    }
  }, [gameModelAdded]);

  useEffect(() => {
    if (gameModelDeleted && renderer) {
      renderer.removeModel(gameModelDeleted);
    }
  }, [gameModelDeleted]);

  useEffect(() => {
    if (gameStrokeAdded && renderer) {
      renderer.paintControls.stroke(gameStrokeAdded);
    }
  }, [gameStrokeAdded]);

  useEffect(() => {
    if (gameFogStrokeAdded && renderer) {
      renderer.fogControls.stroke(gameFogStrokeAdded);
    }
  }, [gameFogStrokeAdded]);

  useEffect(() => {
    (async () => {
      if (!renderer) {
        return;
      }

      if (currentGame && currentGame.map && currentGame.map.mapImage) {
        let needsSetup = false;
        if (renderer.pixelsPerFoot !== currentGame.map.pixelsPerFoot) {
          renderer.pixelsPerFoot = currentGame.map.pixelsPerFoot;
          needsSetup = true;
        }
        if (
          (!renderer.mapImage && currentGame.map.mapImage) ||
          (renderer.mapImage && !currentGame.map.mapImage) ||
          renderer.mapImage._id !== currentGame.map.mapImage._id
        ) {
          renderer.mapImage = currentGame.map.mapImage;
          needsSetup = true;
        }
        if (needsSetup) {
          if (!currentGame.map.mapImage) {
            notification["error"]({
              message: "Map Render Error",
              description: `Location: ${currentGame.map.name} has no map image!`,
            });
          }
          if (!currentGame.map.pixelsPerFoot) {
            notification["error"]({
              message: "Map Render Error",
              description: `Location: ${currentGame.map.name} has no "pixel per foot" value set!`,
            });
          }
          renderer.setupMap();
        }
        if (renderer.paintControls) {
          for (let stroke of currentGame.strokes) {
            renderer.paintControls.stroke(stroke);
          }
        }
        if (renderer.fogControls) {
          for (let fogStroke of currentGame.fog) {
            renderer.fogControls.stroke(fogStroke);
          }
        }
        for (let model of currentGame.models) {
          renderer.addModel(model);
        }
      }
    })();

    const resize = () => {
      if (renderer) {
        renderer.resize(
          renderParent.current.clientWidth,
          renderParent.current.clientHeight
        );
      }
    };

    window.addEventListener("resize", resize);
  }, [currentGame, renderer]);

  return (
    <>
      <Modal visible={showLoading} footer={null} closable={false}>
        <div className={"margin-lg"}>
          Loaded {urlLoading}
          <br />
          <Progress
            strokeColor={{
              from: "#108ee9",
              to: "#87d068",
            }}
            percent={loadingProgress * 100}
            status="active"
            showInfo={false}
          />
        </div>
      </Modal>
      <div
        style={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
        }}
        ref={renderParent}
      >
        <canvas
          ref={renderCanvas}
          style={{
            flexGrow: 1,
            display: "flex",
          }}
        />
        <InitiativeTracker />
        <GameWikiDrawer wikiId={gameWikiId} />
        <GameDrawer
          renderer={renderer}
          controlsMode={controlsMode}
          setGameWikiId={setGameWikiId}
        />
        <GameControlsToolbar
          controlsMode={controlsMode}
          setControlsMode={setControlsMode}
        />
      </div>
    </>
  );
};

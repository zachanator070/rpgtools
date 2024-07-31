import {SelectModelController} from "./controller/SelectModelController";
import {MoveController} from "./controller/MoveController";
import {RotateController} from "./controller/RotateController";
import {BRUSH_FOG, DEFAULT_BRUSH_SIZE, PaintController} from "./controller/PaintController";
import {DeleteController} from "./controller/DeleteController";
import {CameraController} from "./controller/CameraController";
import {FogStroke, Stroke} from "../types";
import {
    CAMERA_CONTROLS,
    DELETE_CONTROLS, DRAW_Y_POSITION, FOG_CONTROLS, FOG_Y_POSITION, GameRenderer, MeshedModel,
    MOVE_MODEL_CONTROLS,
    PAINT_CONTROLS,
    ROTATE_MODEL_CONTROLS, SELECT_MODEL_CONTROLS
} from "./GameRenderer";
import GameData from "./GameData";

export default class GameController {
    private selectModelController: SelectModelController;
    private moveController: MoveController;
    private rotateController: RotateController;
    private paintController: PaintController;
    private deleteController: DeleteController;
    private fogController: PaintController;
    private cameraController: CameraController;
    
    private gameData: GameData;

    public constructor(gameData: GameData) {
        this.gameData = gameData;
        this.setupControls();
    }

    setupControls() {
        this.cameraController = new CameraController(this.gameData);

        this.paintController = new PaintController(
            this.gameData.renderRoot,
            this.gameData.raycaster,
            this.gameData.scene,
            this.gameData.mapMesh,
            { pixelsPerFoot: this.gameData.pixelsPerFoot, mapImage: this.gameData.mapImage },
            async (stroke: Stroke) => await this.renderer.addStroke({
                fill: stroke.fill,
                path: stroke.path,
                size: stroke.size,
                strokeId: stroke._id,
                type: stroke.type,
                color: stroke.color
            }),
            DRAW_Y_POSITION
        );
        if (paintControlsSaveState) {
            this.paintController.loadSaveState(paintControlsSaveState);
        }

        let fogControlsSaveState = null;
        if (this.fogController) {
            fogControlsSaveState = this.fogController.getSaveState();
            this.fogController.tearDown();
        }
        this.fogController = new PaintController(
            this.gameData.renderRoot,
            this.gameData.raycaster,
            this.gameData.scene,
            this.gameData.mapMesh,
            { pixelsPerFoot: this.gameData.pixelsPerFoot, mapImage: this.gameData.mapImage },
            async (fogStroke: FogStroke) => {
                await this.renderer.addFogStroke({
                    path: fogStroke.path,
                    size: fogStroke.size,
                    strokeId: fogStroke._id,
                    type: fogStroke.type
                });
            },
            FOG_Y_POSITION
        );

        if (fogControlsSaveState) {
            this.fogController.loadSaveState(fogControlsSaveState);
        } else {
            // load default state
            this.fogController.setBrushFill(true);
            this.fogController.setBrushColor("#000000");
            this.fogController.setBrushType(BRUSH_FOG);
            this.fogController.setBrushSize(DEFAULT_BRUSH_SIZE);
        }
        this.fogController.setupBrush();

        if (this.selectControls) {
            this.selectControls.tearDown();
        }
        this.selectControls = new SelectControls(
            this.gameData.renderRoot,
            this.gameData.raycaster,
            this.renderer
        );

        if (this.selectModelController) {
            this.selectModelController.tearDown();
        }
        this.selectModelController = new SelectModelController(
            this.gameData.renderRoot,
            this.gameData.camera,
            this.gameData.scene,
            this.selectControls
        );

        if (this.moveController) {
            this.moveController.tearDown();
        }
        this.moveController = new MoveController(
            this.gameData.renderRoot,
            this.gameData.raycaster,
            this.gameData.mapMesh,
            this.selectControls,
            async (meshedModel: MeshedModel) => {
                await this.renderer.setModelPosition({
                    positionedModelId: meshedModel.positionedModel._id,
                    x: meshedModel.positionedModel.x,
                    z: meshedModel.positionedModel.z,
                    lookAtX: meshedModel.positionedModel.lookAtX,
                    lookAtZ: meshedModel.positionedModel.lookAtZ,
                });
            }
        );

        if (this.rotateController) {
            this.rotateController.tearDown();
        }
        this.rotateController = new RotateController(
            this.gameData.renderRoot,
            this.gameData.raycaster,
            this.gameData.mapMesh,
            this.selectControls,
            async (meshedModel: MeshedModel) => {
                await this.renderer.setModelPosition({
                    positionedModelId: meshedModel.positionedModel._id,
                    x: meshedModel.positionedModel.x,
                    z: meshedModel.positionedModel.z,
                    lookAtX: meshedModel.positionedModel.lookAtX,
                    lookAtZ: meshedModel.positionedModel.lookAtZ,
                });
            }
        );

        if (this.deleteController) {
            this.deleteController.tearDown();
        }
        this.deleteController = new DeleteController(
            this.gameData.renderRoot,
            this.selectControls,
            this.renderer.deleteModel
        );

        this.changeControls(this.gameData.currentControls);
    }

    changeControls = (mode: string) => {

        this.gameData.currentControls = mode;

    };
}
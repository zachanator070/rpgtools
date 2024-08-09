import GameState from "../GameState";
import * as THREE from "three";
import {GROUND_Y_POSITION, MAP_Y_POSITION} from "../GameState";
import {DEFAULT_MAP_SIZE} from "./PaintController";
import {Place} from "../../types";
import useNotification from "../../components/widgets/useNotification";


export default class MapController {
    private gameState: GameState;

    public constructor(gameState: GameState) {
        this.gameState = gameState;
        this.setupMap();
    }

    setLocation(newLocation: Place) {
        const {errorNotification} = useNotification();
        let mapNeedsSetup = false;
        if (this.gameState.location?._id !== newLocation?._id) {
            mapNeedsSetup = true;
            this.gameState.location = newLocation;
        }
        if (mapNeedsSetup) {
            if (!newLocation.mapImage) {
                errorNotification({
                    message: "Map Render Error",
                    description: `Location: ${newLocation.name} has no map image!`,
                });
            }
            if (!newLocation.pixelsPerFoot) {
                errorNotification({
                    message: "Map Render Error",
                    description: `Location: ${newLocation.name} has no "pixel per foot" value set!`,
                });
            }
            this.setupMap();
        }
    }

    setupMap() {
        if (!(this.gameState.location?.mapImage && this.gameState.location?.pixelsPerFoot)) {
            return;
        }

        if (this.gameState.mapMesh) {
            this.gameState.scene.remove(this.gameState.mapMesh);
        }

        if (this.gameState.groundMesh) {
            this.gameState.scene.remove(this.gameState.groundMesh);
        }

        const mapHeight =
            this.gameState.location.mapImage && this.gameState.location.pixelsPerFoot
                ? this.gameState.location.mapImage.height / this.gameState.location.pixelsPerFoot
                : DEFAULT_MAP_SIZE;
        const mapWidth =
            this.gameState.location.mapImage && this.gameState.location.pixelsPerFoot
                ? this.gameState.location.mapImage.width / this.gameState.location.pixelsPerFoot
                : DEFAULT_MAP_SIZE;

        this.gameState.mapCanvas = document.createElement("canvas");
        this.gameState.mapCanvas.height = this.gameState.location.mapImage.height;
        this.gameState.mapCanvas.width = this.gameState.location.mapImage.width;

        this.gameState.mapTexture = new THREE.CanvasTexture(this.gameState.mapCanvas);
        // in threejs v155 color space was changed to be more realistic, this fixes the color to be more accurate to original image
        this.gameState.mapTexture.colorSpace = THREE.SRGBColorSpace;

        this.paintMap();

        const mapGeometry = new THREE.PlaneGeometry(mapWidth, mapHeight);
        mapGeometry.rotateX(-Math.PI / 2);
        this.gameState.mapMesh = new THREE.Mesh(
            mapGeometry,
            new THREE.MeshPhongMaterial({ map: this.gameState.mapTexture })
        );

        this.gameState.mapMesh.position.set(0, MAP_Y_POSITION, 0);
        this.gameState.mapMesh.receiveShadow = true;
        this.gameState.scene.add(this.gameState.mapMesh);

        const groundGeometry = new THREE.PlaneGeometry(mapWidth, mapHeight);
        groundGeometry.rotateX(Math.PI / 2);
        this.gameState.groundMesh = new THREE.Mesh(
            groundGeometry,
            new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        this.gameState.groundMesh.position.set(0, GROUND_Y_POSITION, 0);
        this.gameState.scene.add(this.gameState.groundMesh);
    }

    paintMap() {
        const mapContext = this.gameState.mapCanvas.getContext("2d");

        const imagesLoading: Promise<void>[] = [];

        for (let chunk of this.gameState.location.mapImage.chunks) {
            const base_image = new Image();
            base_image.src = `/images/${chunk.fileId}`;
            const imagePromise = new Promise<void>((resolve) => {
                base_image.onload = () => {
                    mapContext.drawImage(base_image, chunk.x * 250, chunk.y * 250);
                    this.gameState.mapTexture.needsUpdate = true;
                    resolve();
                };
            });
            imagesLoading.push(imagePromise);
        }

        Promise.all(imagesLoading).then(() => {
            if (this.gameState.drawGrid) {
                this.paintGrid();
            }
        });

        this.gameState.mapTexture.needsUpdate = true;
    }

    private paintGrid() {
        const squareSize = this.gameState.location.pixelsPerFoot * 5;
        const context = this.gameState.mapCanvas.getContext("2d");
        context.lineWidth = 3;
        context.strokeStyle = "#000000";
        context.beginPath();
        for (let x = 0; x < this.gameState.location.mapImage.width; x += squareSize) {
            context.moveTo(x, 0);
            context.lineTo(x, this.gameState.location.mapImage.height);
        }
        for (let y = 0; y < this.gameState.location.mapImage.height; y += squareSize) {
            context.moveTo(0, y);
            context.lineTo(this.gameState.location.mapImage.width, y);
        }
        context.stroke();

        this.gameState.mapTexture.needsUpdate = true;
    }

    setDrawGrid(drawGrid: boolean) {
        this.gameState.drawGrid = drawGrid;
        if (this.gameState.drawGrid) {
            this.paintGrid();
        } else {
            this.paintMap();
        }
    }
}

import GameState from "../GameState.js";
import * as THREE from "three";
import {GROUND_Y_POSITION, MAP_Y_POSITION} from "../GameState.js";
import {DEFAULT_MAP_SIZE} from "./PaintController.js";
import {Place} from "../../types.js";
import useNotification from "../../components/widgets/useNotification.js";
import {CanvasTexture, Mesh} from "three";


export default class MapController {
    private gameState: GameState;
    private groundMesh: Mesh;
    private mapCanvas: HTMLCanvasElement;
    private mapTexture: CanvasTexture;
    private drawGrid: boolean = false;

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

        if (this.groundMesh) {
            this.gameState.scene.remove(this.groundMesh);
        }

        const mapHeight =
            this.gameState.location.mapImage && this.gameState.location.pixelsPerFoot
                ? this.gameState.location.mapImage.height / this.gameState.location.pixelsPerFoot
                : DEFAULT_MAP_SIZE;
        const mapWidth =
            this.gameState.location.mapImage && this.gameState.location.pixelsPerFoot
                ? this.gameState.location.mapImage.width / this.gameState.location.pixelsPerFoot
                : DEFAULT_MAP_SIZE;

        this.mapCanvas = document.createElement("canvas");
        this.mapCanvas.height = this.gameState.location.mapImage.height;
        this.mapCanvas.width = this.gameState.location.mapImage.width;

        this.mapTexture = new THREE.CanvasTexture(this.mapCanvas);
        // in threejs v155 color space was changed to be more realistic, this fixes the color to be more accurate to original image
        this.mapTexture.colorSpace = THREE.SRGBColorSpace;

        this.paintMap();

        const mapGeometry = new THREE.PlaneGeometry(mapWidth, mapHeight);
        mapGeometry.rotateX(-Math.PI / 2);
        this.gameState.mapMesh = new THREE.Mesh(
            mapGeometry,
            new THREE.MeshPhongMaterial({ map: this.mapTexture })
        );

        this.gameState.mapMesh.position.set(0, MAP_Y_POSITION, 0);
        this.gameState.mapMesh.receiveShadow = true;
        this.gameState.scene.add(this.gameState.mapMesh);

        const groundGeometry = new THREE.PlaneGeometry(mapWidth, mapHeight);
        groundGeometry.rotateX(Math.PI / 2);
        this.groundMesh = new THREE.Mesh(
            groundGeometry,
            new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        this.groundMesh.position.set(0, GROUND_Y_POSITION, 0);
        this.gameState.scene.add(this.groundMesh);
    }

    paintMap() {
        const mapContext = this.mapCanvas.getContext("2d");

        const imagesLoading: Promise<void>[] = [];

        for (const chunk of this.gameState.location.mapImage.chunks) {
            const base_image = new Image();
            base_image.src = `/images/${chunk.fileId}`;
            const imagePromise = new Promise<void>((resolve) => {
                base_image.onload = () => {
                    mapContext.drawImage(base_image, chunk.x * 250, chunk.y * 250);
                    this.mapTexture.needsUpdate = true;
                    resolve();
                };
            });
            imagesLoading.push(imagePromise);
        }

        Promise.all(imagesLoading).then(() => {
            if (this.drawGrid) {
                this.paintGrid();
            }
        });

        this.mapTexture.needsUpdate = true;
    }

    private paintGrid() {
        const squareSize = this.gameState.location.pixelsPerFoot * 5;
        const context = this.mapCanvas.getContext("2d");
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

        this.mapTexture.needsUpdate = true;
    }

    setDrawGrid(drawGrid: boolean) {
        this.drawGrid = drawGrid;
        if (this.drawGrid) {
            this.paintGrid();
        } else {
            this.paintMap();
        }
    }
}

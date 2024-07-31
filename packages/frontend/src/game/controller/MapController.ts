import GameData from "../GameData";
import * as THREE from "three";
import {Image} from "../../types";
import {GROUND_Y_POSITION, MAP_Y_POSITION} from "../GameRenderer";


export default class MapController {
    private gameData: GameData;

    public constructor(gameData: GameData) {
        this.gameData = gameData;
    }

    setupMap() {
        if (!(this.mapImage && this.pixelsPerFoot)) {
            return;
        }

        if (this.mapMesh) {
            this.scene.remove(this.mapMesh);
        }

        if (this.groundMesh) {
            this.scene.remove(this.groundMesh);
        }

        const mapHeight =
            this.mapImage && this.pixelsPerFoot
                ? this.mapImage.height / this.pixelsPerFoot
                : DEFAULT_MAP_SIZE;
        const mapWidth =
            this.mapImage && this.pixelsPerFoot
                ? this.mapImage.width / this.pixelsPerFoot
                : DEFAULT_MAP_SIZE;

        this.mapCanvas = document.createElement("canvas");
        this.mapCanvas.height = this.mapImage.height;
        this.mapCanvas.width = this.mapImage.width;

        this.mapTexture = new THREE.CanvasTexture(this.mapCanvas);
        this.mapTexture.generateMipmaps = false;
        this.mapTexture.wrapS = this.mapTexture.wrapT = THREE.ClampToEdgeWrapping;
        this.mapTexture.minFilter = THREE.LinearFilter;

        this.paintMap();

        const mapGeometry = new THREE.PlaneGeometry(mapWidth, mapHeight);
        mapGeometry.rotateX(-Math.PI / 2);
        this.mapMesh = new THREE.Mesh(
            mapGeometry,
            new THREE.MeshPhongMaterial({ map: this.mapTexture })
        );

        this.mapMesh.position.set(0, MAP_Y_POSITION, 0);
        this.mapMesh.receiveShadow = true;
        this.scene.add(this.mapMesh);

        const groundGeometry = new THREE.PlaneGeometry(mapWidth, mapHeight);
        groundGeometry.rotateX(Math.PI / 2);
        this.groundMesh = new THREE.Mesh(
            groundGeometry,
            new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        this.groundMesh.position.set(0, GROUND_Y_POSITION, 0);
        this.scene.add(this.groundMesh);

        this.setupLight();
    }

    paintMap() {
        const mapContext = this.mapCanvas.getContext("2d");

        const imagesLoading: Promise<void>[] = [];

        for (let chunk of this.mapImage.chunks) {
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
        const squareSize = this.pixelsPerFoot * 5;
        const context = this.mapCanvas.getContext("2d");
        context.lineWidth = 3;
        context.strokeStyle = "#000000";
        context.beginPath();
        for (let x = 0; x < this.mapImage.width; x += squareSize) {
            context.moveTo(x, 0);
            context.lineTo(x, this.mapImage.height);
        }
        for (let y = 0; y < this.mapImage.height; y += squareSize) {
            context.moveTo(0, y);
            context.lineTo(this.mapImage.width, y);
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
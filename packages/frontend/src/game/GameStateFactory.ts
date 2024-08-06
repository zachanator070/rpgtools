import {Game, Image} from "../types";
import {Vector2, Vector3} from "three";
import * as THREE from "three";
import GameState from "./GameState";
import {DEFAULT_MAP_SIZE} from "./controller/PaintController";


export default function GameStateFactory(
    renderRoot: HTMLCanvasElement,
    currentGame: Game,
    mapImage: Image,
    pixelsPerFoot: number
): GameState {
    const gameState = new GameState();
    gameState.renderRoot = renderRoot;
    gameState.currentGame = currentGame;
    gameState.mapImage = mapImage;

    gameState.mouseCoords = new Vector2();

    if(pixelsPerFoot) {
        gameState.pixelsPerFoot = pixelsPerFoot;
    }

    setupRaycaster(gameState);
    setupScene(gameState);
    setupLight(gameState);

    function setupScene(gameState: GameState) {
        let renderHeight = gameState.renderRoot.clientHeight;
        let renderWidth = gameState.renderRoot.clientWidth;

        gameState.scene = new THREE.Scene();
        gameState.scene.background = new THREE.Color(0x656970);

        gameState.scene.add(new THREE.AmbientLight(0xffffff, 1));

        // setup camera
        gameState.camera = new THREE.PerspectiveCamera(
            75,
            renderWidth / renderHeight,
            1,
            700
        );
        let cameraZ = DEFAULT_MAP_SIZE;
        let cameraY = DEFAULT_MAP_SIZE;

        gameState.camera.position.z = cameraZ;
        gameState.camera.position.y = cameraY;

        gameState.camera.lookAt(new Vector3(0, 0, 0));

        // setup renderer
        gameState.renderer = new THREE.WebGLRenderer({
            canvas: gameState.renderRoot,
            antialias: true,
        });
        gameState.renderer.shadowMap.enabled = true;
        gameState.renderer.setSize(renderWidth, renderHeight);
        gameState.renderer.setPixelRatio(window.devicePixelRatio);
    }

    function setupLight(gameState: GameState) {
        if (gameState.light) {
            gameState.scene.remove(gameState.light);
            gameState.scene.remove(gameState.light.target);
        }
        gameState.light = new THREE.DirectionalLight(0xffffff, 0.25);
        gameState.light.position.set(100, 100, 100);
        gameState.light.castShadow = true;
        gameState.light.shadow.camera.near = 0.01;
        gameState.light.shadow.camera.far = 1000;
        const frustrum = 50;
        gameState.light.shadow.camera.left = -frustrum;
        gameState.light.shadow.camera.bottom = -frustrum;
        gameState.light.shadow.camera.right = frustrum;
        gameState.light.shadow.camera.top = frustrum;

        // const helper = new THREE.DirectionalLightHelper( this.light, 5 );
        // this.scene.add( helper );

        gameState.scene.add(gameState.light);
        gameState.scene.add(gameState.light.target);
    }

    function setupSkyBox(gameState: GameState) {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load("/tavern.jpg", (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            gameState.scene.background = texture;
        });
    }

    function setupRaycaster(gameState: GameState) {
        gameState.raycaster = new THREE.Raycaster();

        gameState.renderRoot.addEventListener(
            "mousemove",
            (event) => {
                // calculate mouse position in normalized device coordinates
                // (-1 to +1) for both components

                gameState.mouseCoords.x =
                    (event.offsetX / gameState.renderer.domElement.clientWidth) * 2 - 1;
                gameState.mouseCoords.y =
                    -(event.offsetY / gameState.renderer.domElement.clientHeight) * 2 + 1;
            },
            false
        );
    }
    return gameState;
}
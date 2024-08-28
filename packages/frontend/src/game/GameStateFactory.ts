import {Game, Image} from "../types";
import {Vector2, Vector3} from "three";
import * as THREE from "three";
import GameState from "./GameState";
import {DEFAULT_MAP_SIZE} from "./controller/PaintController";
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";


export default function GameStateFactory(
    renderRoot: HTMLCanvasElement,
    currentGame: Game,
): GameState {
    const gameState = new GameState();
    gameState.renderRoot = renderRoot;
    gameState.currentGame = currentGame;
    gameState.location = currentGame.map;

    gameState.mouseCoords = new Vector2();

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
            45,
            renderWidth / renderHeight,
            .1,
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
        });
        gameState.renderer.shadowMap.enabled = true;
        gameState.renderer.setSize(renderWidth, renderHeight);
        gameState.renderer.setPixelRatio(window.devicePixelRatio);

        gameState.composer = new EffectComposer(gameState.renderer);

        gameState.cameraControls = new OrbitControls(gameState.camera, gameState.renderRoot);
    }

    function setupLight(gameState: GameState) {
        if (gameState.light) {
            gameState.scene.remove(gameState.light);
            gameState.scene.remove(gameState.light.target);
        }
        gameState.light = new THREE.DirectionalLight(0xffffff, 2);
        gameState.light.position.set(100, 100, 100);

        // const helper = new THREE.DirectionalLightHelper( gameState.light, 5 );
        // gameState.scene.add( helper );

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

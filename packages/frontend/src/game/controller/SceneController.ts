import GameState from "../GameState";
import {PositionedModel} from "../../types";
import {GLTF, GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader";
import * as THREE from "three";
import {Mesh, MeshBasicMaterial, MeshStandardMaterial, Vector3} from "three";
import {Object3D} from "three/src/core/Object3D";
import {MeshedModel} from '../GameState';


export default class SceneController {

    private gameData: GameState;
    private loader: THREE.LoadingManager;

    public constructor(gameData: GameState) {
        this.gameData = gameData;
        this.loader = new THREE.LoadingManager();
        this.loader.onProgress = (message: string, current: number, max: number) => {};
        this.loader.onStart = async () => {
        };

        const animate = () => {
            requestAnimationFrame(animate);
            if (this.gameData.mouseCoords) {
                this.gameData.raycaster.setFromCamera(this.gameData.mouseCoords, this.gameData.camera);
            }
            this.gameData.composer.render();
        };
        animate();
    }

    resize = (width: number, height: number) => {
        this.gameData.camera.aspect = width / height;
        this.gameData.camera.updateProjectionMatrix();
        this.gameData.renderer.setSize(width, height);
    };

    addModel(positionedModel: PositionedModel) {
        for (let model of this.gameData.meshedModels) {
            if (model.positionedModel._id === positionedModel._id) {
                return;
            }
        }
        const model = positionedModel.model;
        // push onto cache before loading to prevent race condition from model subscription
        this.gameData.meshedModels.push({
            positionedModel: {...positionedModel},
            mesh: null,
        });

        const extension = model.fileName.split(".").pop();

        const loader =
            extension === "glb"
                ? new GLTFLoader(this.loader)
                : new OBJLoader(this.loader);

        loader.load(
            `/models/${model.fileId}`,
            (loadedModel: (GLTF | THREE.Group)) => {
                const loadedMesh: THREE.Group =
                    extension === "glb" ? (loadedModel as GLTF).scene : loadedModel as THREE.Group;

                // get bounding box and scale to match board size
                const bbox = new THREE.Box3().setFromObject(loadedMesh);
                const depthScale = model.depth / bbox.getSize(new THREE.Vector3()).z;
                const widthScale = model.width / bbox.getSize(new THREE.Vector3()).x;
                const heightScale = model.height / bbox.getSize(new THREE.Vector3()).y;

                loadedMesh.scale.set(widthScale, heightScale, depthScale);
                loadedMesh.position.set(positionedModel.x, 0, positionedModel.z);
                loadedMesh.lookAt(
                    new Vector3(positionedModel.lookAtX, 0, positionedModel.lookAtZ)
                );
                loadedMesh.traverse(function (child) {
                    if (child instanceof THREE.Mesh && child.isMesh) {
                        child.castShadow = true;
                    }
                });
                for (let meshedModel of this.gameData.meshedModels) {
                    if (meshedModel.positionedModel._id === positionedModel._id) {
                        meshedModel.mesh = loadedMesh;
                        if (extension === "obj") {
                            this.setModelColor(meshedModel, "#787878");
                        }
                        const meshedModelClone = {
                            positionedModel: meshedModel.positionedModel,
                            mesh: loadedMesh.clone(),
                        };
                        meshedModelClone.mesh.traverse((node) => {
                            if ((node as Mesh).isMesh) {
                                (node as Mesh).material = ((node as Mesh).material as MeshBasicMaterial).clone();
                            }
                        });
                        this.gameData.originalMeshedModels.push(meshedModelClone);
                        if (meshedModel.positionedModel.color) {
                            this.setModelColor(
                                meshedModel,
                                meshedModel.positionedModel.color
                            );
                        }
                        break;
                    }
                }
                this.gameData.scene.add(loadedMesh);
            },
            undefined,
            (error) => {
                console.error(error);
            }
        );
    }

    removeModel = (positionedModel: PositionedModel) => {
        let meshedModelToRemove = null;
        for (let meshedModel of this.gameData.meshedModels) {
            if (meshedModel.positionedModel._id === positionedModel._id) {
                meshedModelToRemove = meshedModel;
            }
        }
        if (!meshedModelToRemove) {
            console.warn("Could not find meshed model to delete");
            return;
        }
        this.gameData.meshedModels = this.gameData.meshedModels.filter(
            (meshedModel) =>
                meshedModel.positionedModel._id !==
                meshedModelToRemove.positionedModel._id
        );
        this.gameData.scene.remove(meshedModelToRemove.mesh);
    };

    updateModel(positionedModel: PositionedModel) {
        let targetModel = null;
        let targetOriginal = null;
        for (let meshedModel of this.gameData.meshedModels) {
            if (meshedModel.positionedModel._id === positionedModel._id) {
                targetModel = meshedModel;
                break;
            }
        }
        for (let meshedModel of this.gameData.originalMeshedModels) {
            if (meshedModel.positionedModel._id === positionedModel._id) {
                targetOriginal = meshedModel;
                break;
            }
        }
        if (!targetModel || !targetOriginal) {
            console.warn("Model not added!");
            return;
        }

        targetModel.mesh.position.set(positionedModel.x, 0, positionedModel.z);
        targetModel.mesh.lookAt(
            new Vector3(positionedModel.lookAtX, 0, positionedModel.lookAtZ)
        );

        targetOriginal.mesh.position.set(positionedModel.x, 0, positionedModel.z);
        targetOriginal.mesh.lookAt(
            new Vector3(positionedModel.lookAtX, 0, positionedModel.lookAtZ)
        );

        if (targetModel.positionedModel.color !== positionedModel.color) {
            this.setModelColor(targetModel, positionedModel.color);
        }

        targetModel.positionedModel = positionedModel;
    }

    setModelColor = (meshedModel: MeshedModel, color: string) => {
        if (color) {
            meshedModel.mesh.traverse(function (child: Object3D) {
                if ((child as Mesh).isMesh) {
                    ((child as Mesh).material as MeshStandardMaterial).color.setHex(parseInt("0x" + color.substring(1)));
                }
            });
        } else {
            this.gameData.scene.remove(meshedModel.mesh);
            let clonedModel = null;
            for (let model of this.gameData.originalMeshedModels) {
                if (model.positionedModel._id === meshedModel.positionedModel._id) {
                    clonedModel = model;
                }
            }
            if (!clonedModel) {
                console.warn("Could not find original model");
                return;
            }
            meshedModel.mesh = clonedModel.mesh.clone();
            meshedModel.mesh.traverse((node: Object3D) => {
                if ((node as Mesh).isMesh) {
                    (node as Mesh).material = ((node as Mesh).material as MeshBasicMaterial).clone();
                }
            });
            this.gameData.scene.add(meshedModel.mesh);
        }
    };
}

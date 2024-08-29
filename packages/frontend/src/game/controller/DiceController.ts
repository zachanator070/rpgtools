import * as CANNON from 'cannon';
import {PhysicsDie} from "../dice/PhysicsDie";
import {GameController} from "./GameController";
import GameState from "../GameState";
import {D6Die} from "../dice/D6Die";
import {D8Die} from "../dice/D8Die";
import {D10Die} from "../dice/D10Die";
import {D20Dice} from "../dice/D20Die";
import {D4Die} from "../dice/D4Die";

export interface DiceValues {
    dice: PhysicsDie;
    value: number;
    stableCount?: number;
    vectors?: Vector;
}

export interface Vector {
    position: CANNON.Vec3;
    quaternion: CANNON.Quaternion;
    velocity: CANNON.Vec3;
    angularVelocity: CANNON.Vec3;
}

class DiceController implements GameController {
    public diceBodyMaterial: CANNON.Material;
    private floorBodyMaterial: CANNON.Material;
    private barrierBodyMaterial: CANNON.Material;
    private simulating: boolean;
    private gameState: GameState;

    constructor(gameState: GameState) {
        this.gameState = gameState;
        // @ts-ignore
        this.diceBodyMaterial = new CANNON.Material();
        // @ts-ignore
        this.floorBodyMaterial = new CANNON.Material();
        // @ts-ignore
        this.barrierBodyMaterial = new CANNON.Material();

        this.gameState.world.addContactMaterial(
            new CANNON.ContactMaterial(this.floorBodyMaterial, this.diceBodyMaterial, {
                friction: 0.01,
                restitution: 0.5
            })
        );
        this.gameState.world.addContactMaterial(
            new CANNON.ContactMaterial(this.barrierBodyMaterial, this.diceBodyMaterial, {friction: 0, restitution: 1.0})
        );
        this.gameState.world.addContactMaterial(
            new CANNON.ContactMaterial(this.diceBodyMaterial, this.diceBodyMaterial, {friction: 0, restitution: 0.5})
        );

        this.gameState.world.gravity.set(0, -9.82 * 20, 0);
        this.gameState.world.broadphase = new CANNON.NaiveBroadphase();
        this.gameState.world.solver.iterations = 16;
        const floorShape = new CANNON.Plane();
        let floorBody = new CANNON.Body({mass: 0, shape: floorShape, material: this.floorBodyMaterial});
        floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        this.gameState.world.addBody(floorBody);
    }

    prepareValues(diceValues: DiceValues[]) {
        if (this.simulating) throw new Error('Cannot start another throw. Please wait, till the current throw is finished.');

        for (let i = 0; i < diceValues.length; i++) {
            if (diceValues[i].value < 1 || diceValues[i].dice.values < diceValues[i].value) {
                throw new Error('Cannot throw die to value ' + diceValues[i].value + ', because it has only ' + diceValues[i].dice.values + ' sides.');
            }
        }

        this.simulating = true;

        for (let i = 0; i < diceValues.length; i++) {
            diceValues[i].dice.simulationRunning = true;
            diceValues[i].vectors = diceValues[i].dice.getCurrentVectors();
            diceValues[i].stableCount = 0;
        }

        this.gameState.world.step(this.gameState.world.dt);

        let check = () => {
            let allStable = true;
            diceValues.forEach((diceValue) => {
                allStable = allStable && diceValue.dice.isFinished();
            });

            if (allStable) {
                this.gameState.world.removeEventListener('postStep', check);

                for (let i = 0; i < diceValues.length; i++) {
                    diceValues[i].dice.shiftUpperValue(diceValues[i].value);
                    diceValues[i].dice.resetBody();
                    diceValues[i].dice.setVectors(diceValues[i].vectors);
                    diceValues[i].dice.simulationRunning = false;
                }

                this.simulating = false;
            } else {
                this.gameState.world.step(this.gameState.world.dt);
            }
        };

        this.gameState.world.addEventListener('postStep', check);
    }

    addDice = () => {
        this.clearDice();
        const wantedValues = [
            {
                dice: new D4Die({material: this.diceBodyMaterial, backColor: '#ff0000'}),
                value: 1
            },
            {
                dice: new D6Die({material: this.diceBodyMaterial, backColor: '#ff0000'}),
                value: 1
            },
            {
                dice: new D8Die({material: this.diceBodyMaterial, backColor: '#ff0000'}),
                value: 1
            },
            {
                dice: new D10Die({material: this.diceBodyMaterial, backColor: '#ff0000'}),
                value: 1
            },
            {
                dice: new D20Dice({material: this.diceBodyMaterial, backColor: '#ff0000'}),
                value: 1
            }
        ];

        wantedValues.forEach(({dice}, index) => {
            dice.assemble();
            this.gameState.scene.add(dice.getObject().mesh);
            this.gameState.world.addBody(dice.getObject().body);

            // If you want to place the mesh somewhere else, you have to update the body
            dice.getObject().mesh.position.x = 30 * index;
            dice.getObject().mesh.position.y = 100;
            dice.getObject().mesh.position.z = 0;
            dice.getObject().mesh.rotation.x = Math.random() * 2 * Math.PI
            dice.getObject().mesh.rotation.y = Math.random() * 2 * Math.PI
            dice.getObject().mesh.rotation.z = Math.random() * 2 * Math.PI
            dice.updateBodyFromMesh();

            this.gameState.dice.push(dice);
        });


        // Run a simulation, and set final resting top faces to the wanted values
        this.prepareValues(wantedValues);
    }

    clearDice = () => {
        this.gameState.dice.forEach(dice => {
            this.gameState.scene.remove(dice.getObject().mesh);
            this.gameState.world.remove(dice.getObject().body);
        });
        this.gameState.dice = [];
    }

    disable(): void {
    }

    enable(): void {
    }

    tearDown(): void {
    }
}

export default DiceController;

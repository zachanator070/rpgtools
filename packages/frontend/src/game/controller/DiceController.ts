import * as CANNON from 'cannon';
import {PhysicsDie} from "../dice/PhysicsDie";
import {GameController} from "./GameController";
import GameState from "../GameState";
import {D6Die} from "../dice/D6Die";
import {D8Die} from "../dice/D8Die";
import {D10Die} from "../dice/D10Die";
import {D20Die} from "../dice/D20Die";
import {D4Die} from "../dice/D4Die";
import {D12Die} from "../dice/D12Die";

export interface DiceValues {
    dice: PhysicsDie;
    value: number;
    initialDiceState?: DiceState;
}

export interface DiceState {
    position: CANNON.Vec3;
    quaternion: CANNON.Quaternion;
    velocity: CANNON.Vec3;
    angularVelocity: CANNON.Vec3;
}

export enum DiceType {
    D4 = 'D4',
    D6 = 'D6',
    D8 = 'D8',
    D10 = 'D10',
    D12 = 'D12',
    D20 = 'D20',
}

export interface LoadedDiceRoll {
    dice: DiceType;
    expectedValue: number;
}

class DiceController implements GameController {
    public diceBodyMaterial: CANNON.Material;
    private floorBodyMaterial: CANNON.Material;
    private barrierBodyMaterial: CANNON.Material;
    private simulating: boolean;
    private gameState: GameState;
    public rolling: boolean;

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

    rollFinishedCheck = () => {
        let allStable = true;
        this.gameState.dice.forEach((die) => {
            allStable = allStable && die.isFinished();
        });

        if (allStable) {
            this.gameState.world.removeEventListener('postStep', this.rollFinishedCheck);
            this.gameState.notifyRollFinishedCallback();
            this.rolling = false;
        }
    }

    executeRollSim(diceValues: DiceValues[]) {
        if (this.simulating){
            console.warn('Cannot start another throw. Please wait, till the current throw is finished.');
            return;
        }

        for (let i = 0; i < diceValues.length; i++) {
            if (diceValues[i].value < diceValues[i].dice.minValue || diceValues[i].dice.maxValue < diceValues[i].value) {
                throw new Error('Cannot throw die to value ' + diceValues[i].value + ', because it has only ' + diceValues[i].dice.maxValue + ' sides.');
            }
        }

        this.simulating = true;

        for (let i = 0; i < diceValues.length; i++) {
            diceValues[i].dice.simulationRunning = true;
            diceValues[i].initialDiceState = diceValues[i].dice.getCurrentVectors();
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
                    diceValues[i].dice.setDiceState(diceValues[i].initialDiceState);
                    diceValues[i].dice.simulationRunning = false;
                }

                this.simulating = false;
                this.gameState.world.addEventListener('postStep', this.rollFinishedCheck);
            } else {
                this.gameState.world.step(this.gameState.world.dt);
            }
        };

        this.gameState.world.addEventListener('postStep', check);
    }

    genColor = () => {
        let color = '#';
        for (let i = 0; i < 6; i++)
            color += (Math.floor(Math.random() * 16)).toString(16);
        return color;
    };

    rollLoadedDice = (loadedDiceRolls: LoadedDiceRoll[]) => {
        this.clearDice();
        this.rolling = true;
        const wantedValues = [];
        loadedDiceRolls.forEach(roll => {
            let dice;
            const color = this.genColor();
            console.log(color);
            switch (roll.dice) {
                case DiceType.D4:
                    dice = new D4Die({material: this.diceBodyMaterial, backColor: color});
                    break;
                case DiceType.D6:
                    dice = new D6Die({material: this.diceBodyMaterial, backColor: color});
                    break;
                case DiceType.D8:
                    dice = new D8Die({material: this.diceBodyMaterial, backColor: color});
                    break;
                case DiceType.D10:
                    dice = new D10Die({material: this.diceBodyMaterial, backColor: color});
                    break;
                case DiceType.D12:
                    dice = new D12Die({material: this.diceBodyMaterial, backColor: color});
                    break;
                case DiceType.D20:
                    dice = new D20Die({material: this.diceBodyMaterial, backColor: color});
                    break;
            }
            wantedValues.push({dice, value: roll.expectedValue});
        });

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
        this.executeRollSim(wantedValues);
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

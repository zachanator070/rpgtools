import * as CANNON from 'cannon';
import {PhysicsDie} from "../dice/PhysicsDie";
import {GameController} from "./GameController";
import GameState from "../GameState";
import {D6Die} from "../dice/D6Die";

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
    private throwRunning: boolean;
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
        let floorBody = new CANNON.Body({mass: 0, shape: new CANNON.Plane(), material: this.floorBodyMaterial});
        floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        this.gameState.world.addBody(floorBody);
    }

    prepareValues(diceValues: DiceValues[]) {
        if (this.throwRunning) throw new Error('Cannot start another throw. Please wait, till the current throw is finished.');

        for (let i = 0; i < diceValues.length; i++) {
            if (diceValues[i].value < 1 || diceValues[i].dice.values < diceValues[i].value) {
                throw new Error('Cannot throw die to value ' + diceValues[i].value + ', because it has only ' + diceValues[i].dice.values + ' sides.');
            }
        }

        this.throwRunning = true;

        for (let i = 0; i < diceValues.length; i++) {
            diceValues[i].dice.simulationRunning = true;
            diceValues[i].vectors = diceValues[i].dice.getCurrentVectors();
            diceValues[i].stableCount = 0;
        }

        let check = () => {
            let allStable = true;
            for (let i = 0; i < diceValues.length; i++) {
                if (diceValues[i].dice.isFinished()) {
                    diceValues[i].stableCount++;
                } else {
                    diceValues[i].stableCount = 0;
                }

                if (diceValues[i].stableCount < 50) {
                    allStable = false;
                }
            }

            if (allStable) {
                console.log("all stable");
                this.gameState.world.removeEventListener('postStep', check);

                for (let i = 0; i < diceValues.length; i++) {
                    diceValues[i].dice.shiftUpperValue(diceValues[i].value);
                    diceValues[i].dice.resetBody();
                    diceValues[i].dice.setVectors(diceValues[i].vectors);
                    diceValues[i].dice.simulationRunning = false;
                }

                this.throwRunning = false;
            } else {
                // DiceManager.world.step(DiceManager.world.dt);
            }
        };

        this.gameState.world.addEventListener('postStep', check);
    }

    emulateThrow(callback: (value: number) => void) {
        let stableCount = 0;

        let check = () => {
            this.gameState.dice.forEach(die => {
                if (die.isFinished()) {
                    stableCount++;

                    if (stableCount === this.gameState.dice.length) {
                        this.gameState.world.removeEventListener('postStep', check);
                        callback(die.getUpsideValue());
                    }
                } else {
                    this.gameState.world.step(this.gameState.world.dt);
                }
            });

        };

        this.gameState.world.addEventListener('postStep', check);
    }

    addDice = () => {
        const dice = new D6Die({material: this.diceBodyMaterial, backColor: '#ff0000'});
        this.gameState.scene.add(dice.getObject().mesh);

        // If you want to place the mesh somewhere else, you have to update the body
        dice.getObject().mesh.position.x = 0;
        dice.getObject().mesh.position.y = 100;
        dice.getObject().mesh.position.z = 0;
        dice.getObject().mesh.rotation.x = 20 * Math.PI / 180;
        dice.updateBodyFromMesh();

        // Set the value of the side, which will be upside after the dice lands
        this.prepareValues([{dice: dice, value: 6}]);
        this.gameState.dice.push(dice);
    }

    disable(): void {
    }

    enable(): void {
    }

    tearDown(): void {
    }
}

export default DiceController;

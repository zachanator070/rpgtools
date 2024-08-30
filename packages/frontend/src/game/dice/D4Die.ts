import {DiceOptions, PhysicsDie} from "./PhysicsDie";
import * as THREE from "three";

export class D4Die extends PhysicsDie {
    private d4FaceTexts: string[][][];
    constructor(options: DiceOptions) {
        super(options);

        this.tab = -0.1;
        this.af = Math.PI * 7 / 6;
        this.chamfer = 0.96;
        this.vertices = [[1, 1, 1], [-1, -1, 1], [-1, 1, -1], [1, -1, -1]];
        this.faces = [[1, 0, 2, 1], [0, 1, 3, 2], [0, 3, 2, 3], [1, 2, 3, 4]];
        this.scaleFactor = .1;
        this.maxValue = 4;
        this.d4FaceTexts = [
            [[], ['0', '0', '0'], ['2', '4', '3'], ['1', '3', '4'], ['2', '1', '4'], ['1', '2', '3']],
            [[], ['0', '0', '0'], ['2', '3', '4'], ['3', '1', '4'], ['2', '4', '1'], ['3', '2', '1']],
            [[], ['0', '0', '0'], ['4', '3', '2'], ['3', '4', '1'], ['4', '2', '1'], ['3', '1', '2']],
            [[], ['0', '0', '0'], ['4', '2', '3'], ['1', '4', '3'], ['4', '1', '2'], ['1', '3', '2']]
        ];
        this.faceTexts = this.d4FaceTexts[0].map((x) => x.join(''));
        this.mass = 300;
        this.inertia = 5;
        this.invertUpside = true;
    }

    updateMaterialsForValue(diceValue) {
        if (diceValue < 0) diceValue += 4;
        this.faceTexts = this.d4FaceTexts[diceValue].map((x) => x.join(''));
        this.object.mesh.material = this.getMaterials();
    };

    createTextTexture(text, color, backColor) {
        let canvas = document.createElement("canvas");
        let context = canvas.getContext("2d");
        let ts = this.calculateTextureSize(this.size / 2 + this.size * 2) * 2;
        canvas.width = canvas.height = ts;
        context.font = ts / 5 + "pt Arial";
        context.fillStyle = backColor;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillStyle = color;
        for (let i in text) {
            context.fillText(text[i], canvas.width / 2,
                canvas.height / 2 - ts * 0.3);
            context.translate(canvas.width / 2, canvas.height / 2);
            context.rotate(Math.PI * 2 / 3);
            context.translate(-canvas.width / 2, -canvas.height / 2);
        }
        let texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        return texture;
    };
}
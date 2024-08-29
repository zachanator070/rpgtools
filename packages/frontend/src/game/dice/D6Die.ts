import {PhysicsDie} from "./PhysicsDie";

export class D6Die extends PhysicsDie {
    protected tab = 0.1;
    af = Math.PI / 4;
    chamfer = 0.96;
    protected vertices = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
        [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]];
    faces = [[0, 3, 2, 1, 1], [1, 2, 6, 5, 2], [0, 1, 5, 4, 3],
        [3, 7, 6, 2, 4], [0, 4, 7, 3, 5], [4, 5, 6, 7, 6]];
    scaleFactor = 0.1;
    values = 6;
    faceTexts = [' ', '0', '1', '2', '3', '4', '5', '6', '7', '8',
        '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];
    textMargin = 1.0;
    mass = 300;
    inertia = 13;
}
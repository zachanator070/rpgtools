import {adminLogin, goToMap, seedMiddleEarth} from "../../util/helper";


describe("join game", () => {
    beforeEach(() => {
        seedMiddleEarth();
        adminLogin();
        goToMap();
    });

    it('host game', () => {
    });
});
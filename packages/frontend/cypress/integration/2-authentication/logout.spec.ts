import {goHome, login, seedMiddleEarth} from "../../util/helper";

describe("logout", () => {

    beforeEach(() => {
        seedMiddleEarth();
        login();
        goHome();
    });

    it("logout", () => {
        cy.get('#logoutButton').click();
        cy.get('a').contains('Login');
    });
})
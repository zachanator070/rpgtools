import {goHome, adminLogin, seedMiddleEarth} from "../../util/helper";

describe("logout", () => {

    beforeEach(() => {
        seedMiddleEarth();
        adminLogin();
        goHome();
    });

    it("logout", () => {
        cy.get('#logoutButton').click();
        cy.get('a').contains('Login');
    });
})
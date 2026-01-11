import {goHome, adminLogin, seedMiddleEarth, stopApp} from "../../util/helper";

describe("logout", () => {

    beforeEach(() => {
        seedMiddleEarth();
        adminLogin();
        goHome();
    });

    after(() => {
        stopApp();
    });
    
    it("logout", () => {
        cy.get('#logoutButton').click();
        cy.get('a').should('contain.text', 'Login');
    });
})
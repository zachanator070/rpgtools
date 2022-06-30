import {adminLogin, goToWorldSettings, seedMiddleEarth} from "../../util/helper";

describe("world settings rename", () => {
    beforeEach(() => {
        seedMiddleEarth();
        adminLogin();
        goToWorldSettings();
    });

    it("rename", () => {
       cy.get('#newWorldNameInput').type('Other Earth');
       cy.get('button').contains('Submit').click();
       cy.get('h1').should('contain.text', 'Settings for Other Earth');
    });

});
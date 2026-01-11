import {adminLogin, goHome, seedMiddleEarth, stopApp} from "../../util/helper";

describe('create world', () => {
    beforeEach(() => {
        seedMiddleEarth();
        adminLogin();
        goHome();
        cy.get('#worldMenu').contains('No World Selected').click();
        cy.get('a').contains('New World').click();
    });

    after(() => {
        stopApp();
    });

    it('success', () => {
        cy.get('#newWorldName').type('Earth');
        cy.get('#submit').click();
        cy.location().should((location) => {
            expect(location.href).not.eq("http://localhost:3000/#");
        });
    });
});
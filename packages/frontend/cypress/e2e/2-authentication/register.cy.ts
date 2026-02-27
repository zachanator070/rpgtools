import {goHome, logout, seedMiddleEarth, stopApp} from "../../util/helper";

describe("register", () => {

    beforeEach(() => {
        seedMiddleEarth();
        logout();
        goHome();

        cy.get('a').contains('Register').click();
    });

    after(() => {
        stopApp();
    });

    it("success", () => {
        cy.get('#registerEmail').type("tester2@gmail.com");
        cy.get('#registerDisplayName').type('user');
        cy.get('#registerPassword').type('password');
        cy.get('#registerRepeatPassword').type('password');
        cy.get('#submit').click();
    });

    it('failure', () => {
        cy.get('#registerEmail').type("tester3@gmail.com");
        cy.get('#registerDisplayName').type('user');
        cy.get('#registerPassword').type('password');
        cy.get('#registerRepeatPassword').type('password');
        cy.get('#submit').click();
        cy.get('.ant-modal-body').contains('Registration Error');
    });

});

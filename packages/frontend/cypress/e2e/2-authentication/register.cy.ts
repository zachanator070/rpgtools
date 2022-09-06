import {goHome, logout, seedMiddleEarth} from "../../util/helper";
import {REGISTER_CODE} from "../../util/constants";

describe("register", () => {

    beforeEach(() => {
        seedMiddleEarth();
        logout();
        goHome();

        cy.get('a').contains('Register').click();
    });

    it("success", () => {
       cy.get('#registerCode').type(REGISTER_CODE);
       cy.get('#registerEmail').type("user@gmail.com");
       cy.get('#registerDisplayName').type('user');
       cy.get('#registerPassword').type('password');
       cy.get('#registerRepeatPassword').type('password');
       cy.get('#submit').click();
    });

    it('failure', () => {
        cy.get('#registerCode').type("bad_code");
        cy.get('#registerEmail').type("user@gmail.com");
        cy.get('#registerDisplayName').type('user');
        cy.get('#registerPassword').type('password');
        cy.get('#registerRepeatPassword').type('password');
        cy.get('#submit').click();
        cy.get('.ant-modal-body').contains('Register code not valid');
    });

});

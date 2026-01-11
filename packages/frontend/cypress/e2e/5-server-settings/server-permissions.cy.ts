import {adminLogin, goToServerSettings, seedMiddleEarth, stopApp} from '../../util/helper';
import {TEST_ROLE_NAME} from "../../util/constants";

describe('server permissions', () => {

    beforeEach(() => {
        seedMiddleEarth();
        adminLogin();
        goToServerSettings();
    });

    after(() => {
        stopApp();
    });

    it('add role', () => {
        cy.get('span').should('contain.text', 'Roles');
        cy.get('span').contains('Roles').click();
        cy.get('#selectRole').type(TEST_ROLE_NAME);
        cy.get('div').contains(TEST_ROLE_NAME).click();
        // cy.get('button').should('contain.text', 'Add Role');
        cy.get('button').contains('Add role').click();
        cy.get('li').should('contain.text', TEST_ROLE_NAME);
    });
});
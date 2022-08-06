import {adminLogin, goToMap, seedMiddleEarth} from "../../util/helper";
import {MIDDLE_EARTH_MAP_URL, MINAS_TIRITH_MAP_URL} from "../../util/constants";


describe("map pins", () => {
    beforeEach(() => {
        seedMiddleEarth();
        adminLogin();
        goToMap();
    });

    it('pin details', () => {
        cy.get('.mapPin').click();
        cy.get('a').contains('Details').click();
        cy.get('h1').contains('Minas Tirith');
        cy.get('button').contains('Close').click();
        cy.get('h1').contains('Minas Tirith').should('not.be.visible');
    });

    it('pin map', () => {
        cy.get('.mapPin').click();
        cy.get('a').contains('Open Map').click();
        cy.location().should(location => {
            expect(location.href).contains(MINAS_TIRITH_MAP_URL);
        });
        cy.get(':nth-child(1) > .ant-breadcrumb-link > a').click();
        cy.location().should(location => {
            expect(location.href).contains(MIDDLE_EARTH_MAP_URL);
        });
    });

    it('new pin', () => {

        cy.get('canvas').rightclick();
        cy.get('div').contains('New Pin').click();
        cy.get('.mapPin').should('have.length', 2);

    });

    it('edit pin', () => {
        cy.get('.mapPin').click();
        cy.get('div').contains('Edit Pin').click();
        cy.get('.ant-form-item-control-input-content > :nth-child(1) > .ant-select > .ant-select-selector').click();
        cy.get('.ant-select-item-option-active').click();
        cy.get('button').contains('Save').click();
        cy.get('.mapPin').click();
        cy.get('h2').contains('Middle Earth');

    });
});
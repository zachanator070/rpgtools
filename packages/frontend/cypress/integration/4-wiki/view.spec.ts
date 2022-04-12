import {adminLogin, goToWiki, seedMiddleEarth} from "../../util/helper";
import {MIDDLE_EARTH_MAP, MINAS_TIRITH_MAP, MINAS_TIRITH_WIKI} from "../../util/constants";

describe('view wiki', () => {

    beforeEach(() => {
        seedMiddleEarth();
        adminLogin();
        goToWiki();
    });

    it('view contents and images', () => {
        cy.get('img').should('have.length.at.least', 2);
        cy.get('p').should('contain.text', 'Here be dragons and hobbits');
    });

    it('map links', () => {
        cy.get('a').should('contain.text', 'Go to Map ');
        cy.get('a').contains('Go to Map ').click();
        cy.location().should(location => {
            expect(location.href).contains(MIDDLE_EARTH_MAP);
        });
    });

    it('visit map link', () => {
        cy.get('a').should('contain.text', 'Minas Tirith');
        cy.get('a').contains('Minas Tirith').click();
        cy.location().should(location => {
            expect(location.href).eq(MINAS_TIRITH_WIKI);
        });
        cy.get('a').should('contain.text', 'Go to Map');
        cy.get('a').contains('Go to Map').click();
        cy.location().should(location => {
            expect(location.href).contains(MINAS_TIRITH_MAP);
        });
    });

    it('see on map link', () => {
        cy.get('a').should('contain.text', 'Minas Tirith');
        cy.get('a').contains('Minas Tirith').click();
        cy.location().should(location => {
            expect(location.href).eq(MINAS_TIRITH_WIKI);
        });
        cy.get('a').should('contain.text', 'See on map');
        cy.get('a').contains('See on map').click();
        cy.location().should(location => {
            expect(location.href).contains(MIDDLE_EARTH_MAP);
        });
    });
});
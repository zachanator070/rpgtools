import {adminLogin, goHome, seedMiddleEarth} from "../../util/helper";
import {MIDDLE_EARTH_MAP_URL} from "../../util/constants";

describe('select world', () => {
   beforeEach(() => {
       seedMiddleEarth();
       adminLogin();
       goHome();
       cy.get('#worldMenu').contains('No World Selected').click();
       cy.get('a').contains('Select World').click();
   });

    it('select middle earth', () => {
        cy.get('#searchWorld').type('middle earth');
        cy.get('div').contains('Middle Earth').click();
        cy.get('#submit').click();
        cy.location().should((location) => {
            expect(location.href).eq(MIDDLE_EARTH_MAP_URL);
        });
    });

    it('no found worlds', () => {
        cy.get('#searchWorld').type('asdf');
        cy.get('#submit').should('be.disabled');
    });
});
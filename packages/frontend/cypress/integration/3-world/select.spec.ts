import {adminLogin, goHome, seedMiddleEarth} from "../../util/helper";

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
        cy.get('#selectWorld').click();
        cy.location().should((location) => {
            expect(location.href).eq("http://localhost:3000/ui/world/6250f18b8f489b1a4cf78360/map/6250f18b8f489b1a4cf78362");
        });
    });

    it('no found worlds', () => {
        cy.get('#searchWorld').type('asdf');
        cy.get('#selectWorld').should('be.disabled');
    });
});
import {adminLogin, goToWiki, seedMiddleEarth} from "../../util/helper";

describe('view wiki', () => {

    beforeEach(() => {
        seedMiddleEarth();
        adminLogin();
        goToWiki();
    });

    it('view contents and images', () => {
        cy.get('p').contains('Here be dragons and hobbits');
        expect(cy.get('#mapImage')).to.exist;
    });

});
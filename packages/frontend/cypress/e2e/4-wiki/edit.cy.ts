import {adminLogin, goToEditWiki, seedMiddleEarth} from "../../util/helper";
import {MIDDLE_EARTH_WIKI_URL, TEST_IMAGE} from "../../util/constants";

describe('edit wiki', () => {

    beforeEach(() => {
        seedMiddleEarth();
        adminLogin();
        goToEditWiki();
    });

    it('content change', () => {
        cy.get('#editor').type('testing a change');
        cy.get('button').contains('Save').click();
        cy.location().should(location => {
            expect(location.href).contains(MIDDLE_EARTH_WIKI_URL);
        });
        cy.get('p').should('contain.text', 'testing a change');
    });

    it('change images', () => {
        cy.get('#coverImageUpload').attachFile(TEST_IMAGE);
        cy.get('#mapImageUpload').attachFile(TEST_IMAGE);
        cy.get('button').contains('Save').click();
        cy.location({ timeout: 120000 }).should(location => {
            expect(location.href).contains(MIDDLE_EARTH_WIKI_URL);
        });
        cy.get('img').should('have.length.at.least', 2);
    });

    it('revert change images', () => {
        cy.get('#coverImageUpload').attachFile(TEST_IMAGE);
        cy.get('#mapImageUpload').attachFile(TEST_IMAGE);
        cy.get('#revertMap').click();
        cy.get('#revertCover').click();
        cy.get('button').contains('Save').click();
        cy.location().should(location => {
            expect(location.href).contains(MIDDLE_EARTH_WIKI_URL);
        });
        cy.get('img').should('have.length.at.least', 2);
    });

});
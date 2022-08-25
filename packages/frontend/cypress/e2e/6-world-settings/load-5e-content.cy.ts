import {adminLogin, goToWorldSettings, seedMiddleEarth} from "../../util/helper";
import {MIDDLE_EARTH_WIKI_URL} from "../../util/constants";


describe('load 5e content', () => {
    beforeEach(() => {
        seedMiddleEarth();
        adminLogin();
        goToWorldSettings();
    })

    it('load all', () => {
        cy.get(':nth-child(1) > .ant-checkbox > .ant-checkbox-input').click();
        cy.get(':nth-child(2) > .ant-checkbox > .ant-checkbox-input').click();
        cy.get('button').contains('Load').click();
        cy.location({ timeout: 120000 }).should((location) => {
            expect(location.href).eq(MIDDLE_EARTH_WIKI_URL);
        });
        cy.get(':nth-child(3) > [style="cursor: pointer;"] > :nth-child(1) > .ant-dropdown-trigger').should('contain.text', '5e');

    });
})
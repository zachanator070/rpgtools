import {adminLogin, goToWorldSettings, seedMiddleEarth} from "../../util/helper";
import {MIDDLE_EARTH_WIKI_URL} from "../../util/constants";


describe('load 5e content', () => {
    beforeEach(() => {
        seedMiddleEarth();
        adminLogin();
        goToWorldSettings();
    })

    it.skip('load all', () => {
        cy.get('button').contains('Load').click();
        cy.location({ timeout: 120000 }).should((location) => {
            expect(location.href).eq(MIDDLE_EARTH_WIKI_URL);
        });
        cy.get(':nth-child(1) > [style="cursor: pointer;"] > :nth-child(1) > .ant-dropdown-trigger', {timeout: 30 * 1000}).should('contain.text', '5e');

    });
})
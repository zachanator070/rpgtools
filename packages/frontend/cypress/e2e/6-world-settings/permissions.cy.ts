import {adminLogin, goToServerSettings, goToWorldSettings, seedMiddleEarth} from "../../util/helper";


describe("world settings permissions", () => {
    beforeEach(() => {
        seedMiddleEarth();
        adminLogin();
        goToWorldSettings();
    });

    describe("with role tab selected", () => {

        beforeEach(() => {
            cy.get(".ant-radio-group > :nth-child(2)").click();
        });

        it("remove role", () => {
            cy.get('.ant-list-items > :nth-child(1) > .ant-btn').click();
            cy.get('ul.ant-list-items > li').should('have.length', 2);
        });

        it("add role", () => {
           cy.get('div').contains('Able to change permissions for this world').click();
           cy.get('#selectRole').click();
           cy.get('div').contains('test role').click();
           cy.get('button').contains('Add role').click();
            cy.get('ul.ant-list-items > li').should('have.length', 2);
        });
    });

})
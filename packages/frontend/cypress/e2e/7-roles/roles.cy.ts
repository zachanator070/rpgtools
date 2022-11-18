import {adminLogin, goToRoles, seedMiddleEarth} from "../../util/helper";


describe("roles", () => {
    beforeEach(() => {
        seedMiddleEarth();
        adminLogin();
        goToRoles();
    });

    it("add role", () => {
        cy.get('#newRoleName').type('new test role');
        cy.get('button').contains('Create').click();
        cy.get('#selectRole').click();
        cy.get('div').contains('new test role');
    });

    describe('with test role selected', () => {
        beforeEach(() => {
            cy.get('#selectRole').click();
            cy.get('div').contains('test role').click();
        });

        describe('with users tab selected', () => {
            beforeEach(() => {
                cy.get('div').contains('Users with this role').click();
            });

            it('add and remove user', () => {
               cy.get('#selectUserInput').type('tester');
               cy.get('div').contains('tester', {timeout: 8000}).click();
               cy.get('button').contains('Add User').click();

                cy.get('.ant-list-items > :nth-child(2) > .ant-btn').click();

                cy.get('ul.ant-list-items > li').should('have.length', 1);
            });
        });

        describe('with delete role tab selected', () => {
            beforeEach(() => {
                cy.get('div').contains('Delete this role').click();
            });

            it('delete role', () => {
                cy.get('button').contains('Delete this role').click();
                cy.get('#selectRole').click();
                cy.get('.ant-select-dropdown').should('have.length', 1);
            });
        });
    });
})
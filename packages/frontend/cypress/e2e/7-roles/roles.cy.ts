import {adminLogin, goToRoles, goToWorldSettings, seedMiddleEarth} from "../../util/helper";
import {WORLD_ADMIN} from "@rpgtools/common/src/permission-constants";


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

        describe('with permissions selected', () => {
            beforeEach(() => {
                cy.get('div').contains('Permissions in this role').click();
            });

            it('remove permission', () => {
                cy.get(':nth-child(4) > .ant-btn').click();
                cy.get('.ant-empty-image');
            });

            it('add permission', () => {
                cy.get('.margin-lg-top > .ant-select > .ant-select-selector').click();
                cy.get(':nth-child(3) > :nth-child(1) > .ant-select-dropdown > :nth-child(1) > .rc-virtual-list > .rc-virtual-list-holder > :nth-child(1) > .rc-virtual-list-holder-inner > .ant-select-item-option-active').click();
                cy.get(':nth-child(3) > .ant-select > .ant-select-selector').click();
                cy.get('[title="Able to change permissions for this world"]').click();
                cy.get(':nth-child(4) > .ant-select > .ant-select-selector').click();
                cy.get(':nth-child(5) > :nth-child(1) > .ant-select-dropdown > :nth-child(1) > .rc-virtual-list > .rc-virtual-list-holder > :nth-child(1) > .rc-virtual-list-holder-inner > .ant-select-item').click();
                cy.get('button').contains('Add Permission').click();
                cy.get('[data-row-key="6250f18b8f489b1a4cf7836d"]').contains(WORLD_ADMIN);
            });
        });

        describe('with users tab selected', () => {
            beforeEach(() => {
                cy.get('div').contains('Users with this role').click();
            });

            it('add and remove user', () => {
               cy.get('#selectUserInput').type('tester');
               cy.get('div').contains('tester').click();
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
                cy.get('#selectRole').type('test role');
                cy.get('.ant-empty-image');
            });
        });
    });
})
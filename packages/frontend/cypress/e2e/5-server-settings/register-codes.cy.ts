import {adminLogin, goToServerSettings, seedMiddleEarth} from "../../util/helper";

describe("register codes", () => {

    beforeEach(() => {
        seedMiddleEarth();
        adminLogin();
        goToServerSettings();
    });

    it("generate 1", () => {
        cy.get("#numberCodesToGenerate").type("1");
        cy.get("button").contains("Generate").click();
        cy.get("li").should('have.length', 2);
    });

    it("generate 3", () => {
        cy.get("#numberCodesToGenerate").type("3");
        cy.get("button").contains("Generate").click();
        cy.get("li").should('have.length', 4);
    });
})
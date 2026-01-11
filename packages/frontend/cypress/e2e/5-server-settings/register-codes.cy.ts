import {adminLogin, goToServerSettings, seedMiddleEarth, stopApp} from "../../util/helper";

describe("register codes", () => {

    beforeEach(() => {
        seedMiddleEarth();
        adminLogin();
        goToServerSettings();
    });

    after(() => {
        stopApp();
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
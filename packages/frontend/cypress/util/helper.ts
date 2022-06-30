import {
    ADMIN_PASSWORD,
    ADMIN_USERNAME,
    MIDDLE_EARTH_MAP_URL,
    MIDDLE_EARTH_WIKI_URL,
    MIDDLE_EARTH_WIKI_EDIT_URL,
    SERVER_SETTINGS_URL, WORLD_SETTINGS_URL
} from "./constants";

export function seedNewServer() {
    cy.exec("npm run seed:new");
}

export function seedMiddleEarth() {
    cy.exec("npm run seed:middle_earth");
}

export function goHome() {
    cy.visit("http://localhost:3000/");
}

export function logout() {
    cy.request('POST', 'http://localhost:3000/graphql', {
        "operationName": "logout",
        "variables": {},
        "query": "mutation logout {logout}"
    });
}

export function adminLogin() {
    cy.request('POST', 'http://localhost:3000/graphql', {
        "operationName": "login",
        "variables": {"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD},
        "query": "mutation login($username: String!, $password: String!) {\n  login(username: $username, password: $password) {\n    _id\n    __typename\n  }\n}\n"
    });
}

export function goToMap() {
    cy.visit(MIDDLE_EARTH_MAP_URL);
}

export function goToWiki() {
    cy.visit(MIDDLE_EARTH_WIKI_URL);
}

export function goToEditWiki() {
    cy.visit(MIDDLE_EARTH_WIKI_EDIT_URL);
}

export function goToServerSettings() {
    cy.visit(SERVER_SETTINGS_URL);
}

export function goToWorldSettings() {
    cy.visit(WORLD_SETTINGS_URL);
}
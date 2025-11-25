import {INJECTABLE_TYPES} from "../../src/di/injectable-types.js";

export const TEST_INJECTABLE_TYPES = {
    ...INJECTABLE_TYPES,
    DefaultTestingContext: Symbol.for("DefaultTestingContext")
};
import {INJECTABLE_TYPES} from "../../src/di/injectable-types";

export const TEST_INJECTABLE_TYPES = {
    ...INJECTABLE_TYPES,
    DefaultTestingContext: Symbol.for("DefaultTestingContext")
};
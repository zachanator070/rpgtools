import { RENAME_WORLD } from "@rpgtools/common/src/gql-mutations.js";
import { container } from "../../../src/di/inversify.js";
import { INJECTABLE_TYPES } from "../../../src/di/injectable-types.js";
import Logger from "../../../src/logging/logger.js";
import { DefaultTestingContext } from "../default-testing-context.js";
import { TEST_INJECTABLE_TYPES } from "../injectable-types.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

process.env.TEST_SUITE = "error-formatting-test";

describe("graphql error formatting", () => {
	const testingContext = container.get<DefaultTestingContext>(TEST_INJECTABLE_TYPES.DefaultTestingContext);
	const logger = container.get<Logger>(INJECTABLE_TYPES.Logger);

	beforeEach(async () => {
		await testingContext.reset();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("does not mask expected errors thrown from server source", async () => {
		const result = await testingContext.server.executeGraphQLQuery({
			query: RENAME_WORLD,
			variables: {
				worldId: "00000000-0000-0000-0000-000000000000",
				newName: "Azeroth",
			},
		});

		expect(result.errors).toBeDefined();
		expect(result.errors?.[0].message).not.toBe("Internal Server Error");
		expect(result.errors?.[0].message).toContain("doesn't exist");
	});

	it("masks unexpected errors from outside server source", async () => {
		const loggerErrorSpy = vi.spyOn(logger, "error");
		const originalGet = container.get.bind(container);
		vi.spyOn(container, "get").mockImplementation(((serviceIdentifier: unknown) => {
			if (serviceIdentifier === INJECTABLE_TYPES.WorldService) {
				return {
					renameWorld: async () => {
						throw new Error("simulated unexpected failure");
					},
				};
			}
			return originalGet(serviceIdentifier as never);
		}) as typeof container.get);

		const result = await testingContext.server.executeGraphQLQuery({
			query: RENAME_WORLD,
			variables: {
				worldId: testingContext.world._id,
				newName: "Azeroth",
			},
		});

		expect(result.errors).toBeDefined();
		expect(result.errors?.[0].message).toBe("Internal Server Error");
		expect(loggerErrorSpy).toHaveBeenCalledWith(
			"Internal GraphQL error",
			expect.objectContaining({
				message: "simulated unexpected failure",
				stack: expect.stringContaining("simulated unexpected failure"),
			}),
		);
	});
});

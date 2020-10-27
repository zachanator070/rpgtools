import React from "react";

describe("test module 1", () => {
	test("test1", async () => {
		expect({ attr: 1 }).toMatchSnapshot();
	});
	test("test2", async () => {
		expect({ attr: 2 }).toMatchSnapshot();
	});
});

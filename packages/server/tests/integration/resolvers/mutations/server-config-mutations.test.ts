import { container } from "../../../../src/di/inversify";
import { INJECTABLE_TYPES } from "../../../../src/di/injectable-types";
import {Factory} from "../../../../src/types";
import { FilterCondition } from "../../../../src/dal/filter-condition";
import {DefaultTestingContext} from "../../default-testing-context";
import {GENERATE_REGISTER_CODES, UNLOCK_SERVER} from "@rpgtools/common/src/gql-mutations";
import {DbUnitOfWork} from "../../../../src/dal/db-unit-of-work";
import {TEST_INJECTABLE_TYPES} from "../../injectable-types";

process.env.TEST_SUITE = "server-mutations-test";

describe("server mutations", () => {
	const unitOfWorkFactory = container.get<Factory<DbUnitOfWork>>(INJECTABLE_TYPES.DbUnitOfWorkFactory);
	const testingContext = container.get<DefaultTestingContext>(TEST_INJECTABLE_TYPES.DefaultTestingContext);


	describe("with locked server", () => {
		const resetConfig = async () => {
			const unitOfWork = unitOfWorkFactory({});
			const serverConfig = await unitOfWork.serverConfigRepository.findOne([]);
			serverConfig.unlockCode = "asdf";
			serverConfig.adminUsers = [];
			await unitOfWork.serverConfigRepository.update(serverConfig);
			await testingContext.server.checkConfig();
		};
		beforeEach(async () => {
			await resetConfig();
		});

		afterEach(async () => {
			await resetConfig();
		});

		test("unlock", async () => {
			const result = await testingContext.server.executeGraphQLQuery({
				query: UNLOCK_SERVER,
				variables: {
					unlockCode: "asdf",
					email: "zach@thezachcave.com",
					username: "otherTester",
					password: "zach",
				},
			});
			expect(result).toMatchSnapshot({
				data: {
					unlockServer: true,
				},
				errors: undefined,
			});
		});

		test("unlock twice", async () => {
			await testingContext.server.executeGraphQLQuery({
				query: UNLOCK_SERVER,
				variables: {
					unlockCode: "asdf",
					email: "zach@thezachcave.com",
					username: "otherTester",
					password: "zach",
				},
			});
			const result = await testingContext.server.executeGraphQLQuery({
				query: UNLOCK_SERVER,
				variables: {
					unlockCode: "asdf",
					email: "zach@thezachcave.com",
					username: "otherTester",
					password: "zach",
				},
			});
			expect(result).toMatchSnapshot();
		});
	});

	test("generate register codes no permission", async () => {
		const result = await testingContext.server.executeGraphQLQuery({
			query: GENERATE_REGISTER_CODES,
			variables: { amount: 10 },
		});
		expect(result).toMatchSnapshot();
	});

	describe("with authenticated user", () => {
		beforeEach(async () => {
			const unitOfWork = unitOfWorkFactory({});
			testingContext.mockSessionContextFactory.setCurrentUser(
				await unitOfWork.userRepository.findOne([new FilterCondition("username", "tester")])
			);
			await unitOfWork.commit();
		});

		test("generate register codes", async () => {
			const result = await testingContext.server.executeGraphQLQuery({
				query: GENERATE_REGISTER_CODES,
				variables: { amount: 10 },
			});
			expect(result).toMatchSnapshot({
				data: {
					generateRegisterCodes: {
						_id: expect.any(String),
						registerCodes: expect.arrayContaining([expect.any(String)]),
					},
				},
				errors: undefined,
			});
		});
	});
});

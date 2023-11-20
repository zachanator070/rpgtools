import {DefaultTestingContext} from "../../default-testing-context";
import {
	CREATE_PIN,
	CREATE_WORLD, DELETE_CALENDAR,
	DELETE_PIN,
	RENAME_WORLD,
	UPDATE_PIN,
	UPSERT_CALENDAR
} from "@rpgtools/common/src/gql-mutations";
import {container} from "../../../../src/di/inversify";
import {TEST_INJECTABLE_TYPES} from "../../injectable-types";

process.env.TEST_SUITE = "world-mutations-test";

describe("world-mutations", () => {
	describe("with world and logged in", () => {
		const testingContext = container.get<DefaultTestingContext>(TEST_INJECTABLE_TYPES.DefaultTestingContext);

		beforeEach(async () => {
			await testingContext.reset();
		});

		test("create world", async () => {
			const result = await testingContext.server.executeGraphQLQuery({
				query: CREATE_WORLD,
				variables: { name: "Earth", public: false },
			});
			expect(result).toMatchSnapshot({
				data: {
					createWorld: {
						_id: expect.any(String),
						wikiPage: {
							_id: expect.any(String),
						},
					},
				},
				errors: undefined,
			});
		});

		test("rename world", async () => {
			const result = await testingContext.server.executeGraphQLQuery({
				query: RENAME_WORLD,
				variables: { worldId: testingContext.world._id, newName: "Azeroth" },
			});
			expect(result).toMatchSnapshot({
				data: {
					renameWorld: {
						_id: expect.any(String),
					},
				},
				errors: undefined,
			});
		});

		test("create pin", async () => {
			const result = await testingContext.server.executeGraphQLQuery({
				query: CREATE_PIN,
				variables: {
					mapId: testingContext.world.wikiPage,
					x: 0,
					y: 0,
					wikiId: testingContext.world.wikiPage,
				},
			});
			expect(result).toMatchSnapshot({
				data: {
					createPin: {
						_id: expect.any(String),
						page: {
							_id: expect.any(String),
						},
						map: {
							_id: expect.any(String),
						}
					},
				},
				errors: undefined,
			});
		});

		test("update pin", async () => {
			const result = await testingContext.server.executeGraphQLQuery({
				query: UPDATE_PIN,
				variables: { pinId: testingContext.pin._id, pageId: testingContext.otherPage._id },
			});
			expect(result).toMatchSnapshot({
				data: {
					updatePin: {
						_id: expect.any(String),
						page: {
							_id: expect.any(String),
						},
						map: {
							_id: expect.any(String),
						}
					},
				},
				errors: undefined,
			});
		});

		test("delete pin", async () => {
			const result = await testingContext.server.executeGraphQLQuery({
				query: DELETE_PIN,
				variables: { pinId: testingContext.pin._id },
			});
			expect(result).toMatchSnapshot({
				data: {
					deletePin: {
						_id: expect.any(String),
						page: {
							_id: expect.any(String),
						},
						map: {
							_id: expect.any(String),
						}
					},
				},
				errors: undefined,
			});
		});

		test("create calendar", async () => {
			const calendarName = 'new calendar';
			const ageName = 'new age';
			const monthName = 'new month';
			const dayName = 'new day';
			const result = await testingContext.server.executeGraphQLQuery({
				query: UPSERT_CALENDAR,
				variables: {
					name: calendarName,
					world: testingContext.world._id,
					ages: [{
						name: ageName,
						numYears: 1000,
						months: [{
							name: monthName,
							numDays: 30
						}],
						daysOfTheWeek: [{
							name: dayName
						}]
					}]
				}
			});
			expect(result).toMatchSnapshot({
				data: {
					upsertCalendar: {
						_id: expect.any(String),
						name: calendarName,
						ages: [{
							_id: expect.any(String),
							name: ageName,
							numYears: 1000,
							months: [{
								_id: expect.any(String),
								name: monthName,
								numDays: 30
							}],
							daysOfTheWeek: [{
								_id: expect.any(String),
								name: dayName
							}]
						}],
						accessControlList: expect.arrayContaining([
							{
								permission: expect.any(String),
								principal: {
									_id: expect.any(String),
									name: expect.any(String)
								},
								principalType: expect.any(String)
							}
						])
					},
				},
				errors: undefined,
			});
		});

		test("update calendar age years", async () => {
			const result = await testingContext.server.executeGraphQLQuery({
				query: UPSERT_CALENDAR,
				variables: {
					name: testingContext.calendar1.name,
					calendarId: testingContext.calendar1._id,
					world: testingContext.world._id,
					ages: [{
						name: testingContext.calendar1.ages[0].name,
						_id: testingContext.calendar1.ages[0]._id,
						numYears: 1000,
						months: [{
							name: testingContext.calendar1.ages[0].months[0].name,
							_id: testingContext.calendar1.ages[0].months[0]._id,
							numDays: 60
						}],
						daysOfTheWeek: [{
							name: testingContext.calendar1.ages[0].daysOfTheWeek[0].name,
							_id: testingContext.calendar1.ages[0].daysOfTheWeek[0]._id
						}]
					}]
				}
			});
			expect(result).toMatchSnapshot({
				data: {
					upsertCalendar: {
						_id: expect.any(String),
						name: testingContext.calendar1.name,
						ages: [{
							_id: expect.any(String),
							name: testingContext.calendar1.ages[0].name,
							numYears: 1000,
							months: [{
								name: testingContext.calendar1.ages[0].months[0].name,
								_id: expect.any(String),
								numDays: 60
							}],
							daysOfTheWeek: [{
								_id: expect.any(String),
								name: testingContext.calendar1.ages[0].daysOfTheWeek[0].name
							}]
						}],
						accessControlList: expect.arrayContaining([
							{
								permission: expect.any(String),
								principal: {
									_id: expect.any(String),
									name: expect.any(String)
								},
								principalType: expect.any(String)
							}
						])
					},
				},
				errors: undefined,
			});
		});

		test("update calendar delete month", async () => {
			const result = await testingContext.server.executeGraphQLQuery({
				query: UPSERT_CALENDAR,
				variables: {
					name: testingContext.calendar1.name,
					calendarId: testingContext.calendar1._id,
					world: testingContext.world._id,
					ages: [{
						name: testingContext.calendar1.ages[0].name,
						_id: testingContext.calendar1.ages[0]._id,
						numYears: 100,
						months: [],
						daysOfTheWeek: [{
							name: testingContext.calendar1.ages[0].daysOfTheWeek[0].name,
							_id: testingContext.calendar1.ages[0].daysOfTheWeek[0]._id
						}]
					}]
				}
			});
			expect(result).toMatchSnapshot({
				data: {
					upsertCalendar: {
						_id: expect.any(String),
						name: testingContext.calendar1.name,
						ages: [{
							_id: expect.any(String),
							name: testingContext.calendar1.ages[0].name,
							numYears: 100,
							months: [],
							daysOfTheWeek: [{
								_id: expect.any(String),
								name: testingContext.calendar1.ages[0].daysOfTheWeek[0].name
							}]
						}],
						accessControlList: expect.arrayContaining([
							{
								permission: expect.any(String),
								principal: {
									_id: expect.any(String),
									name: expect.any(String)
								},
								principalType: expect.any(String)
							}
						])
					},
				},
				errors: undefined,
			});
		});

		test('delete calendar', async () => {
			const result = await testingContext.server.executeGraphQLQuery({
				query: DELETE_CALENDAR,
				variables: {
					calendarId: testingContext.calendar1._id,
				}
			});
			expect(result).toMatchSnapshot({
				data: {
					deleteCalendar: {
						_id: expect.any(String),
					},
				},
				errors: undefined,
			});
		});

		describe("not logged in", () => {
			beforeEach(() => {
				testingContext.mockSessionContextFactory.useAnonUser();
			});
			test("create world no permissions", async () => {
				const result = await testingContext.server.executeGraphQLQuery({
					query: CREATE_WORLD,
					variables: { name: "Earth", public: false },
				});
				expect(result).toMatchSnapshot({
					errors: expect.arrayContaining([expect.any(Object)]),
				});
			});

			test("rename world no permission", async () => {
				const result = await testingContext.server.executeGraphQLQuery({
					query: RENAME_WORLD,
					variables: { worldId: testingContext.world._id, newName: "Azeroth" },
				});
				expect(result).toMatchSnapshot({
					errors: expect.arrayContaining([expect.any(Object)]),
				});
			});

			test("create pin no permission", async () => {
				const result = await testingContext.server.executeGraphQLQuery({
					query: CREATE_PIN,
					variables: {
						mapId: testingContext.world.wikiPage,
						x: 0,
						y: 0,
						wikiId: testingContext.world.wikiPage,
					},
				});
				expect(result).toMatchSnapshot({
					errors: expect.arrayContaining([expect.any(Object)]),
				});
			});

			test("update pin no permission", async () => {
				const result = await testingContext.server.executeGraphQLQuery({
					query: UPDATE_PIN,
					variables: { pinId: testingContext.pin._id, pageId: testingContext.otherPage._id },
				});
				expect(result).toMatchSnapshot({
					errors: expect.arrayContaining([expect.any(Object)]),
				});
			});

			test("delete pin no permission", async () => {
				const result = await testingContext.server.executeGraphQLQuery({
					query: DELETE_PIN,
					variables: { pinId: testingContext.pin._id },
				});
				expect(result).toMatchSnapshot({
					errors: expect.arrayContaining([expect.any(Object)]),
				});
			});

			test("update calendar no permission", async () => {
				const result = await testingContext.server.executeGraphQLQuery({
					query: UPSERT_CALENDAR,
					variables: {
						name: testingContext.calendar1.name,
						calendarId: testingContext.calendar1._id,
						world: testingContext.world._id,
						ages: []
					}
				});
				expect(result).toMatchSnapshot({
					errors: expect.arrayContaining([expect.any(Object)]),
				});
			});

			test("create calendar no permission", async () => {
				const result = await testingContext.server.executeGraphQLQuery({
					query: UPSERT_CALENDAR,
					variables: {
						name: testingContext.calendar1.name,
						world: testingContext.world._id,
						ages: []
					}
				});
				expect(result).toMatchSnapshot({
					errors: expect.arrayContaining([expect.any(Object)]),
				});
			});
		});
	});
});

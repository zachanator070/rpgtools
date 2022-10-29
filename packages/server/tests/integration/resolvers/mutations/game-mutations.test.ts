import {container} from "../../../../src/di/inversify";
import {INJECTABLE_TYPES} from "../../../../src/di/injectable-types";
import {DbEngine, Factory} from "../../../../src/types";
import {DatabaseContext} from "../../../../src/dal/database-context";
import {DefaultTestingContext} from "../../default-testing-context";
import {TEST_INJECTABLE_TYPES} from "../../injectable-types";
import {GameService} from "../../../../src/services/game-service";
import {CREATE_GAME, GAME_CHAT, JOIN_GAME, LEAVE_GAME, SET_GAME_MAP} from "@rpgtools/common/src/gql-mutations";
import {Game} from "../../../../src/domain-entities/game";

process.env.TEST_SUITE = "game-mutations-test";

describe("game mutations", () => {
    const gameService = container.get<GameService>(INJECTABLE_TYPES.GameService);
    const databaseContextFactory = container.get<Factory<DatabaseContext>>(INJECTABLE_TYPES.DatabaseContextFactory);
    const dbEngine = container.get<DbEngine>(INJECTABLE_TYPES.DbEngine);
    const testingContext = container.get<DefaultTestingContext>(TEST_INJECTABLE_TYPES.DefaultTestingContext);


    describe("with world", () => {
        beforeEach(async () => {
            await testingContext.reset();
        });

        describe('as anon', () => {
            beforeEach(async () => {
                testingContext.mockSessionContextFactory.useAnonUser();
            });

            test('create game', async () => {
                const result = await testingContext.server.executeGraphQLQuery({
                    query: CREATE_GAME,
                    variables: { worldId: testingContext.world._id, password: 'testingpassword', username: 'anon' },
                });
                expect(result).toMatchSnapshot({
                    errors: expect.arrayContaining([expect.any(Object)]),
                });
            });
        });

        describe('as tester1 user', () => {
            beforeEach(async () => {
                testingContext.mockSessionContextFactory.setCurrentUser(testingContext.tester1);
            });

            test('create game', async () => {
                const result = await testingContext.server.executeGraphQLQuery({
                    query: CREATE_GAME,
                    variables: { worldId: testingContext.world._id, password: 'testingpassword', username: 'anon' },
                });
                expect(result).toMatchSnapshot({
                    data: {
                        createGame: expect.objectContaining({
                            _id: expect.any(String)
                        })
                    },
                    errors: undefined
                });
            });

            describe('with hosted game', () => {
                let testGame: Game = null;
                const testGamePassword = 'tester1password';
                beforeEach(async () => {
                    const session = await dbEngine.createDatabaseSession();
                    const databaseContext = databaseContextFactory({session});
                    testGame = await gameService.createGame(
                        testingContext.tester1SecurityContext,
                        testingContext.world._id,
                        testGamePassword,
                        'Tester1',
                        databaseContext
                    );
                    await session.commit();
                });

                test('set game map', async () => {
                    const result = await testingContext.server.executeGraphQLQuery({
                        query: SET_GAME_MAP,
                        variables: { gameId: testGame._id, placeId: testingContext.world.wikiPage},
                    });
                    expect(result).toMatchSnapshot({
                        data: {
                            setGameMap: expect.objectContaining({
                                _id: expect.any(String),
                                map: {
                                    _id: expect.any(String),
                                    name: testingContext.world.name,
                                    pixelsPerFoot: expect.any(Number),
                                    mapImage: {
                                        _id: expect.any(String),
                                        width: expect.any(Number),
                                        height: expect.any(Number),
                                        chunks: expect.arrayContaining([
                                            {
                                                _id: expect.any(String),
                                                x: expect.any(Number),
                                                y: expect.any(Number),
                                                fileId: expect.any(String),
                                            }
                                        ])
                                    }
                                }
                            })
                        },
                        errors: undefined
                    });
                });
            });
        });

        describe('while joined in game hosted by tester1', () => {
            let testGame: Game = null;
            const testGamePassword = 'tester1password';
            beforeEach(async () => {
                const session = await dbEngine.createDatabaseSession();
                const databaseContext = databaseContextFactory({session});
                testGame = await gameService.createGame(
                    testingContext.tester1SecurityContext,
                    testingContext.world._id,
                    testGamePassword,
                    'Tester1',
                    databaseContext
                );
                await session.commit();
            });

            describe('as tester2 user', () => {
                beforeEach(() => {
                    testingContext.mockSessionContextFactory.setCurrentUser(testingContext.tester2);
                });

                test('join existing game', async () => {
                    const result = await testingContext.server.executeGraphQLQuery({
                        query: JOIN_GAME,
                        variables: { gameId: testGame._id, password: testGamePassword, characterName: 'Tester2' },
                    });
                    expect(result).toMatchSnapshot({
                        data: {
                            joinGame: expect.objectContaining({
                                _id: expect.any(String),
                                characters: expect.arrayContaining([
                                    expect.objectContaining({
                                        _id: expect.any(String),
                                        name: 'Tester1'
                                    }),
                                    expect.objectContaining({
                                        _id: expect.any(String),
                                        name: 'Tester2'
                                    }),
                                ])
                            })
                        },
                        errors: undefined
                    });
                });

                describe('while having joined a game', () => {
                    beforeEach(async () => {
                        const session = await dbEngine.createDatabaseSession();
                        const databaseContext = databaseContextFactory({session});
                        await gameService.joinGame(testingContext.tester2SecurityContext, testGame._id, testGamePassword, 'Tester2', databaseContext);
                        await session.commit();
                    });

                    test('leave game', async () => {
                        const result = await testingContext.server.executeGraphQLQuery({
                            query: LEAVE_GAME,
                            variables: { gameId: testGame._id},
                        });
                        expect(result).toMatchSnapshot({
                            data: {
                                leaveGame: true
                            },
                            errors: undefined
                        });
                    });

                    test('game chat', async () => {
                        const result = await testingContext.server.executeGraphQLQuery({
                            query: GAME_CHAT,
                            variables: { gameId: testGame._id, message: 'Hello World!'},
                        });
                        expect(result).toMatchSnapshot({
                            data: {
                                gameChat: expect.objectContaining({
                                    _id: expect.any(String)
                                })
                            },
                            errors: undefined
                        });
                    });

                    test('set game map permission denied', async () => {
                        const result = await testingContext.server.executeGraphQLQuery({
                            query: SET_GAME_MAP,
                            variables: { gameId: testGame._id, placeId: testingContext.world.wikiPage},
                        });
                        expect(result).toMatchSnapshot({
                            errors: expect.any(Array)
                        });
                    });
                });
            })
        })
    });
});
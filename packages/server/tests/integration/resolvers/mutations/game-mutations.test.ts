import {container} from "../../../../src/di/inversify";
import {INJECTABLE_TYPES} from "../../../../src/di/injectable-types";
import {DbEngine, Factory} from "../../../../src/types";
import {DatabaseContext} from "../../../../src/dal/database-context";
import {DefaultTestingContext, testGamePassword} from "../../default-testing-context";
import {TEST_INJECTABLE_TYPES} from "../../injectable-types";
import {GameService} from "../../../../src/services/game-service";
import {
    ADD_FOG_STROKE, ADD_MODEL,
    ADD_STROKE,
    CREATE_GAME, DELETE_POSITIONED_MODEL,
    GAME_CHAT,
    JOIN_GAME,
    LEAVE_GAME, SET_CHARACTER_ATTRIBUTES, SET_CHARACTER_ORDER,
    SET_GAME_MAP, SET_MODEL_COLOR, SET_MODEL_POSITION, SET_POSITIONED_MODEL_WIKI
} from "@rpgtools/common/src/gql-mutations";
import fs from "fs";
import {ImageService} from "../../../../src/services/image-service";
import {WikiPageService} from "../../../../src/services/wiki-page-service";
import {ModelService} from "../../../../src/services/model-service";
import {FileUpload} from "graphql-upload";

process.env.TEST_SUITE = "game-mutations-test";

describe("game mutations", () => {
    const gameService = container.get<GameService>(INJECTABLE_TYPES.GameService);
    const databaseContextFactory = container.get<Factory<DatabaseContext>>(INJECTABLE_TYPES.DatabaseContextFactory);
    const dbEngine = container.get<DbEngine>(INJECTABLE_TYPES.DbEngine);
    const testingContext = container.get<DefaultTestingContext>(TEST_INJECTABLE_TYPES.DefaultTestingContext);
    const imageService = container.get<ImageService>(INJECTABLE_TYPES.ImageService);
    const wikiPageService = container.get<WikiPageService>(INJECTABLE_TYPES.WikiPageService);
    const modelService = container.get<ModelService>(INJECTABLE_TYPES.ModelService);

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
        });

        describe('with a game hosted by tester1', () => {
            beforeEach(async () => {
                await testingContext.setupGame();
            });

            describe('as tester1', () => {
                beforeEach(async () => {
                    testingContext.mockSessionContextFactory.setCurrentUser(testingContext.tester1);
                });

                test('set game map', async () => {
                    const filename = "tests/integration/resolvers/mutations/testmap.png";
                    const session = await dbEngine.createDatabaseSession();
                    const databaseContext = databaseContextFactory({session});
                    const mapImage = await imageService.createImage(testingContext.world._id, true, filename, fs.createReadStream(filename), databaseContext);
                    await wikiPageService.updatePlace(testingContext.tester1SecurityContext, testingContext.world.wikiPage, 50, databaseContext, mapImage._id);
                    await session.commit();
                    const result = await testingContext.server.executeGraphQLQuery({
                        query: SET_GAME_MAP,
                        variables: { gameId: testingContext.game._id, placeId: testingContext.world.wikiPage},
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

                test('add stroke', async () => {
                    const result = await testingContext.server.executeGraphQLQuery({
                        query: ADD_STROKE,
                        variables: { gameId: testingContext.game._id, path: [{x:1, y:2, _id: 'asdf'}], type: 'line', size: 5, color: '#ffffff', fill: true, strokeId: 'asdf'},
                    });
                    expect(result).toMatchSnapshot({
                        data: {
                            addStroke: {
                                _id: expect.any(String)
                            },
                        },
                        errors: undefined
                    });
                });

                test('add fog', async () => {
                    const result = await testingContext.server.executeGraphQLQuery({
                        query: ADD_FOG_STROKE,
                        variables: { gameId: testingContext.game._id, path: [{x:1, y:2, _id: 'asdf'}], type: 'line', size: 5, color: '#ffffff', strokeId: 'asdf'},
                    });
                    expect(result).toMatchSnapshot({
                        data: {
                            addFogStroke: {
                                _id: expect.any(String)
                            },
                        },
                        errors: undefined
                    });
                });


                test('add model', async () => {

                    const result = await testingContext.server.executeGraphQLQuery({
                        query: ADD_MODEL,
                        variables: { gameId: testingContext.game._id, modelId: testingContext.model._id, wikiId: testingContext.otherPage._id, color: '#ffffff'},
                    });

                    expect(result).toMatchSnapshot({
                        data: {
                            addModel: {
                                _id: expect.any(String),
                                models: expect.arrayContaining([
                                    expect.objectContaining({
                                        _id: expect.any(String),
                                        model: expect.objectContaining({
                                            _id: expect.any(String)
                                        }),
                                        wiki: expect.objectContaining({
                                            _id: expect.any(String)
                                        })
                                    })
                                ])
                            },
                        },
                        errors: undefined
                    });
                });

                test('set model position', async () => {
                    const result = await testingContext.server.executeGraphQLQuery({
                        query: SET_MODEL_POSITION,
                        variables: {
                            gameId: testingContext.game._id,
                            positionedModelId: testingContext.game.models[0]._id,
                            x: 0,
                            z: 0,
                            lookAtX: 0,
                            lookAtZ:0,
                        },
                    });

                    expect(result).toMatchSnapshot({
                        data: {
                            setModelPosition: expect.objectContaining({
                                _id: expect.any(String),
                                model: expect.objectContaining({
                                    _id: expect.any(String)
                                }),
                                wiki: expect.objectContaining({
                                    _id: expect.any(String)
                                })
                            })
                        },
                        errors: undefined
                    });
                });

                test('set model color', async () => {
                    const result = await testingContext.server.executeGraphQLQuery({
                        query: SET_MODEL_COLOR,
                        variables: {
                            gameId: testingContext.game._id,
                            positionedModelId: testingContext.game.models[0]._id,
                            color: '#000000'
                        },
                    });

                    expect(result).toMatchSnapshot({
                        data: {
                            setModelColor: expect.objectContaining({
                                _id: expect.any(String),
                                model: expect.objectContaining({
                                    _id: expect.any(String)
                                }),
                                wiki: expect.objectContaining({
                                    _id: expect.any(String)
                                })
                            })
                        },
                        errors: undefined
                    });
                });

                test('delete model', async () => {
                    const result = await testingContext.server.executeGraphQLQuery({
                        query: DELETE_POSITIONED_MODEL,
                        variables: {
                            gameId: testingContext.game._id,
                            positionedModelId: testingContext.game.models[0]._id,
                        },
                    });

                    expect(result).toMatchSnapshot({
                        data: {
                            deletePositionedModel: expect.objectContaining({
                                _id: expect.any(String),
                                models: [],
                            })
                        },
                        errors: undefined
                    });
                });

                test('set model wiki', async () => {
                    const result = await testingContext.server.executeGraphQLQuery({
                        query: SET_POSITIONED_MODEL_WIKI,
                        variables: {
                            gameId: testingContext.game._id,
                            positionedModelId: testingContext.game.models[0]._id,
                            wikiId: testingContext.world.wikiPage
                        },
                    });

                    expect(result).toMatchSnapshot({
                        data: {
                            setPositionedModelWiki: expect.objectContaining({
                                _id: expect.any(String),
                                wiki: {
                                    _id: expect.any(String),
                                    name: testingContext.world.name
                                }
                            })
                        },
                        errors: undefined
                    });
                });

                test('set character order', async () => {
                    const session = await dbEngine.createDatabaseSession();
                    const databaseContext = databaseContextFactory({session});
                    await gameService.joinGame(testingContext.tester2SecurityContext, testingContext.game._id, testGamePassword, testingContext.tester2.username, databaseContext);
                    await session.commit();

                    const result = await testingContext.server.executeGraphQLQuery({
                        query: SET_CHARACTER_ORDER,
                        variables: {
                            gameId: testingContext.game._id,
                            characters:[{name: testingContext.tester2.username}, {name: testingContext.tester1.username}]
                        },
                    });

                    expect(result).toMatchSnapshot({
                        data: {
                            setCharacterOrder: expect.objectContaining({
                                _id: expect.any(String),
                                characters: [
                                    expect.objectContaining({
                                        _id: expect.any(String),
                                        name: testingContext.tester2.username
                                    }),
                                    expect.objectContaining({
                                        _id: expect.any(String),
                                        name: testingContext.tester1.username
                                    }),
                                ]
                            })
                        },
                        errors: undefined
                    });
                });

                test('set character attributes', async () => {
                    const result = await testingContext.server.executeGraphQLQuery({
                        query: SET_CHARACTER_ATTRIBUTES,
                        variables: {
                            gameId: testingContext.game._id,
                            attributes:[{name: 'str', value: 1}]
                        },
                    });

                    expect(result).toMatchSnapshot({
                        data: {
                            setCharacterAttributes: expect.objectContaining({
                                _id: expect.any(String),
                                characters: [
                                    expect.objectContaining({
                                        _id: expect.any(String),
                                        name: testingContext.tester1.username,
                                        attributes: [
                                            {
                                                _id: expect.any(String),
                                                name: 'str',
                                                value: 1
                                            }
                                        ]
                                    }),
                                ]
                            })
                        },
                        errors: undefined
                    });
                });
            });

            describe('as tester2 user', () => {
                beforeEach(() => {
                    testingContext.mockSessionContextFactory.setCurrentUser(testingContext.tester2);
                });

                test('join existing game', async () => {
                    const result = await testingContext.server.executeGraphQLQuery({
                        query: JOIN_GAME,
                        variables: { gameId: testingContext.game._id, password: testGamePassword, characterName: 'Tester2' },
                    });
                    expect(result).toMatchSnapshot({
                        data: {
                            joinGame: expect.objectContaining({
                                _id: expect.any(String),
                                characters: expect.arrayContaining([
                                    expect.objectContaining({
                                        _id: expect.any(String),
                                        name: testingContext.tester1.username
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
                        await gameService.joinGame(testingContext.tester2SecurityContext, testingContext.game._id, testGamePassword, testingContext.tester2.username, databaseContext);
                        await session.commit();
                    });

                    test('leave game', async () => {
                        const result = await testingContext.server.executeGraphQLQuery({
                            query: LEAVE_GAME,
                            variables: { gameId: testingContext.game._id},
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
                            variables: { gameId: testingContext.game._id, message: 'Hello World!'},
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
                            variables: { gameId: testingContext.game._id, placeId: testingContext.world.wikiPage},
                        });
                        expect(result).toMatchSnapshot({
                            errors: expect.any(Array)
                        });
                    });

                    test('add stroke permission denied', async () => {
                        const result = await testingContext.server.executeGraphQLQuery({
                            query: ADD_STROKE,
                            variables: { gameId: testingContext.game._id, path: [{x:1, y:2, _id: 'asdf'}], type: 'line', size: 5, color: '#ffffff', fill: true, strokeId: 'asdf'},
                        });
                        expect(result).toMatchSnapshot({
                            errors: expect.any(Array)
                        });
                    });

                    test('add fog permission denied', async () => {
                        const result = await testingContext.server.executeGraphQLQuery({
                            query: ADD_FOG_STROKE,
                            variables: { gameId: testingContext.game._id, path: [{x:1, y:2, _id: 'asdf'}], type: 'line', size: 5, color: '#ffffff', strokeId: 'asdf'},
                        });
                        expect(result).toMatchSnapshot({
                            errors: expect.any(Array)
                        });
                    });

                    test('add model permission denied', async () => {
                        const filename = "tests/integration/resolvers/mutations/pikachu.glb";
                        const testFile: FileUpload = {
                            encoding: "binary",
                            mimetype: "application/gltf",
                            filename: filename,
                            createReadStream: () => fs.createReadStream(filename),
                        };
                        const session = await dbEngine.createDatabaseSession();
                        const databaseContext = databaseContextFactory({session});
                        const testModel = await modelService.createModel(
                            testingContext.tester1SecurityContext,
                            testingContext.world._id,
                            'test model',
                            testFile,
                            2,
                            1,
                            1,
                            "some notes",
                            databaseContext
                        );
                        await session.commit();

                        const result = await testingContext.server.executeGraphQLQuery({
                            query: ADD_MODEL,
                            variables: {
                                gameId: testingContext.game._id,
                                modelId: testModel._id,
                                wikiId: testingContext.otherPage._id,
                                color: '#ffffff'
                            },
                        });

                        expect(result).toMatchSnapshot({
                            errors: expect.any(Array)
                        });
                    });

                    test('set model position permission denied', async () => {
                        const result = await testingContext.server.executeGraphQLQuery({
                            query: SET_MODEL_POSITION,
                            variables: {
                                gameId: testingContext.game._id,
                                positionedModelId: testingContext.game.models[0]._id,
                                x: 0,
                                z: 0,
                                lookAtX: 0,
                                lookAtZ:0,
                            },
                        });

                        expect(result).toMatchSnapshot({
                            errors: expect.any(Array)
                        });
                    });

                    test('set model color permission denied', async () => {
                        const result = await testingContext.server.executeGraphQLQuery({
                            query: SET_MODEL_COLOR,
                            variables: {
                                gameId: testingContext.game._id,
                                positionedModelId: testingContext.game.models[0]._id,
                                color: '#000000'
                            },
                        });

                        expect(result).toMatchSnapshot({
                            errors: expect.any(Array)
                        });
                    });

                    test('delete model permission denied', async () => {
                        const result = await testingContext.server.executeGraphQLQuery({
                            query: DELETE_POSITIONED_MODEL,
                            variables: {
                                gameId: testingContext.game._id,
                                positionedModelId: testingContext.game.models[0]._id,
                            },
                        });

                        expect(result).toMatchSnapshot({
                            errors: expect.any(Array)
                        });
                    });

                    test('set model wiki permission denied', async () => {
                        const result = await testingContext.server.executeGraphQLQuery({
                            query: SET_POSITIONED_MODEL_WIKI,
                            variables: {
                                gameId: testingContext.game._id,
                                positionedModelId: testingContext.game.models[0]._id,
                                wikiId: testingContext.world.wikiPage
                            },
                        });

                        expect(result).toMatchSnapshot({
                            errors: expect.any(Array)
                        });
                    });

                    test('set character order permission denied', async () => {
                        const result = await testingContext.server.executeGraphQLQuery({
                            query: SET_CHARACTER_ORDER,
                            variables: {
                                gameId: testingContext.game._id,
                                characters:[{name: testingContext.tester2.username}, {name: testingContext.tester1.username}]
                            },
                        });

                        expect(result).toMatchSnapshot({
                            errors: expect.any(Array)
                        });
                    });

                    test('set character attributes', async () => {
                        const result = await testingContext.server.executeGraphQLQuery({
                            query: SET_CHARACTER_ATTRIBUTES,
                            variables: {
                                gameId: testingContext.game._id,
                                attributes:[{name: 'str', value: 1}]
                            },
                        });

                        expect(result).toMatchSnapshot({
                            data: {
                                setCharacterAttributes: expect.objectContaining({
                                    _id: expect.any(String),
                                    characters: expect.arrayContaining([
                                        expect.objectContaining({
                                            _id: expect.any(String),
                                            name: testingContext.tester2.username,
                                            attributes: [
                                                {
                                                    _id: expect.any(String),
                                                    name: 'str',
                                                    value: 1
                                                }
                                            ]
                                        }),
                                    ])
                                })
                            },
                            errors: undefined
                        });
                    });
                });
            })
        })
    });
});
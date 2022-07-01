import {defaultTestingContextFactory} from "../../DefaultTestingContextFactory";
import {FileUpload, Upload} from "graphql-upload";
import fs from "fs";
import {ModelApplicationService} from "../../../../src/services/model-application-service";
import {container} from "../../../../src/di/inversify";
import {INJECTABLE_TYPES} from "../../../../src/di/injectable-types";
import {CREATE_MODEL, DELETE_MODEL, UPDATE_MODEL} from "@rpgtools/common/src/gql-mutations";

process.env.TEST_SUITE = "model-mutations-test";

describe("model mutations", () => {
    const modelApplicationService: ModelApplicationService = container.get<ModelApplicationService>(INJECTABLE_TYPES.ModelService);
    let {
        server,
        mockSessionContextFactory,
        otherUser,
        otherUserSecurityContext,
        world,
        testRole,
        currentUser,
        testerSecurityContext,
        newFolder,
        otherPage,
        ...testingContext
    } = defaultTestingContextFactory();

    describe("with world", () => {

        const filename = "tests/integration/resolvers/mutations/pikachu.glb";
        const testFile: FileUpload = {
            encoding: "binary",
            mimetype: "application/gltf",
            filename: filename,
            createReadStream: () => fs.createReadStream(filename),
        };

        const testUpload = new Upload();
        testUpload.file = testFile;
        testUpload.promise = new Promise<FileUpload>((resolve) => {
            resolve(testFile);
        });

        beforeEach(async () => {
            ({
                mockSessionContextFactory,
                otherUser,
                otherUserSecurityContext,
                world,
                testRole,
                currentUser,
                testerSecurityContext,
                newFolder,
                otherPage,
            } = await testingContext.reset());
            mockSessionContextFactory.resetCurrentUser();
        });

        test("create model no permission", async () => {
            const result = await server.executeGraphQLQuery({
                query: CREATE_MODEL,
                variables: {name: "pikachu", file: testUpload, worldId: world._id, depth: 2, width: 1, height: 1, notes: 'pika pika'},
            });
            expect(result).toMatchSnapshot({
                errors: expect.arrayContaining([expect.any(Object)]),
            });
        });

        test("update model no permission", async () => {
            const model = await modelApplicationService.createModel(testerSecurityContext, world._id, "pikachu", testFile, 2, 1, 1, "pika pika");
            const result = await server.executeGraphQLQuery({
                query: UPDATE_MODEL,
                variables: {modelId: model._id, name: "new wiki", file: testUpload, worldId: world._id, depth: 2, width: 1, height: 1, notes: 'pika pika'},
            });
            expect(result).toMatchSnapshot({
                errors: expect.arrayContaining([expect.any(Object)]),
            });
        });

        test("delete model no permission", async () => {
            const model = await modelApplicationService.createModel(testerSecurityContext, world._id, "pikachu", testFile, 2, 1, 1, "pika pika");
            const result = await server.executeGraphQLQuery({
                query: DELETE_MODEL,
                variables: {modelId: model._id},
            });
            expect(result).toMatchSnapshot({
                errors: expect.arrayContaining([expect.any(Object)]),
            });
        });

        describe("with authenticated user", () => {
            beforeEach(async () => {
                mockSessionContextFactory.setCurrentUser(currentUser);
            });

            test("create model", async () => {
                const result = await server.executeGraphQLQuery({
                    query: CREATE_MODEL,
                    variables: {name: "new wiki", file: testUpload, worldId: world._id, depth: 2, width: 1, height: 1, notes: 'pika pika'},
                });
                expect(result).toMatchSnapshot({
                    data: {
                        createModel: {
                            _id: expect.any(String)
                        }
                    },
                    errors: undefined
                });
            });

            test("create two models with same filename", async () => {
                const result = await server.executeGraphQLQuery({
                    query: CREATE_MODEL,
                    variables: {name: "new wiki", file: testUpload, worldId: world._id, depth: 2, width: 1, height: 1, notes: 'pika pika'},
                });
                expect(result).toMatchSnapshot({
                    data: {
                        createModel: {
                            _id: expect.any(String)
                        }
                    },
                    errors: undefined
                });
                const secondResult = await server.executeGraphQLQuery({
                    query: CREATE_MODEL,
                    variables: {name: "new wiki", file: testUpload, worldId: world._id, depth: 2, width: 1, height: 1, notes: 'pika pika'},
                });
                expect(secondResult).toMatchSnapshot({
                    data: {
                        createModel: {
                            _id: expect.any(String)
                        }
                    },
                    errors: undefined
                });
            });

            test("update model", async () => {
                const model = await modelApplicationService.createModel(testerSecurityContext, world._id, "pikachu", testFile, 2, 1, 1, "pika pika");
                const result = await server.executeGraphQLQuery({
                    query: UPDATE_MODEL,
                    variables: {modelId: model._id, name: "new wiki", file: testUpload, worldId: world._id, depth: 2, width: 1, height: 1, notes: 'pika pika'},
                });
                expect(result).toMatchSnapshot({
                    data: {
                        updateModel: {
                            _id: expect.any(String),
                            fileId: expect.any(String),
                            accessControlList: expect.arrayContaining([
                                expect.objectContaining({
                                    _id: expect.any(String),
                                    subject: {
                                        _id: expect.any(String),
                                    },
                                    users: expect.arrayContaining([
                                        expect.objectContaining({
                                            _id: expect.any(String),
                                        })
                                    ]),
                                })
                            ])
                        }
                    },
                    errors: undefined
                });
            });

            test("delete model", async () => {
                const model = await modelApplicationService.createModel(testerSecurityContext, world._id, "pikachu", testFile, 2, 1, 1, "pika pika");
                const result = await server.executeGraphQLQuery({
                    query: DELETE_MODEL,
                    variables: {modelId: model._id},
                });
                expect(result).toMatchSnapshot({
                    data: {
                        deleteModel: {
                            _id: expect.any(String)
                        }
                    },
                    errors: undefined
                });
            });
        });
    });
});

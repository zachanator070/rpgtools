import {DefaultTestingContext} from "../../default-testing-context";
import {FileUpload, Upload} from "graphql-upload";
import fs from "fs";
import {ModelService} from "../../../../src/services/model-service";
import {container} from "../../../../src/di/inversify";
import {INJECTABLE_TYPES} from "../../../../src/di/injectable-types";
import {CREATE_MODEL, DELETE_MODEL, UPDATE_MODEL} from "@rpgtools/common/src/gql-mutations";
import {DbEngine} from "../../../../src/types";
import {TEST_INJECTABLE_TYPES} from "../../injectable-types";
import {accessControlList} from "../common-testing-assertions";

process.env.TEST_SUITE = "model-mutations-test";

describe("model mutations", () => {
    const modelApplicationService: ModelService = container.get<ModelService>(INJECTABLE_TYPES.ModelService);
    const dbEngine = container.get<DbEngine>(INJECTABLE_TYPES.DbEngine);
    const testingContext = container.get<DefaultTestingContext>(TEST_INJECTABLE_TYPES.DefaultTestingContext);

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
            await testingContext.reset();
            testingContext.mockSessionContextFactory.useAnonUser();
        });

        test("create model no permission", async () => {
            const result = await testingContext.server.executeGraphQLQuery({
                query: CREATE_MODEL,
                variables: {name: "pikachu", file: testUpload, worldId: testingContext.world._id, depth: 2, width: 1, height: 1, notes: 'pika pika'},
            });
            expect(result).toMatchSnapshot({
                errors: expect.arrayContaining([expect.any(Object)]),
            });
        });

        test("update model no permission", async () => {
            const databaseContext = await dbEngine.createDatabaseContext();
            const model = await modelApplicationService.createModel(testingContext.tester1SecurityContext, testingContext.world._id, "pikachu", testFile, 2, 1, 1, "pika pika", databaseContext);
            const result = await testingContext.server.executeGraphQLQuery({
                query: UPDATE_MODEL,
                variables: {modelId: model._id, name: "new wiki", file: testUpload, worldId: testingContext.world._id, depth: 2, width: 1, height: 1, notes: 'pika pika'},
            });
            expect(result).toMatchSnapshot({
                errors: expect.arrayContaining([expect.any(Object)]),
            });
        });

        test("delete model no permission", async () => {
            const databaseContext = await dbEngine.createDatabaseContext();
            const model = await modelApplicationService.createModel(testingContext.tester1SecurityContext, testingContext.world._id, "pikachu", testFile, 2, 1, 1, "pika pika", databaseContext);
            const result = await testingContext.server.executeGraphQLQuery({
                query: DELETE_MODEL,
                variables: {modelId: model._id},
            });
            expect(result).toMatchSnapshot({
                errors: expect.arrayContaining([expect.any(Object)]),
            });
        });

        describe("with authenticated user", () => {
            beforeEach(async () => {
                testingContext.mockSessionContextFactory.setCurrentUser(testingContext.currentUser);
            });

            test("create model", async () => {
                const result = await testingContext.server.executeGraphQLQuery({
                    query: CREATE_MODEL,
                    variables: {name: "new wiki", file: testUpload, worldId: testingContext.world._id, depth: 2, width: 1, height: 1, notes: 'pika pika'},
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
                const result = await testingContext.server.executeGraphQLQuery({
                    query: CREATE_MODEL,
                    variables: {name: "new wiki", file: testUpload, worldId: testingContext.world._id, depth: 2, width: 1, height: 1, notes: 'pika pika'},
                });
                expect(result).toMatchSnapshot({
                    data: {
                        createModel: {
                            _id: expect.any(String)
                        }
                    },
                    errors: undefined
                });
                const secondResult = await testingContext.server.executeGraphQLQuery({
                    query: CREATE_MODEL,
                    variables: {name: "new wiki", file: testUpload, worldId: testingContext.world._id, depth: 2, width: 1, height: 1, notes: 'pika pika'},
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
                const databaseContext = await dbEngine.createDatabaseContext();
                const model = await modelApplicationService.createModel(testingContext.tester1SecurityContext, testingContext.world._id, "pikachu", testFile, 2, 1, 1, "pika pika", databaseContext);
                const result = await testingContext.server.executeGraphQLQuery({
                    query: UPDATE_MODEL,
                    variables: {modelId: model._id, name: "new wiki", file: testUpload, worldId: testingContext.world._id, depth: 2, width: 1, height: 1, notes: 'pika pika'},
                });
                expect(result).toMatchSnapshot({
                    data: {
                        updateModel: {
                            _id: expect.any(String),
                            fileId: expect.any(String),
                            accessControlList: accessControlList
                        }
                    },
                    errors: undefined
                });
            });

            test("delete model", async () => {
                const databaseContext = await dbEngine.createDatabaseContext();
                const model = await modelApplicationService.createModel(testingContext.tester1SecurityContext, testingContext.world._id, "pikachu", testFile, 2, 1, 1, "pika pika", databaseContext);
                const result = await testingContext.server.executeGraphQLQuery({
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

import {defaultTestingContextFactory} from "../../DefaultTestingContextFactory";
import {CREATE_MODEL} from "../../../../../frontend/src/hooks/model/useCreateModel";

process.env.TEST_SUITE = "model-mutations-test";

describe("model mutations", () => {
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
                variables: {name: "new wiki", folderId: world.rootFolder.toString()},
            });
            expect(result).toMatchSnapshot({
                errors: expect.arrayContaining([expect.any(Object)]),
            });
        });
    });
});

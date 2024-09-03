import {container, bindAll} from "../../../src/di/inversify";
import {DbEngine} from "../../../src/types";
import {INJECTABLE_TYPES} from "../../../src/di/injectable-types";
import {AuthenticationService} from "../../../src/services/authentication-service";
import UserFactory from "../../../src/domain-entities/factory/user-factory";
import InMemoryDbEngine from "../../../src/dal/in-memory/in-memory-db-engine";

bindAll()

describe("AuthenticationApplicationService test", () => {
    const service = container.get<AuthenticationService>(INJECTABLE_TYPES.AuthenticationService);
    const userFactory = container.get<UserFactory>(INJECTABLE_TYPES.UserFactory);
    container.rebind<DbEngine>(INJECTABLE_TYPES.DbEngine).to(InMemoryDbEngine);
    const dbEngine = container.get<DbEngine>(INJECTABLE_TYPES.DbEngine);
    test("decode token", async () => {
        const user = userFactory.build({email: "user email", username: "username", password: "password", tokenVersion: "1234", currentWorld: null, roles: []});
        const databaseContext = await dbEngine.createDatabaseContext();
        await databaseContext.userRepository.create(user);
        const tokens = await service.createTokens(user, "1234", databaseContext);
        const decodedUser = await service.getUserFromAccessToken(tokens.accessToken, databaseContext);
        expect(decodedUser).not.toBeNull();
        expect(decodedUser._id).toBe(user._id);
    });
});
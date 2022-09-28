import {container} from "../../../src/di/inversify";
import {DbEngine} from "../../../src/types";
import {INJECTABLE_TYPES} from "../../../src/di/injectable-types";
import {InMemoryUserRepository} from "../../../src/dal/in-memory/repositories/in-memory-user-repository";
import {Factory} from "../../../src/types";
import {AuthenticationService} from "../../../src/services/authentication-service";
import {UserRepository} from "../../../src/dal/repository/user-repository";
import {DatabaseContext} from "../../../src/dal/database-context";
import UserFactory from "../../../src/domain-entities/factory/user-factory";

describe("AuthenticationApplicationService test", () => {
    const service = container.get<AuthenticationService>(INJECTABLE_TYPES.AuthenticationService);
    const userFactory = container.get<UserFactory>(INJECTABLE_TYPES.UserFactory);
    container.rebind<UserRepository>(INJECTABLE_TYPES.UserRepository).to(InMemoryUserRepository);
    const databaseContextFactory = container.get<Factory<DatabaseContext>>(INJECTABLE_TYPES.DatabaseContextFactory);
    const dbEngine = container.get<DbEngine>(INJECTABLE_TYPES.DbEngine);
    test("decode token", async () => {
        const user = userFactory.build({_id: null, email: "user email", username: "username", password: "password", tokenVersion: "1234", currentWorld: null, roles: []});
        const session = await dbEngine.createDatabaseSession();
        const databaseContext = databaseContextFactory({session});
        await databaseContext.userRepository.create(user);
        const tokens = await service.createTokens(user, "1234", databaseContext);
        const decodedUser = await service.getUserFromAccessToken(tokens.accessToken, databaseContext);
        await session.commit();
        expect(decodedUser).not.toBeNull();
        expect(decodedUser._id).toBe(user._id);
    });
});
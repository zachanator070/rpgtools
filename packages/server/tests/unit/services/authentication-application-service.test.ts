import {container} from "../../../src/inversify";
import {AuthenticationService, UnitOfWork, UserFactory, UserRepository} from "../../../src/types";
import {INJECTABLE_TYPES} from "../../../src/injectable-types";
import {InMemoryUserRepository} from "../../../src/dal/in-memory/repositories/in-memory-user-repository";
import {Factory} from "../../../src/types";

describe("AuthenticationApplicationService test", () => {
    const service = container.get<AuthenticationService>(INJECTABLE_TYPES.AuthenticationService);
    const userFactory = container.get<UserFactory>(INJECTABLE_TYPES.UserFactory);
    container.rebind<UserRepository>(INJECTABLE_TYPES.UserRepository).to(InMemoryUserRepository);
    const unitOfWorkFactory = container.get<Factory<UnitOfWork>>(INJECTABLE_TYPES.DbUnitOfWorkFactory);
    const unitOfWork = unitOfWorkFactory();
    test("decode token", async () => {
        const user = userFactory(null, "user email", "username", "password", "1234", null, [], []);
        await unitOfWork.userRepository.create(user);
        const tokens = await service.createTokens(user, "1234", unitOfWork);
        const decodedUser = await service.getUserFromAccessToken(tokens.accessToken, unitOfWork);
        expect(decodedUser).not.toBeNull();
        expect(decodedUser._id).toBe(user._id);
    });
});
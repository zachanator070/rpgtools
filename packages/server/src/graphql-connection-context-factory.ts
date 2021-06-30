import jwt from "jsonwebtoken";
import { ANON_USERNAME } from "../../common/src/permission-constants";
import { inject } from "inversify";
import { INJECTABLE_TYPES } from "./injectable-types";
import { ACCESS_TOKEN_MAX_AGE } from "./services/authentication-application-service";
import { AuthenticationService, UserFactory, UserRepository } from "./types";
import { v4 as uuidv4 } from "uuid";
import { User } from "./domain-entities/user";

export class GraphqlConnectionContextFactory {
	@inject(INJECTABLE_TYPES.AuthenticationService)
	authenticationService: AuthenticationService;

	@inject(INJECTABLE_TYPES.UserRepository)
	userRepository: UserRepository;

	@inject(INJECTABLE_TYPES.UserFactory)
	userFactory: UserFactory;

	create = async (connectionParams: any, webSocket: any) => {
		let currentUser = null;
		if (connectionParams.accessToken) {
			let data: any = jwt.verify(connectionParams.accessToken, process.env["ACCESS_TOKEN_SECRET"], {
				maxAge: ACCESS_TOKEN_MAX_AGE.string,
			});
			currentUser = await this.userRepository.findById(data.userId);
		} else {
			currentUser = this.userFactory(uuidv4(), "", ANON_USERNAME, "", "", null, [], []);
		}
		return { currentUser };
	};
}

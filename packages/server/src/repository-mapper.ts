import { ArticleRepository, DomainEntity, Repository } from "./types";
import {
	ARTICLE,
	CHUNK,
	FILE,
	GAME,
	IMAGE,
	ITEM,
	MODEL,
	MONSTER,
	PERMISSION_ASSIGNMENT,
	PERSON,
	PIN,
	PLACE,
	ROLE,
	SERVER_CONFIG,
	USER,
	WIKI_FOLDER,
	WIKI_PAGE,
	WORLD,
} from "../../common/src/type-constants";
import { container } from "./inversify.config";
import { INJECTABLE_TYPES } from "./injectable-types";

export class RepositoryMapper {
	public map<T extends DomainEntity>(type: string): Repository<T> {
		switch (type) {
			case ARTICLE:
				return container.get<Repository<T>>(INJECTABLE_TYPES.ArticleRepository);
			case PLACE:
				return container.get<Repository<T>>(INJECTABLE_TYPES.PlaceRepository);
			case ITEM:
				return container.get<Repository<T>>(INJECTABLE_TYPES.ItemRepository);
			case PERSON:
				return container.get<Repository<T>>(INJECTABLE_TYPES.PersonRepository);
			case MONSTER:
				return container.get<Repository<T>>(INJECTABLE_TYPES.MonsterRepository);
			case GAME:
				return container.get<Repository<T>>(INJECTABLE_TYPES.GameRepository);
			case FILE:
				return container.get<Repository<T>>(INJECTABLE_TYPES.FileRepository);
			case IMAGE:
				return container.get<Repository<T>>(INJECTABLE_TYPES.ImageRepository);
			case CHUNK:
				return container.get<Repository<T>>(INJECTABLE_TYPES.ChunkRepository);
			case ROLE:
				return container.get<Repository<T>>(INJECTABLE_TYPES.RoleRepository);
			case PERMISSION_ASSIGNMENT:
				return container.get<Repository<T>>(INJECTABLE_TYPES.PermissionAssignmentRepository);
			case PIN:
				return container.get<Repository<T>>(INJECTABLE_TYPES.PinRepository);
			case SERVER_CONFIG:
				return container.get<Repository<T>>(INJECTABLE_TYPES.ServerConfigRepository);
			case WORLD:
				return container.get<Repository<T>>(INJECTABLE_TYPES.WorldRepository);
			case USER:
				return container.get<Repository<T>>(INJECTABLE_TYPES.UserRepository);
			case WIKI_FOLDER:
				return container.get<Repository<T>>(INJECTABLE_TYPES.WikiFolderRepository);
			case WIKI_PAGE:
				return container.get<Repository<T>>(INJECTABLE_TYPES.WikiPageRepository);
			case MODEL:
				return container.get<Repository<T>>(INJECTABLE_TYPES.ModelRepository);
		}
	}
}

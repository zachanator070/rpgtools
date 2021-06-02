import {
	ArticleRepository,
	ChunkRepository,
	DomainEntity,
	FileRepository,
	GameRepository,
	ImageRepository,
	ItemRepository,
	ModelRepository,
	MonsterRepository,
	PermissionAssignmentRepository,
	PersonRepository,
	PinRepository,
	PlaceRepository,
	Repository,
	RoleRepository,
	ServerConfigRepository,
	UnitOfWork,
	UserRepository,
	WikiFolderRepository,
	WikiPageRepository,
	WorldRepository,
} from "../../types";
import { WikiPage } from "../../domain-entities/wiki-page";
import { InMemoryArticleRepository } from "../in-memory/repositories/in-memory-article-repository";
import { InMemoryChunkRepository } from "../in-memory/repositories/in-memory-chunk-repository";
import { InMemoryGameRepository } from "../in-memory/repositories/in-memory-game-repository";
import { InMemoryImageRepository } from "../in-memory/repositories/in-memory-image-repository";
import { InMemoryItemRepository } from "../in-memory/repositories/in-memory-item-repository";
import { InMemoryModelRepository } from "../in-memory/repositories/in-memory-model-repository";
import { InMemoryMonsterRepository } from "../in-memory/repositories/in-memory-monster-repository";
import { InMemoryPermissionAssignmentRepository } from "../in-memory/repositories/in-memory-permission-assignment-repository";
import { InMemoryPersonRepository } from "../in-memory/repositories/in-memory-person-repository";
import { InMemoryPinRepository } from "../in-memory/repositories/in-memory-pin-repository";
import { InMemoryPlaceRepository } from "../in-memory/repositories/in-memory-place-repository";
import { InMemoryRoleRepository } from "../in-memory/repositories/in-memory-role-repository";
import { InMemoryServerConfigRepository } from "../in-memory/repositories/in-memory-server-config-repository";
import { InMemoryUserRepository } from "../in-memory/repositories/in-memory-user-repository";
import { InMemoryWikiFolderRepository } from "../in-memory/repositories/in-memory-wiki-folder-repository";
import { InMemoryWikiPageRepository } from "../in-memory/repositories/in-memory-wiki-page-repository";
import { InMemoryWorldRepository } from "../in-memory/repositories/in-memory-world-repository";
import { FilterCondition } from "../filter-condition";
import archiver from "archiver";
import { Readable, Writable } from "stream";
import { InMemoryFileRepository } from "../in-memory/repositories/in-memory-file-repository";
import {
	ARTICLE,
	CHUNK,
	FILE,
	IMAGE,
	ITEM,
	MODEL,
	MONSTER,
	PERSON,
	PLACE,
	WIKI_FOLDER,
	WORLD,
} from "../../../../common/src/type-constants";
import { Model } from "../../domain-entities/model";
import { Chunk } from "../../domain-entities/chunk.";
import { World } from "../../domain-entities/world";
import { Article } from "../../domain-entities/article";
import { Image } from "../../domain-entities/image";
import { InMemoryUnitOfWork } from "../in-memory/in-memory-unit-of-work";

export class ZipArchiveUnitOfWork extends InMemoryUnitOfWork {
	archive = archiver("zip", {
		zlib: { level: 9 }, // Sets the compression level.
	});

	constructor(outputStream: Writable) {
		super();
		this.archive.on("warning", function (err) {
			if (err.code === "ENOENT") {
				console.error(err.message);
			} else {
				// throw error
				throw err;
			}
		});

		this.archive.on("error", function (err) {
			throw err;
		});

		this.archive.pipe(outputStream);
	}

	private getWikiPagePath = async (page: WikiPage): Promise<string> => {
		let path = "wikis/";
		let parent = await this.wikiFolderRepository.findOne([new FilterCondition("pages", page._id)]);
		const world = await this.worldRepository.findById(page.world);
		while (parent._id !== world.rootFolder) {
			path += parent.name + "/";
			parent = await this.wikiFolderRepository.findOne([
				new FilterCondition("children", parent._id),
			]);
		}
		return path;
	};

	private addArchiveEntry = async (stream: Readable, path: string) => {
		this.archive.append(stream, { name: path });
	};

	private dumpRepo = async <T extends DomainEntity>(
		repo: Repository<T>,
		entityType: string,
		getPath: (entity: T) => Promise<string>
	): Promise<void> => {
		for (let page of await repo.find([])) {
			const path: string = await getPath(page);
			await this.addArchiveEntry(
				Readable.from([JSON.stringify(page)]),
				`${path}/${entityType}.${page._id}.json`
			);
		}
	};

	commit = async (): Promise<void> => {
		await this.dumpRepo<Article>(this.articleRepository, ARTICLE, this.getWikiPagePath);
		await this.dumpRepo(this.chunkRepository, CHUNK, async (entity: Chunk) => "chunks");
		for (let file of await this.fileRepository.find([])) {
			await this.addArchiveEntry(file.readStream, `files/${FILE}.${file._id}.json`);
		}
		await this.dumpRepo(this.itemRepository, ITEM, this.getWikiPagePath);
		await this.dumpRepo<Image>(this.imageRepository, IMAGE, async (entity: Image) => "images");
		await this.dumpRepo(this.modelRepository, MODEL, async (entity: Model) => "models");
		await this.dumpRepo(this.monsterRepository, MONSTER, this.getWikiPagePath);
		await this.dumpRepo(this.personRepository, PERSON, this.getWikiPagePath);
		await this.dumpRepo(this.placeRepository, PLACE, this.getWikiPagePath);
		await this.dumpRepo(this.wikiFolderRepository, WIKI_FOLDER, this.getWikiPagePath);
		await this.dumpRepo(this.worldRepository, WORLD, async (entity: World) => "worlds");

		await this.archive.finalize();
	};
}

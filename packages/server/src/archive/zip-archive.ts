import {
	Archive,
	ArticleRepository,
	ChunkRepository,
	DomainEntity,
	FileRepository,
	GameRepository,
	ImageRepository,
	ItemRepository,
	ModelRepository,
	MonsterRepository,
	PersonRepository,
	PinRepository,
	PlaceRepository,
	Repository,
	RoleRepository,
	ServerConfigRepository,
	UserRepository,
	WikiFolderRepository,
	WikiPageRepository,
	WorldRepository,
} from "../types";
import { WikiPage } from "../domain-entities/wiki-page";
import {FILTER_CONDITION_OPERATOR_IN, FilterCondition} from "../dal/filter-condition";
import archiver from "archiver";
import { Readable, Writable } from "stream";
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
	WORLD,
} from "@rpgtools/common/src/type-constants";
import { Model } from "../domain-entities/model";
import { Chunk } from "../domain-entities/chunk";
import { World } from "../domain-entities/world";
import { Article } from "../domain-entities/article";
import { Image } from "../domain-entities/image";
import {inject, injectable} from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";

@injectable()
export class ZipArchive implements Archive {
	@inject(INJECTABLE_TYPES.ArchiveArticleRepository)
	articleRepository: ArticleRepository;
	@inject(INJECTABLE_TYPES.ArchiveChunkRepository)
	chunkRepository: ChunkRepository;
	@inject(INJECTABLE_TYPES.ArchiveFileRepository)
	fileRepository: FileRepository;
	@inject(INJECTABLE_TYPES.ArchiveGameRepository)
	gameRepository: GameRepository;
	@inject(INJECTABLE_TYPES.ArchiveImageRepository)
	imageRepository: ImageRepository;
	@inject(INJECTABLE_TYPES.ArchiveImageRepository)
	itemRepository: ItemRepository;
	@inject(INJECTABLE_TYPES.ArchiveModelRepository)
	modelRepository: ModelRepository;
	@inject(INJECTABLE_TYPES.ArchiveMonsterRepository)
	monsterRepository: MonsterRepository;
	@inject(INJECTABLE_TYPES.ArchivePersonRepository)
	personRepository: PersonRepository;
	@inject(INJECTABLE_TYPES.ArchivePinRepository)
	pinRepository: PinRepository;
	@inject(INJECTABLE_TYPES.ArchivePlaceRepository)
	placeRepository: PlaceRepository;
	@inject(INJECTABLE_TYPES.ArchiveRoleRepository)
	roleRepository: RoleRepository;
	@inject(INJECTABLE_TYPES.ArchiveServerConfigRepository)
	serverConfigRepository: ServerConfigRepository;
	@inject(INJECTABLE_TYPES.ArchiveUserRepository)
	userRepository: UserRepository;
	@inject(INJECTABLE_TYPES.ArchiveWikiFolderRepository)
	wikiFolderRepository: WikiFolderRepository;
	@inject(INJECTABLE_TYPES.ArchiveWikiPageRepository)
	wikiPageRepository: WikiPageRepository;
	@inject(INJECTABLE_TYPES.ArchiveWorldRepository)
	worldRepository: WorldRepository;

	archive = archiver("zip", {
		zlib: { level: 9 }, // Sets the compression level.
	});

	constructor() {
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
	}

	pipe = async (output: Writable): Promise<void> => {
		this.archive.pipe(output);
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
		await this.dumpRepo(this.worldRepository, WORLD, async (entity: World) => "worlds");

		await this.archive.finalize();
	};

	private getWikiPagePath = async (page: WikiPage): Promise<string> => {
		let path = "";
		let parent = await this.wikiFolderRepository.findOne([new FilterCondition("pages", page._id, FILTER_CONDITION_OPERATOR_IN)]);
		while (parent) {
			path = parent.name + '/' + path;
			parent = await this.wikiFolderRepository.findOne([
				new FilterCondition("children", parent._id, FILTER_CONDITION_OPERATOR_IN),
			]);
		}
		path = path.substring(0, path.length - 1 );
		return 'wikis/' + path;
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
			delete page.authorizationPolicy;
			await this.addArchiveEntry(
				Readable.from([JSON.stringify(page)]),
				`${path}/${entityType}.${page._id}.json`
			);
		}
	};
}

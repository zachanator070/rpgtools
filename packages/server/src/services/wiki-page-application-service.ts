import { inject, injectable } from "inversify";
import { SecurityContext } from "../security/security-context";
import { ARTICLE, ITEM, MONSTER, PERSON, PLACE } from "../../../common/src/type-constants";
import { WIKI_ADMIN, WIKI_RW } from "../../../common/src/permission-constants";
import { DbUnitOfWork } from "../dal/db-unit-of-work";
import { WikiFolderAuthorizationRuleset } from "../security/ruleset/wiki-folder-authorization-ruleset";
import { WikiPageAuthorizationRuleset } from "../security/ruleset/wiki-page-authorization-ruleset";
import { Readable } from "stream";
import {FILTER_CONDITION_OPERATOR_IN, FILTER_CONDITION_REGEX, FilterCondition} from "../dal/filter-condition";
import {
	ArticleFactory,
	AuthorizationService,
	Factory,
	FileFactory,
	ItemFactory,
	MonsterFactory,
	PermissionAssignmentFactory,
	PersonFactory,
	PlaceFactory,
	WikiFolderRepository,
	WikiPageRepository,
	WikiPageService, WorldRepository,
} from "../types";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import { ModeledPage } from "../domain-entities/modeled-page";
import { WikiPage } from "../domain-entities/wiki-page";
import { PaginatedResult } from "../dal/paginated-result";
import { RepositoryMapper } from "../dal/repository-mapper";

@injectable()
export class WikiPageApplicationService implements WikiPageService {
	@inject(INJECTABLE_TYPES.WikiFolderAuthorizationRuleset)
	wikiFolderAuthorizationRuleset: WikiFolderAuthorizationRuleset;
	@inject(INJECTABLE_TYPES.WikiPageAuthorizationRuleset)
	wikiPageAuthorizationRuleset: WikiPageAuthorizationRuleset;

	@inject(INJECTABLE_TYPES.AuthorizationService)
	authorizationService: AuthorizationService;

	@inject(INJECTABLE_TYPES.WikiPageRepository)
	wikiPageRepository: WikiPageRepository;
	@inject(INJECTABLE_TYPES.WikiFolderRepository)
	wikiFolderRepository: WikiFolderRepository;

	@inject(INJECTABLE_TYPES.DbUnitOfWorkFactory)
	dbUnitOfWorkFactory: Factory<DbUnitOfWork>;

	@inject(INJECTABLE_TYPES.ArticleFactory)
	articleFactory: ArticleFactory;
	@inject(INJECTABLE_TYPES.ItemFactory)
	itemFactory: ItemFactory;
	@inject(INJECTABLE_TYPES.MonsterFactory)
	monsterFactory: MonsterFactory;
	@inject(INJECTABLE_TYPES.PersonFactory)
	personFactory: PersonFactory;
	@inject(INJECTABLE_TYPES.PlaceFactory)
	placeFactory: PlaceFactory;
	@inject(INJECTABLE_TYPES.PermissionAssignmentFactory)
	permissionAssignmentFactory: PermissionAssignmentFactory;
	@inject(INJECTABLE_TYPES.FileFactory)
	fileFactory: FileFactory;
	@inject(INJECTABLE_TYPES.WorldRepository)
	worldRepository: WorldRepository;

	@inject(INJECTABLE_TYPES.RepositoryMapper)
	mapper: RepositoryMapper;

	createWiki = async (context: SecurityContext, name: string, folderId: string) => {
		const unitOfWork = this.dbUnitOfWorkFactory();
		const folder = await unitOfWork.wikiFolderRepository.findById(folderId);
		if (!folder) {
			throw new Error("Folder does not exist");
		}

		if (!(await this.wikiPageAuthorizationRuleset.canCreate(context, folder))) {
			throw new Error(`You do not have permission to write to the folder ${folderId}`);
		}

		const newPage = this.articleFactory(null, name, folder.world, null, null);
		await unitOfWork.articleRepository.create(newPage);
		folder.pages.push(newPage._id);
		await unitOfWork.wikiFolderRepository.update(folder);

		const readPermission = this.permissionAssignmentFactory(null, WIKI_RW, newPage._id, ARTICLE);
		await unitOfWork.permissionAssignmentRepository.create(readPermission);
		context.user.permissions.push(readPermission._id);
		context.permissions.push(readPermission);
		const adminPermission = this.permissionAssignmentFactory(
			null,
			WIKI_ADMIN,
			newPage._id,
			ARTICLE
		);
		await unitOfWork.permissionAssignmentRepository.create(adminPermission);
		context.user.permissions.push(adminPermission._id);
		context.permissions.push(adminPermission);
		await unitOfWork.userRepository.update(context.user);

		await unitOfWork.commit();
		return folder;
	};

	updateWiki = async (
		context: SecurityContext,
		wikiId: string,
		readStream?: Readable,
		name?: string,
		coverImageId?: string,
		type?: string
	) => {
		const unitOfWork = this.dbUnitOfWorkFactory();
		let wikiPage = await unitOfWork.wikiPageRepository.findById(wikiId);
		if (!wikiPage) {
			throw new Error(`Wiki ${wikiId} does not exist`);
		}
		if (!(await this.wikiPageAuthorizationRuleset.canWrite(context, wikiPage))) {
			throw new Error("You do not have permission to write to this page");
		}

		if (readStream) {
			let contentFile = await unitOfWork.fileRepository.findById(wikiPage.contentId);

			if (contentFile) {
				await unitOfWork.fileRepository.delete(contentFile);
			}

			contentFile = this.fileFactory(
				null,
				`wikiContent.${wikiPage._id}.json`,
				readStream,
				"application/json"
			);
			await unitOfWork.fileRepository.create(contentFile);
			wikiPage.contentId = contentFile._id.toString();

		}

		if (name) {
			wikiPage.name = name;
		}

		if (coverImageId) {
			const image = await unitOfWork.imageRepository.findById(coverImageId);
			if (!image) {
				throw new Error(`No image exists with id ${coverImageId}`);
			}
		}
		wikiPage.coverImage = coverImageId;

		/** TODO: This section probably will break,
		 * I'm thinking a type attribute will need to be introduced so that the wikipage repository knows what to do with it
		 **/
		if (type) {
			switch (type) {
				case PERSON:
					wikiPage = this.personFactory(
						wikiPage._id,
						wikiPage.name,
						wikiPage.world,
						wikiPage.coverImage,
						wikiPage.contentId,
						null,
						null
					);
					break;
				case PLACE:
					wikiPage = this.placeFactory(
						wikiPage._id,
						wikiPage.name,
						wikiPage.world,
						wikiPage.coverImage,
						wikiPage.contentId,
						null,
						0
					);
					break;
				case ARTICLE:
					wikiPage = this.articleFactory(
						wikiPage._id,
						wikiPage.name,
						wikiPage.world,
						wikiPage.coverImage,
						wikiPage.contentId
					);
					break;
				case ITEM:
					wikiPage = this.itemFactory(
						wikiPage._id,
						wikiPage.name,
						wikiPage.world,
						wikiPage.coverImage,
						wikiPage.contentId,
						null,
						null
					);
					break;
				case MONSTER:
					wikiPage = this.monsterFactory(
						wikiPage._id,
						wikiPage.name,
						wikiPage.world,
						wikiPage.coverImage,
						wikiPage.contentId,
						null,
						null
					);
					break;
			}
		}

		await unitOfWork.wikiPageRepository.update(wikiPage);
		await unitOfWork.commit();
		return wikiPage;
	};

	deleteWiki = async (context: SecurityContext, wikiId: string) => {
		const unitOfWork = this.dbUnitOfWorkFactory();
		const wikiPage = await unitOfWork.wikiPageRepository.findById(wikiId);
		if (!wikiPage) {
			throw new Error("Page does not exist");
		}

		if (!(await this.wikiPageAuthorizationRuleset.canWrite(context, wikiPage))) {
			throw new Error("You do not have permission to write to this page");
		}

		const world = await unitOfWork.worldRepository.findOne([
			new FilterCondition("wikiPage", wikiId),
		]);
		if (world) {
			throw new Error("You cannot delete the main page of a world");
		}

		const parentFolder = await unitOfWork.wikiFolderRepository.findOne([
			new FilterCondition("pages", wikiPage._id),
		]);

		if (parentFolder) {
			parentFolder.pages = parentFolder.pages.filter((page) => page !== wikiPage._id);
			await unitOfWork.wikiFolderRepository.update(parentFolder);
		}

		await this.authorizationService.cleanUpPermissions(wikiPage._id, unitOfWork);
		await unitOfWork.wikiPageRepository.delete(wikiPage);
		await unitOfWork.commit();
		return await unitOfWork.worldRepository.findById(wikiPage.world);
	};

	updatePlace = async (
		context: SecurityContext,
		placeId: string,
		pixelsPerFoot: number,
		mapImageId?: string
	) => {
		const unitOfWork = this.dbUnitOfWorkFactory();
		const place = await unitOfWork.placeRepository.findById(placeId);
		if (!place) {
			throw new Error(`Place ${placeId} does not exist`);
		}

		if (!(await this.wikiPageAuthorizationRuleset.canWrite(context, place))) {
			throw new Error(`You do not have permission to write to this page`);
		}

		if (mapImageId) {
			const image = await unitOfWork.imageRepository.findById(mapImageId);
			if (!image) {
				throw new Error(`Image with id ${mapImageId} does not exist`);
			}
		}

		place.mapImage = mapImageId;
		place.pixelsPerFoot = pixelsPerFoot;
		await unitOfWork.placeRepository.update(place);
		await unitOfWork.commit();
		return place;
	};

	updateModeledWiki = async (
		context: SecurityContext,
		wikiId: string,
		model: string,
		color: string
	) => {
		const unitOfWork = this.dbUnitOfWorkFactory();
		let wikiPage: ModeledPage = await unitOfWork.wikiPageRepository.findById(wikiId) as ModeledPage;
		if (!wikiPage) {
			throw new Error(`Wiki ${wikiId} does not exist`);
		}
		if (!(await this.wikiPageAuthorizationRuleset.canWrite(context, wikiPage))) {
			throw new Error("You do not have permission to write to this page");
		}
		const foundModel = await unitOfWork.modelRepository.findById(model);
		if (model && !foundModel) {
			throw new Error(`Model ${model} does not exist`);
		}
		wikiPage.model = model;
		wikiPage.modelColor = color;
		await unitOfWork.wikiPageRepository.update(wikiPage);
		await unitOfWork.commit();
		return wikiPage;
	};

	moveWiki = async (context: SecurityContext, wikiId: string, folderId: string): Promise<WikiPage> => {
		const unitOfWork = this.dbUnitOfWorkFactory();
		const wikiPage = await unitOfWork.wikiPageRepository.findById(wikiId);
		if (!wikiPage) {
			throw new Error(`Wiki ${wikiId} does not exist`);
		}
		if (!(await this.wikiPageAuthorizationRuleset.canWrite(context, wikiPage))) {
			throw new Error("You do not have permission to write to this page");
		}

		const folder = await unitOfWork.wikiFolderRepository.findById(folderId);
		if (!folder) {
			throw new Error("Folder does not exist");
		}
		if (!(await this.wikiFolderAuthorizationRuleset.canWrite(context, folder))) {
			throw new Error(`You do not have permission to write to the folder ${folderId}`);
		}

		const oldFolder = await unitOfWork.wikiFolderRepository.findOne([
			new FilterCondition("pages", wikiId),
		]);
		if (oldFolder && !(await this.wikiFolderAuthorizationRuleset.canWrite(context, oldFolder))) {
			throw new Error(`You do not have permission to write to the folder ${oldFolder._id}`);
		}

		folder.pages.push(wikiPage._id);
		await unitOfWork.wikiFolderRepository.update(folder);
		oldFolder.pages = oldFolder.pages.filter((pageId) => pageId !== wikiPage._id);
		await unitOfWork.wikiFolderRepository.update(oldFolder);
		await unitOfWork.commit();
		return wikiPage;
	};

	getWiki = async (context: SecurityContext, wikiId: string): Promise<WikiPage> => {
		let foundWiki = await this.wikiPageRepository.findById(wikiId);
		if (foundWiki && !(await this.wikiPageAuthorizationRuleset.canRead(context, foundWiki))) {
			throw new Error(`You do not have permission to read wiki ${wikiId}`);
		}

		foundWiki = (await this.mapper.map(foundWiki.type).findById(foundWiki._id)) as WikiPage;

		return foundWiki;
	};

	searchWikis = async (context: SecurityContext, worldId: string, name: string, types: string[], canAdmin: boolean): Promise<PaginatedResult<WikiPage>>  => {
		const world = await this.worldRepository.findById(worldId);
		if (!world) {
			throw new Error("World does not exist");
		}
		if (!(await world.authorizationRuleset.canRead(context, world))) {
			throw new Error("You do not have permission to read this World");
		}

		const conditions = [];
		if(name ) {
			conditions.push(new FilterCondition('name', name, FILTER_CONDITION_REGEX));
		}
		if(types && types.length > 0){
			conditions.push(new FilterCondition('type', types, FILTER_CONDITION_OPERATOR_IN));
		}
		const results = await this.wikiPageRepository.findPaginated(conditions, 1);

		const docs = [];
		for (let doc of results.docs) {
			if (canAdmin !== undefined && !(await doc.authorizationRuleset.canAdmin(context, doc))) {
				continue;
			}
			if (await doc.authorizationRuleset.canRead(context, doc)) {
				docs.push(doc);
			}
		}
		results.docs = docs;
		return results;
	}

	getWikisInFolder = async (
		context: SecurityContext,
		folderId: string,
		page: number
	): Promise<PaginatedResult<WikiPage>> => {
		const folder = await this.wikiFolderRepository.findById(folderId);
		if (!folder) {
			throw new Error("Folder does not exist");
		}
		if (!(await folder.authorizationRuleset.canRead(context, folder))) {
			throw new Error("You do not have permission to read this folder");
		}
		const results = await this.wikiPageRepository.findPaginated(
			[new FilterCondition("_id", folder.pages, FILTER_CONDITION_OPERATOR_IN)],
			page,
			"name"
		);
		const docs = [];
		for (let doc of results.docs) {
			if (await this.wikiPageAuthorizationRuleset.canRead(context, doc)) {
				docs.push(doc);
			}
		}
		results.docs = docs;
		return results;
	};
}

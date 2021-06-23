import { inject, injectable } from "inversify";
import { SecurityContext } from "../security-context";
import { ARTICLE, ITEM, MONSTER, PERSON, PLACE } from "../../../common/src/type-constants";
import { WIKI_ADMIN, WIKI_RW } from "../../../common/src/permission-constants";
import { DbUnitOfWork } from "../dal/db-unit-of-work";
import { WikiFolderAuthorizationRuleset } from "../security/wiki-folder-authorization-ruleset";
import { WikiPageAuthorizationRuleset } from "../security/wiki-page-authorization-ruleset";
import { Article } from "../domain-entities/article";
import { PermissionAssignment } from "../domain-entities/permission-assignment";
import { File } from "../domain-entities/file";
import { Readable } from "stream";
import { Person } from "../domain-entities/person";
import { Place } from "../domain-entities/place";
import { Item } from "../domain-entities/item";
import { Monster } from "../domain-entities/monster";
import { FILTER_CONDITION_OPERATOR_IN, FilterCondition } from "../dal/filter-condition";
import {
	AuthorizationService,
	Factory,
	WikiFolderRepository,
	WikiPageRepository,
	WikiPageService,
} from "../types";
import { INJECTABLE_TYPES } from "../injectable-types";
import { ModeledPage } from "../domain-entities/modeled-page";
import { WikiPage } from "../domain-entities/wiki-page";
import { WikiPageRepositoryMapper } from "../dal/wiki-page-repository-mapper";
import { WikiPageModel } from "../dal/mongodb/models/wiki-page";
import { PaginatedResult } from "../dal/paginated-result";

@injectable()
export class WikiPageApplicationService implements WikiPageService {
	wikiFolderAuthorizationRuleset: WikiFolderAuthorizationRuleset =
		new WikiFolderAuthorizationRuleset();
	wikiPageAuthorizationRuleset: WikiPageAuthorizationRuleset = new WikiPageAuthorizationRuleset();

	@inject(INJECTABLE_TYPES.AuthorizationService)
	authorizationService: AuthorizationService;

	@inject(INJECTABLE_TYPES.WikiPageRepository)
	wikiPageRepository: WikiPageRepository;
	@inject(INJECTABLE_TYPES.WikiFolderRepository)
	wikiFolderRepository: WikiFolderRepository;

	@inject(INJECTABLE_TYPES.DbUnitOfWorkFactory)
	dbUnitOfWorkFactory: Factory<DbUnitOfWork>;

	createWiki = async (context: SecurityContext, name: string, folderId: string) => {
		const unitOfWork = this.dbUnitOfWorkFactory();
		const folder = await unitOfWork.wikiFolderRepository.findById(folderId);
		if (!folder) {
			throw new Error("Folder does not exist");
		}

		if (!(await this.wikiPageAuthorizationRuleset.canCreate(context, folder))) {
			throw new Error(`You do not have permission to write to the folder ${folderId}`);
		}

		const newPage = new Article("", name, folder.world, "", "");
		await unitOfWork.articleRepository.create(newPage);
		folder.pages.push(newPage._id);
		await unitOfWork.wikiFolderRepository.update(folder);

		const readPermission = new PermissionAssignment("", WIKI_RW, newPage._id, ARTICLE);
		await unitOfWork.permissionAssignmentRepository.create(readPermission);
		context.user.permissions.push(readPermission._id);
		context.permissions.push(readPermission);
		const adminPermission = new PermissionAssignment("", WIKI_ADMIN, newPage._id, ARTICLE);
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
			} else {
				contentFile = new File(
					"",
					`wikiContent.${wikiPage._id}.json`,
					readStream,
					"application/json"
				);
				await unitOfWork.fileRepository.create(contentFile);
			}
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
					wikiPage = new Person(
						wikiPage._id,
						wikiPage.name,
						wikiPage.world,
						wikiPage.coverImage,
						wikiPage.contentId,
						"",
						""
					);
					break;
				case PLACE:
					wikiPage = new Place(
						wikiPage._id,
						wikiPage.name,
						wikiPage.world,
						wikiPage.coverImage,
						wikiPage.contentId,
						"",
						0
					);
					break;
				case ARTICLE:
					wikiPage = new Article(
						wikiPage._id,
						wikiPage.name,
						wikiPage.world,
						wikiPage.coverImage,
						wikiPage.contentId
					);
					break;
				case ITEM:
					wikiPage = new Item(
						wikiPage._id,
						wikiPage.name,
						wikiPage.world,
						wikiPage.coverImage,
						wikiPage.contentId,
						"",
						""
					);
					break;
				case MONSTER:
					wikiPage = new Monster(
						wikiPage._id,
						wikiPage.name,
						wikiPage.world,
						wikiPage.coverImage,
						wikiPage.contentId,
						"",
						""
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
		return wikiPage.world;
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
		let wikiPage: ModeledPage = await unitOfWork.wikiPageRepository.findById(wikiId);
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

	moveWiki = async (context: SecurityContext, wikiId: string, folderId: string) => {
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
		return wikiPage.world;
	};

	getWiki = async (context: SecurityContext, wikiId: string): Promise<WikiPage> => {
		let foundWiki = await this.wikiPageRepository.findById(wikiId);
		if (foundWiki && !(await this.wikiPageAuthorizationRuleset.canRead(context, foundWiki))) {
			throw new Error(`You do not have permission to read wiki ${wikiId}`);
		}

		const mapper = new WikiPageRepositoryMapper();
		foundWiki = await mapper.map(foundWiki).findById(foundWiki._id);

		return foundWiki;
	};

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

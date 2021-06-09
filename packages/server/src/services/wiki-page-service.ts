import { injectable } from "inversify";
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

@injectable()
export class WikiPageService {
	wikiFolderAuthorizationRuleset: WikiFolderAuthorizationRuleset = new WikiFolderAuthorizationRuleset();
	wikiPageAuthorizationRuleset: WikiPageAuthorizationRuleset = new WikiPageAuthorizationRuleset();

	createWiki = async (context: SecurityContext, name: string, folderId: string) => {
		const unitOfWork = new DbUnitOfWork();
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
		const unitOfWork = new DbUnitOfWork();
		let wikiPage = await unitOfWork.wikiPageRepository.findById(wikiId);
		if (!wikiPage) {
			throw new Error(`Wiki ${wikiId} does not exist`);
		}
		if (!(await this.wikiPageAuthorizationRuleset.canWrite(context, wikiPage))) {
			throw new Error("You do not have permission to write to this page");
		}

		if (readStream) {
			let contentFile = await unitOfWork.fileRepository.findById(wikiPage.contentId);

			let writeStream: WritableStream = null;
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
		const oldId = wikiPage._id;

		if (type) {
			switch (type) {
				case PERSON:
					wikiPage = await unitOfWork.personRepository.findById(wikiPage._id);
					wikiPage = new Person(wikiPage._id);
					break;
				case PLACE:
					wikiPage = await unitOfWork.placeRepository.findById(wikiPage._id);
					break;
				case ARTICLE:
					wikiPage = await unitOfWork.articleRepository.findById(wikiPage._id);
					break;
				case ITEM:
					wikiPage = await unitOfWork.itemRepository.findById(wikiPage._id);
					break;
				case MONSTER:
					wikiPage = await unitOfWork.monsterRepository.findById(wikiPage._id);
					break;
			}
		}

		await wikiPage.save();
		await unitOfWork.commit();
		return wikiPage;
	};
}

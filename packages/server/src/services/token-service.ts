import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types.js";
import { ImageService } from "./image-service.js";
import unzipper, { Entry } from "unzipper";
import { DatabaseContext } from "../dal/database-context.js";
import { PaginatedResult } from "../dal/paginated-result.js";
import { TokenIcon } from "../domain-entities/token-icon.js";
import { SecurityContext } from "../security/security-context.js";
import { Readable, PassThrough } from "stream";
import TokenIconFactory from "../domain-entities/factory/token-icon-factory.js";
import {Image} from "../domain-entities/image.js";

@injectable()
export class TokenIconService {

	@inject(INJECTABLE_TYPES.ImageService)
	imageService: ImageService;

    @inject(INJECTABLE_TYPES.TokenIconFactory)
    tokenIconFactory: TokenIconFactory;

    createTokenIcon = async (
		context: SecurityContext,
		worldId: string,
		imageId: string,
		name: string | undefined,
		databaseContext: DatabaseContext
	): Promise<TokenIcon> => {
		const world = await databaseContext.worldRepository.findOneById(worldId);
		if (!world) {
			throw new Error(`World with id ${worldId} does not exist`);
		}

		const image = await databaseContext.imageRepository.findOneById(imageId);
		if (!image) {
			throw new Error(`Image with id ${imageId} does not exist`);
		}

		const worldAuthPolicy = world.authorizationPolicy;
		if (!(await worldAuthPolicy.canCreateTokenIcons(context))) {
			throw new Error("You do not have permission to create token icons in this world");
		}

		if (name === '') {
			name = undefined;
		}

		const tokenIcon = this.tokenIconFactory.build({
			imageId: imageId,
			worldId: worldId,
			name: name || image.name
		});

		await databaseContext.tokenIconRepository.create(tokenIcon);
		return tokenIcon;
	};

	deleteTokenIcon = async (
		context: SecurityContext,
		tokenIconId: string,
		databaseContext: DatabaseContext
	): Promise<TokenIcon> => {
		const tokenIcon = await databaseContext.tokenIconRepository.findOneById(tokenIconId);
		if (!tokenIcon) {
			throw new Error(`TokenIcon with id ${tokenIconId} does not exist`);
		}

		const world = await databaseContext.worldRepository.findOneById(tokenIcon.worldId);
		if (!world) {
			throw new Error(`World with id ${tokenIcon.worldId} does not exist`);
		}

		const worldAuthPolicy = world.authorizationPolicy;
		if (!(await worldAuthPolicy.canWriteTokenIcons(context))) {
			throw new Error("You do not have permission to delete this token icon");
		}

		await databaseContext.tokenIconRepository.delete(tokenIcon);
		return tokenIcon;
	};

	getTokenIcons = async (
		context: SecurityContext,
		worldId: string,
		name: string | undefined,
		page: number | undefined,
		databaseContext: DatabaseContext
	): Promise<PaginatedResult<TokenIcon>> => {
		const world = await databaseContext.worldRepository.findOneById(worldId);
		if (!world) {
			throw new Error(`World with id ${worldId} does not exist`);
		}

		const worldAuthPolicy = world.authorizationPolicy;
		if (!(await worldAuthPolicy.canReadTokenIcons(context))) {
			throw new Error("You do not have permission to read token icons in this world");
		}

		const allTokenIcons = await databaseContext.tokenIconRepository.getAllPaginated(page, name, worldId);

		return allTokenIcons;
	};

	bulkCreateTokenIcons = async (
		context: SecurityContext,
		worldId: string,
		stream: Readable,
		databaseContext: DatabaseContext
	): Promise<TokenIcon[]> => {
		const world = await databaseContext.worldRepository.findOneById(worldId);
		if (!world) {
			throw new Error(`World with id ${worldId} does not exist`);
		}

		const worldAuthPolicy = world.authorizationPolicy;
		if (!(await worldAuthPolicy.canCreateTokenIcons(context))) {
			throw new Error("You do not have permission to create token icons in this world");
		}

		const tokens: TokenIcon[] = [];
		const buffer = await this.readFile(stream);
		const directory = await unzipper.Open.buffer(buffer);
		for (const file of directory.files) {
			if (file.type === 'File') {
				tokens.push(await this.createTokenFromEntry(file, worldId, databaseContext));
			}
		}

		return tokens;
	}

	createTokenFromEntry = async (entry: unzipper.File, worldId: string, databaseContext: DatabaseContext): Promise<TokenIcon> => {
		const buffer = await this.readFile(entry.stream());
		const readStream = Readable.from(buffer);
		const filename: string = this.getFilenameFromPath(entry.path);
		const image: Image = await this.imageService.createImage(worldId, false, filename, readStream, databaseContext);
		const newTokenIcon = this.tokenIconFactory.build({imageId: image._id, worldId: worldId, name: filename});
        await databaseContext.tokenIconRepository.create(newTokenIcon);
		return newTokenIcon;
	}


	readFile = async (entry: Readable): Promise<Buffer> => {
		const chunks: Buffer[] = [];
		return await new Promise((resolve, reject) => {
			entry.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
			entry.on('error', (err) => reject(err));
			entry.on('end', () => resolve(Buffer.concat(chunks)));
		});
	}

	createReadStream = async (entry: Readable): Promise<Readable> => {
		return Readable.from(await this.readFile(entry));
	}

	getFilenameFromPath(path: string): string {
		const parts = path.split("/");
		return parts[parts.length - 1];
	}
}
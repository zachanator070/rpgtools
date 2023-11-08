import {inject, injectable} from "inversify";
import AbstractSqlRepository from "./abstract-sql-repository";
import {File} from "../../../domain-entities/file";
import FileModel from "../models/file-model";
import {FileRepository} from "../../repository/file-repository";
import FileFactory from "../../../domain-entities/factory/file-factory";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";
import {Op, WhereOptions} from "sequelize";


@injectable()
export default class SqlFileRepository extends AbstractSqlRepository<File, FileModel> implements FileRepository {
    staticModel = FileModel;

    @inject(INJECTABLE_TYPES.FileFactory)
    entityFactory: FileFactory;

    async modelFactory(entity: File | undefined): Promise<FileModel> {
        const contentChunks: Buffer[] = [];
        const content = await new Promise((resolve, reject) => {
            entity.readStream.on('data', (data) => {
                contentChunks.push(Buffer.from(data));
            });
            entity.readStream.on('error', (error) => {
                reject(error);
            });
            entity.readStream.on('end', () => {
                resolve(Buffer.concat(contentChunks).toString('utf8'));
            });
        });

        return FileModel.build({
            _id: entity._id,
            filename: entity.filename,
            mimeType: entity.mimeType,
            content: content
        });
    }

    async findByContent(searchTerms: string[]): Promise<File[]> {

        const filters: WhereOptions[] = [];
        for(let term of searchTerms) {
            filters.push({content: {[Op.iLike]: `%${term}%` }});
        }

        return this.buildResults(await this.staticModel.findAll({
            where: {
                [Op.or]: filters
            }
        }));
    }

}
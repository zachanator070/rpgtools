import {inject, injectable} from "inversify";
import AbstractSqlRepository from "./abstract-sql-repository";
import {File} from "../../../domain-entities/file";
import FileModel from "../models/file-model";
import {FileRepository} from "../../repository/file-repository";
import FileFactory from "../../../domain-entities/factory/file-factory";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";


@injectable()
export default class SqlFileRepository extends AbstractSqlRepository<File, FileModel> implements FileRepository {
    staticModel = FileModel;

    @inject(INJECTABLE_TYPES.FileFactory)
    entityFactory: FileFactory;

    async modelFactory(entity: File | undefined): Promise<FileModel> {
        const contentChunks: Buffer[] = [];
        const content = await new Promise((resolve, reject) => {
            entity.readStream.on('readable', () => {
                let chunk;
                while ((chunk = entity.readStream.read()) !== null) {
                    contentChunks.push(chunk);
                }
            });
            entity.readStream.on('end', () => {
                resolve(Buffer.concat(contentChunks));
            });
        });

        return FileModel.build({
            _id: entity._id,
            filename: entity.filename,
            mimeType: entity.mimeType,
            content: content
        });
    }

}

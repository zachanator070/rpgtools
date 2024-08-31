import {injectable} from "inversify";
import {EntityFactory} from "../../types";
import {File} from "../file";
import {FileAuthorizationPolicy} from "../../security/policy/file-authorization-policy";
import {Readable} from "stream";
import FileModel from "../../dal/sql/models/file-model";


@injectable()
export default class FileFactory implements EntityFactory<File, FileModel> {
    build({
            _id,
            filename,
            readStream,
            mimeType
    }: {
        _id?: string,
        filename: string,
        readStream: Readable,
        mimeType: string
    }) {
        const file: File = new File(new FileAuthorizationPolicy(), this);
        file._id = _id;
        file.filename = filename;
        file.readStream = readStream;
        file.mimeType = mimeType;
        return file;
    }

    async fromSqlModel(model: FileModel): Promise<File> {
        return this.build({
            _id: model._id,
            filename: model.filename,
            mimeType: model.mimeType,
            readStream: Readable.from(model.content)
        });
    }

}
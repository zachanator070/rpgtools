import {injectable} from "inversify";
import {EntityFactory} from "../../types";
import {FileDocument} from "../../dal/mongodb/models/file";
import {File} from "../file";
import {FileAuthorizationPolicy} from "../../security/policy/file-authorization-policy";
import {Readable} from "stream";


@injectable()
export default class FileFactory implements EntityFactory<File, FileDocument> {
    build({
            _id,
            filename,
            readStream,
            mimeType
    }: {
        _id: string,
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

    fromMongodbDocument({
        _id,
        filename,
        readStream,
        mimeType
    }: FileDocument): File {
        const file: File = new File(new FileAuthorizationPolicy(), this);
        file._id = _id && _id.toString();
        file.filename = filename;
        file.readStream = readStream;
        file.mimeType = mimeType;
        return file;
    }

}
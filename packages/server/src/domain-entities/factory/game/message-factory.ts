import {injectable} from "inversify";
import {EntityFactory} from "../../../types";
import {MessageDocument} from "../../../dal/mongodb/models/game";
import MessageModel from "../../../dal/sql/models/game/message-model";
import {Message} from "../../game";


@injectable()
export default class MessageFactory implements EntityFactory<Message, MessageDocument, MessageModel> {

    build(args: {
        _id?: string,
        sender: string,
        senderUser: string,
        receiver: string,
        receiverUser: string,
        message: string,
        timestamp: number
    }): Message {
        return new Message(args.sender, args.senderUser, args.receiver, args.receiverUser, args.message, args.timestamp, args._id);
    }

    fromMongodbDocument(doc: MessageDocument): Message {
        return this.build({
            _id: doc._id && doc._id.toString(),
            sender: doc.sender,
            senderUser: doc.senderUser,
            receiver: doc.receiver,
            receiverUser: doc.receiverUser,
            message: doc.message,
            timestamp: doc.timestamp
        });
    }

    async fromSqlModel(model: MessageModel): Promise<Message> {
        return this.build({
            _id: model._id,
            sender: model.sender,
            senderUser: model.senderUser,
            receiver: model.receiver,
            receiverUser: model.receiverUser,
            message: model.message,
            timestamp: model.timestamp
        });
    }

}
import {injectable} from "inversify";
import {EntityFactory} from "../../../types";
import MessageModel from "../../../dal/sql/models/game/message-model.js";
import {Message} from "../../game.js";


@injectable()
export default class MessageFactory implements EntityFactory<Message, MessageModel> {

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
import WikiPageChild from "./wiki-page-child";
import {defaultAttributes} from "./default-attributes";
import {BelongsToGetAssociationMixin, DataTypes} from "sequelize";
import WikiPageModel, {setupWikiPageAssociations} from "./wiki-page-model";
import {EVENT_WIKI} from "@rpgtools/common/src/type-constants";

export default class EventWikiModel extends WikiPageChild {

    declare age: number;
    declare year: number;
    declare month: number;
    declare day: number;
    declare hour: number;
    declare minute: number;
    declare second: number;

    static attributes = {
        ...defaultAttributes,
        age: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        year: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        month: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        day: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        hour: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        minute: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        second: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
    };


    getWikiPage: BelongsToGetAssociationMixin<WikiPageModel>;

    static connect() {
        setupWikiPageAssociations(EventWikiModel, EVENT_WIKI);
    }

}
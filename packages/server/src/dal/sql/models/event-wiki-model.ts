import WikiPageChild from "./wiki-page-child";
import {defaultAttributes} from "./default-attributes";
import {BelongsToGetAssociationMixin, DataTypes} from "sequelize";
import WikiPageModel, {setupWikiPageAssociations} from "./wiki-page-model";
import {CALENDAR, EVENT_WIKI, WORLD} from "@rpgtools/common/src/type-constants";
import CalendarModel from "./calendar-model";

export default class EventWikiModel extends WikiPageChild {

    declare age: number;
    declare year: number;
    declare month: number;
    declare day: number;
    declare hour: number;
    declare minute: number;
    declare second: number;

    declare calendarId: string;

    static attributes = {
        ...defaultAttributes,
        calendarId: {
            type: DataTypes.UUID,
            references: {
                model: CALENDAR,
                key: '_id'
            }
        },
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
        EventWikiModel.belongsTo(CalendarModel, {as: 'calendar'});
    }

}
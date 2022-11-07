import {
    FILTER_CONDITION_OPERATOR_EQUALS,
    FILTER_CONDITION_OPERATOR_IN,
    FILTER_CONDITION_REGEX,
    FilterCondition
} from "../filter-condition";
import {injectable} from "inversify";
import {ObjectId} from 'bson';

@injectable()
export default class FilterFactory {

    public build(conditions: FilterCondition[]) {

        const filter: any = {};
        for (let condition of conditions) {
            if (condition.operator === FILTER_CONDITION_OPERATOR_IN) {
                filter[condition.field] = {$in: this.getConditionValue(condition)};
            } else if (condition.operator === FILTER_CONDITION_OPERATOR_EQUALS) {
                filter[condition.field] = this.getConditionValue(condition);
            } else if (condition.operator === FILTER_CONDITION_REGEX) {
                filter[condition.field] = {$regex: this.getConditionValue(condition), $options: "i"};
            } else {
                throw new Error(`Unsupported filter operator: ${condition.operator}`);
            }
        }
        return filter;

    }

    private tryCastToObjectId(value: any): any {
        const idRegex = /[0-9a-f]{24}/;

        if (typeof value === "string" && value.match(idRegex)) {
            return new ObjectId(value);
        }
        return value;
    }

    private getConditionValue(condition: FilterCondition): any {

        return condition.value;
    }
}
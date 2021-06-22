export const FILTER_CONDITION_OPERATOR_IN = "in";
export const FILTER_CONDITION_OPERATOR_EQUALS = "=";
export const FILTER_CONDITION_REGEX = "regex";

export class FilterCondition {
	public field: string;
	public value: string;
	public operator: string;

	constructor(field: string, value: any, operator: string = FILTER_CONDITION_OPERATOR_EQUALS) {
		this.field = field;
		this.value = value;
		this.operator = operator;
	}
}

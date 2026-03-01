export abstract class RpgToolsAPIError extends Error {
	constructor(message: string, options?: ErrorOptions) {
		super(message, options);
	}
}

export class GenericRpgToolsAPIError extends RpgToolsAPIError {}

export class EntityNotFoundError extends RpgToolsAPIError {
	constructor(id: string, type: string) {
		super(`${type} with id ${id} not found`);
	}
}

export class ReadPermissionDeniedError extends RpgToolsAPIError {
	constructor(id: string, type: string) {
		super(`You do not have read permission for ${type} with id ${id}`);
	}
}

export class WritePermissionDeniedError extends RpgToolsAPIError {
	constructor(id: string, type: string) {
		super(`You do not have write permission for ${type} with id ${id}`);
	}
}

export class AdminPermissionDeniedError extends RpgToolsAPIError {
	constructor(id: string, type: string) {
		super(`You do not have admin permission for ${type} with id ${id}`);
	}
}

export class TypeNotSupportedError extends RpgToolsAPIError {
	constructor(type: string) {
		super(`This function does not support the type ${type}`);
	}
}

export class InvalidInputError extends RpgToolsAPIError {
	constructor(message: string) {
		super(message);
	}
}

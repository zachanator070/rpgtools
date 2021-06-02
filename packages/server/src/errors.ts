export class EntityNotFoundError extends Error {
	constructor(id: string, type: string) {
		super(`${type} with id ${id} not found`);
	}
}

export class ReadPermissionDeniedError extends Error {
	constructor(id: string, type: string) {
		super(`You do not have read permission for ${type} with id ${id}`);
	}
}

export class WritePermissionDeniedError extends Error {
	constructor(id: string, type: string) {
		super(`You do not have write permission for ${type} with id ${id}`);
	}
}

export class AdminPermissionDeniedError extends Error {
	constructor(id: string, type: string) {
		super(`You do not have admin permission for ${type} with id ${id}`);
	}
}

export class TypeNotSupportedError extends Error {
	constructor(type: string) {
		super(`This function does not support the type ${type}`);
	}
}

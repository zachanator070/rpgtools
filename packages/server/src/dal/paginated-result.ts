export class PaginatedResult<T> {
	docs: T[];
	totalDocs: number;
	limit: number;
	page: number;
	totalPages: number;
	pagingCounter: number;
	hasPrevPage: boolean;
	hasNextPage: boolean;
	prevPage: number | null;
	nextPage: number | null;

	constructor(
		docs: T[],
		totalDocs: number,
		limit: number,
		page: number,
		totalPages: number,
		pagingCounter: number,
		hasPrevPage: boolean,
		hasNextPage: boolean,
		prevPage: number | null,
		nextPage: number | null
	) {
		this.docs = docs;
		this.totalDocs = totalDocs;
		this.limit = limit;
		this.page = page;
		this.totalPages = totalPages;
		this.pagingCounter = pagingCounter;
		this.hasPrevPage = hasPrevPage;
		this.hasNextPage = hasNextPage;
		this.prevPage = prevPage;
		this.nextPage = nextPage;
	}
}

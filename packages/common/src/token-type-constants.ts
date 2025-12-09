export const TOKEN_TYPES = {
	CIRCLE: 'CIRCLE',
	SQUARE: 'SQUARE',
	STAR: 'STAR'
} as const;

export type TokenType = typeof TOKEN_TYPES[keyof typeof TOKEN_TYPES];

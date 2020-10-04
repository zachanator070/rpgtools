export const PERMISSIONS_GRANTED = `
	permissions{
		_id
		permission
		canWrite
		subjectType
		subject {
			_id
			... on World{
				name
			}
			... on WikiPage{
				name
			}
			... on WikiFolder{
				name
			}
			... on Role{
				name
			}
		}
	}
`;


export const ACCESS_CONTROL_LIST = `
	... on PermissionControlled {
		canWrite
		canAdmin
		accessControlList {
			_id
			permission
			canWrite
			subjectType
			subject {
				_id
				... on World{
					name
				}
				... on WikiPage{
					name
				}
				... on WikiFolder{
					name
				}
				... on Role{
					name
				}
			}
			users{
				_id
				username
			}
			roles{
				_id
				name
			}
		}
	}
`;

export const CURRENT_WORLD_WIKIS = `
	_id
	name
	type
	... on PermissionControlled{
		canWrite
		canAdmin
	}
	... on ModeledWiki{
	    model {
	        name
	        fileName
	        width
	        depth
	        height
	        _id
        }
    }
`;

export const CURRENT_WORLD_FOLDERS = `
	_id
	name
	canWrite
	canAdmin
	children{
		_id
	}
	pages{
		${CURRENT_WORLD_WIKIS}
	}
`;

export const CURRENT_WORLD_PINS = `
	pins{
		_id
		canWrite
		page{
			name
			type
			_id
		}
		map{
			name
			_id
		}
		x
		y
	}
`;

export const CURRENT_WORLD_ROLES = `
	roles{
		_id
		name
		canWrite
		canAdmin
		world{
			_id
		}
		${PERMISSIONS_GRANTED}
		members{
			_id
			username
		}
		${ACCESS_CONTROL_LIST}
	}
`;

export const CURRENT_WIKI_PLACE_ATTRIBUTES = `
	mapImage {
        _id
        name
        width
        height
        chunks{
            _id
            fileId
        }
        icon{
            _id
            chunks{
                _id
                fileId
            }
        }
    }
    pixelsPerFoot
`;

export const MODEL_ATTRIBUTES = `
	_id
	name
	depth
	width
	height
	fileName
	fileId
	notes
	${ACCESS_CONTROL_LIST}
`;

export const CURRENT_WIKI_ATTRIBUTES = `
	_id
    type
    name
    content
    ... on PermissionControlled {
	    canWrite
	    canAdmin
    }
    world {
        _id
    }
    coverImage {
        _id
        name
        width
        height
        chunks{
            _id
            fileId
        }
        icon{
            _id
            chunks{
                _id
                fileId
            }
        }
    }
    ... on Place {
        ${CURRENT_WIKI_PLACE_ATTRIBUTES}
    }
    ... on ModeledWiki {
        model{
            ${MODEL_ATTRIBUTES}
        }
    }
`;


export const GAME_MESSAGE = `
    sender
    receiver
    message
    timestamp
`;

export const GAME_PLAYERS = `
	players {
        _id
        username
    }
`;

export const GAME_MAP = `
	map {
		_id
		name
		mapImage {
			_id
			width
			height
			chunks{
				_id
				x
				y
				fileId
			}
		}
		pixelsPerFoot
	}
`;

export const GAME_STROKE = `
	_id
	path{
		_id
		x
		y
	}
	type
	size
	color
	fill
`;

export const GAME_STROKES = `
	strokes{
		${GAME_STROKE}
	}
`;
export const GAME_MODEL = `
	_id
	model{
		_id
		fileId
		depth
		width
		height
		name
		fileName
	}
	x
	z
	lookAtX
	lookAtZ
	color
	wiki{
	    _id
	    name
    }
`;
export const GAME_MODELS = `
	models{
		${GAME_MODEL}
	}
`;
export const GAME_FOG = `
	_id
	path{
		_id
		x
		y
	}
	type
	size
`;
export const GAME_FOG_STROKES = `
	fog{
		${GAME_FOG}
	}
`
export const GAME_ATTRIBUTES = `
	_id
    ${GAME_MAP}
    host{
        _id
    }
	canPaint
	canModel
    canWriteFog
    canWrite
    canAdmin
    ${GAME_PLAYERS}
    messages{
        ${GAME_MESSAGE}
    }
    ${GAME_STROKES}
    fog{
        ${GAME_FOG}
    }
    ${GAME_MODELS}
    ${ACCESS_CONTROL_LIST}
`;


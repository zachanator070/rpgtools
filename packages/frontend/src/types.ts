export interface User {
    _id: string;
    username: string;
    email: string;
    currentWorld: World;
    roles: Role[];
    permissions: PermissionAssignment[];
}

export interface PermissionControlled {
    accessControlList: PermissionAssignment[];
    canWrite: boolean;
    canAdmin: boolean;
    _id: string;
}

export interface World extends PermissionControlled {
    _id: string;
    name: string;
    wikiPage: Place;
    rootFolder: WikiFolder;
    pins: Pin[];
    accessControlList: PermissionAssignment[];
    canWrite: boolean;
    canAdmin: boolean;
    canAddRoles: boolean;
    canHostGame: boolean;
    canAddModels: boolean;
    currentUserPermissions: PermissionAssignment[];
    folders: WikiFolder[];
}

export interface WorldPaginatedResult {
    docs: World[];
    totalDocs: number;
    limit: number;
    page: number;
    totalPages: number;
    pagingCounter: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevPage: number;
    nextPage: number;
}

export interface UserPaginatedResult {
    docs: User[];
    totalDocs: number;
    limit: number;
    page: number;
    totalPages: number;
    pagingCounter: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevPage: number;
    nextPage: number;
}

export interface RolePaginatedResult {
    docs: Role[];
    totalDocs: number;
    limit: number;
    page: number;
    totalPages: number;
    pagingCounter: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevPage: number;
    nextPage: number;
}

export interface WikiPagePaginatedResult {
    docs: WikiPage[];
    totalDocs: number;
    limit: number;
    page: number;
    totalPages: number;
    pagingCounter: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevPage: number;
    nextPage: number;
}

export interface WikiPage extends PermissionControlled {
    _id: string;
    name: string;
    content: string;
    world: World;
    coverImage: Image;
    type: string;
    folder: WikiFolder;
}

export interface ModeledWiki extends WikiPage {
    model: Model;
    modelColor: string;
}

export interface Article extends WikiPage {
    _id: string;
    name: string;
    content: string;
    world: World;
    coverImage: Image;
    type: string;
    folder: WikiFolder;
    accessControlList: PermissionAssignment[];
    canWrite: boolean;
    canAdmin: boolean;
}

export interface Place extends WikiPage {
    _id: string;
    name: string;
    content: string;
    world: World;
    coverImage: Image;
    mapImage: Image;
    pixelsPerFoot: number;
    type: string;
    folder: WikiFolder;
    accessControlList: PermissionAssignment[];
    canWrite: boolean;
    canAdmin: boolean;
}

export interface Person extends WikiPage, ModeledWiki {
    _id: string;
    name: string;
    content: string;
    world: World;
    coverImage: Image;
    type: string;
    folder: WikiFolder;
    accessControlList: PermissionAssignment[];
    canWrite: boolean;
    canAdmin: boolean;
    model: Model;
    modelColor: string;
}

export interface Item extends WikiPage, ModeledWiki {
    _id: string;
    name: string;
    content: string;
    world: World;
    coverImage: Image;
    type: string;
    folder: WikiFolder;
    accessControlList: PermissionAssignment[];
    canWrite: boolean;
    canAdmin: boolean;
    model: Model;
    modelColor: string;
}

export interface Monster extends WikiPage, ModeledWiki {
    _id: string;
    name: string;
    content: string;
    world: World;
    coverImage: Image;
    type: string;
    folder: WikiFolder;
    accessControlList: PermissionAssignment[];
    canWrite: boolean;
    canAdmin: boolean;
    model: Model;
    modelColor: string;
}

export interface WikiFolder extends PermissionControlled {
    _id: string;
    name: string;
    world: World;
    children: WikiFolder[];
    accessControlList: PermissionAssignment[];
    canWrite: boolean;
    canAdmin: boolean;
}

export interface Image {
    _id: string;
    world: World;
    height: number;
    width: number;
    chunkHeight: number;
    chunkWidth: number;
    chunks: Chunk[];
    icon: Image;
    name: string;
}

export interface Chunk {
    _id: string;
    image: Image;
    x: number;
    y: number;
    width: number;
    height: number;
    fileId: string;
}

export interface Role extends PermissionControlled {
    _id: string;
    name: string;
    accessControlList: PermissionAssignment[];
    members: User[];
    world: World;
    permissions: PermissionAssignment[];
    canWrite: boolean;
    canAdmin: boolean;
}

export interface PermissionAssignment {
    _id: string;
    permission: string;
    subject: PermissionControlled;
    subjectType: string;
    canWrite: boolean;
    users: User[];
    roles: Role[];
}

export interface Pin {
    _id: string;
    map: Place;
    x: number;
    y: number;
    page: WikiPage;
    canWrite: boolean;
}

export interface ServerConfig extends PermissionControlled {
    _id: string;
    version: string;
    registerCodes: string[];
    accessControlList: PermissionAssignment[];
    canWrite: boolean;
    canAdmin: boolean;
    roles: Role[];
}

export interface GameMessage {
    sender: string;
    receiver: string;
    message: string;
    timestamp: string;
}

export interface Game extends PermissionControlled {
    _id: string;
    world: World;
    map: Place;
    characters: GameCharacter[];
    messages: GameMessage[];
    host: User;
    accessControlList: PermissionAssignment[];
    canPaint: boolean;
    canModel: boolean;
    canWriteFog: boolean;
    canWrite: boolean;
    canAdmin: boolean;
    strokes: Stroke[];
    fog: FogStroke[];
    models: PositionedModel[];
}

export interface GameCharacter {
    name: string;
    player: User;
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
}

export interface Stroke {
    _id: string;
    path: PathNode[];
    type: string;
    size: number;
    color: string;
    fill: boolean;
}

export interface FogStroke {
    _id: string;
    path: PathNode[];
    type: string;
    size: number;
}

export interface PathNode {
    x: number;
    y: number;
    _id: string;
}

export interface Model extends PermissionControlled {
    _id: string;
    name: string;
    depth: number;
    width: number;
    height: number;
    fileName: string;
    fileId: string;
    notes: string;
    accessControlList: PermissionAssignment[];
    canWrite: boolean;
    canAdmin: boolean;
}

export interface PositionedModel {
    _id: string;
    model: Model;
    x: number;
    z: number;
    lookAtX: number;
    lookAtZ: number;
    color: string;
    wiki: WikiPage;
}

export interface PathNodeInput {
    x: number;
    y: number;
    _id: string;
}

export interface CharacterInput {
    name: string;
}

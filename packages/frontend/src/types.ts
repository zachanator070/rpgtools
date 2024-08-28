export interface User {
    _id?: string;
    username: string;
    email: string;
    currentWorld: World;
    roles: Role[];
}

export interface PermissionControlled {
    accessControlList: AclEntry[];
    canWrite: boolean;
    canAdmin: boolean;
    name: string;
    _id: string;
}

export interface World extends PermissionControlled {
    _id: string;
    name: string;
    wikiPage: Place;
    rootFolder: WikiFolder;
    canAddRoles: boolean;
    canHostGame: boolean;
    canAddModels: boolean;
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

export interface EventWikiPaginatedResult {
    docs: EventWiki[];
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

export interface PinPaginatedResult {
    docs: Pin[];
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
    accessControlList: AclEntry[];
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
    accessControlList: AclEntry[];
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
    accessControlList: AclEntry[];
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
    accessControlList: AclEntry[];
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
    accessControlList: AclEntry[];
    canWrite: boolean;
    canAdmin: boolean;
    model: Model;
    modelColor: string;
}

export interface EventWiki extends WikiPage {
    _id: string;
    name: string;
    content: string;
    world: World;
    coverImage: Image;
    type: string;
    folder: WikiFolder;
    accessControlList: AclEntry[];
    canWrite: boolean;
    canAdmin: boolean;

    calendar: Calendar;
    age: number;
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
}

export interface WikiFolder extends PermissionControlled {
    _id: string;
    name: string;
    world: World;
    children: WikiFolder[];
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
    members: User[];
    world: World;
}

export interface AclEntry {
    permission: string;
    principal: User | Role;
    principalType: 'User' | 'Role';
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
    defaultWorld: World;
    _id: string;
    version: string;
    registerCodes: string[];
    canCreateWorlds: boolean;
    roles: Role[];
    serverNeedsSetup: boolean;
}

export interface GameMessage {
    sender: string;
    receiver: string;
    message: string;
    timestamp: string;
}

export interface GameMapChange {
    map: Place;
    clearPaint: boolean;
    setFog: boolean;
}

export interface Game extends PermissionControlled {
    _id: string;
    world: World;
    map: Place;
    characters: GameCharacter[];
    messages: GameMessage[];
    host: User;
    canPaint: boolean;
    canModel: boolean;
    canWriteFog: boolean;
    models: PositionedModel[];
}

export interface StrokesPaginated {
    docs: Stroke[];
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

export interface FogStrokesPaginated {
    docs: FogStroke[];
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

export interface GameCharacter {
    _id: string;
    name: string;
    player: User;
    color: string;
    attributes: GameCharacterAttribute[];
}

export interface GameCharacterAttribute {
    _id: string;
    name: string;
    value: number;
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

export interface Calendar extends PermissionControlled {
    _id: string;
    name: string;
    ages: Age[];
    canWrite: boolean;
    canAdmin: boolean;
}

export interface Age {
    _id?: string;
    name: string;
    numYears: number;
    months: Month[];
    daysOfTheWeek: DayOfTheWeek[];
}

export interface Month {
    _id?: string;
    name: string;
    numDays: number;
}

export interface DayOfTheWeek {
    _id?: string;
    name: string;
}
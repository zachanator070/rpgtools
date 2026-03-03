--
-- PostgreSQL database dump
--

-- Dumped from database version 16.3 (Debian 16.3-1.pgdg120+1)
-- Dumped by pg_dump version 16.3 (Debian 16.3-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: AclEntry; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."AclEntry" (_id, "createdAt", "updatedAt", permission, "principalType", principal, subject) FROM stdin;
\.


--
-- Data for Name: AdminUsersToServerConfig; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."AdminUsersToServerConfig" ("ServerConfigId", "UserId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: World; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."World" (_id, "createdAt", "updatedAt", name, "wikiPageId", "rootFolderId") FROM stdin;
\.


--
-- Data for Name: Calendar; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."Calendar" (_id, "createdAt", "updatedAt", name, "worldId") FROM stdin;
\.


--
-- Data for Name: Age; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."Age" (_id, "createdAt", "updatedAt", name, index, "numYears", "calendarId") FROM stdin;
\.


--
-- Data for Name: Article; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."Article" (_id, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Image; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."Image" (_id, "createdAt", "updatedAt", width, height, "chunkWidth", "chunkHeight", name, "worldId", "iconId") FROM stdin;
\.


--
-- Data for Name: Place; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."Place" (_id, "createdAt", "updatedAt", "pixelsPerFoot", "mapImageId") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."User" (_id, "createdAt", "updatedAt", email, username, password, "tokenVersion", "currentWorldId") FROM stdin;
\.


--
-- Data for Name: Game; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."Game" (_id, "createdAt", "updatedAt", "passwordHash", "worldId", "mapId", "hostId") FROM stdin;
\.


--
-- Data for Name: Character; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."Character" (_id, "createdAt", "updatedAt", name, color, "GameId", "playerId") FROM stdin;
\.


--
-- Data for Name: CharacterAttribute; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."CharacterAttribute" (_id, "createdAt", "updatedAt", name, value, "CharacterId") FROM stdin;
\.


--
-- Data for Name: File; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."File" (_id, "createdAt", "updatedAt", content, filename, "mimeType") FROM stdin;
\.


--
-- Data for Name: Chunk; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."Chunk" (_id, "createdAt", "updatedAt", x, y, width, height, "fileId", "imageId") FROM stdin;
\.


--
-- Data for Name: DayOfTheWeek; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."DayOfTheWeek" (_id, "createdAt", "updatedAt", name, index, "ageId") FROM stdin;
\.


--
-- Data for Name: Event; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."Event" (_id, "createdAt", "updatedAt", "calendarId", age, year, month, day, hour, minute, second) FROM stdin;
\.


--
-- Data for Name: FogStroke; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."FogStroke" (_id, "createdAt", "updatedAt", size, "strokeType", "GameId") FROM stdin;
\.


--
-- Data for Name: Model; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."Model" (_id, "createdAt", "updatedAt", name, depth, width, height, "fileName", notes, "worldId", "fileId") FROM stdin;
\.


--
-- Data for Name: TokenIcon; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."TokenIcon" (_id, "createdAt", "updatedAt", name, "imageId", "worldId") FROM stdin;
\.


--
-- Data for Name: GameModel; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."GameModel" (_id, "createdAt", "updatedAt", x, z, "lookAtX", "lookAtZ", color, "GameId", "modelId", "wikiId", "tokenId", "tokenType") FROM stdin;
\.


--
-- Data for Name: Invite; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."Invite" (_id, "createdAt", "updatedAt", email, "createdByUserId") FROM stdin;
\.


--
-- Data for Name: Item; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."Item" (_id, "createdAt", "updatedAt", "modelColor", "pageModelId") FROM stdin;
\.


--
-- Data for Name: Message; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."Message" (_id, "createdAt", "updatedAt", sender, "senderUser", receiver, "receiverUser", message, "timestamp", "GameId") FROM stdin;
\.


--
-- Data for Name: Monster; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."Monster" (_id, "createdAt", "updatedAt", "modelColor", "pageModelId") FROM stdin;
\.


--
-- Data for Name: Month; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."Month" (_id, "createdAt", "updatedAt", name, "numDays", index, "ageId") FROM stdin;
\.


--
-- Data for Name: Stroke; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."Stroke" (_id, "createdAt", "updatedAt", color, size, fill, "strokeType", "GameId") FROM stdin;
\.


--
-- Data for Name: PathNode; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."PathNode" (_id, "createdAt", "updatedAt", x, y, "FogStrokeId", "StrokeId") FROM stdin;
\.


--
-- Data for Name: Person; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."Person" (_id, "createdAt", "updatedAt", "modelColor", "pageModelId") FROM stdin;
\.


--
-- Data for Name: WikiPage; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."WikiPage" (_id, "createdAt", "updatedAt", name, "contentId", type, wiki, "worldId", "coverImageId") FROM stdin;
\.


--
-- Data for Name: Pin; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."Pin" (_id, "createdAt", "updatedAt", x, y, "mapId", "pageId", "worldId") FROM stdin;
\.


--
-- Data for Name: Role; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."Role" (_id, "createdAt", "updatedAt", name, "worldId") FROM stdin;
\.


--
-- Data for Name: SequelizeMeta; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."SequelizeMeta" (name) FROM stdin;
\.


--
-- Data for Name: ServerConfig; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."ServerConfig" (_id, "createdAt", "updatedAt", version, "defaultWorldId") FROM stdin;
00000000-0000-0000-0000-000000000001	2026-03-03 16:44:40.125939+00	2026-03-03 16:44:40.125939+00	1.0	\N
\.


--
-- Data for Name: UserToRole; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."UserToRole" (id, "UserId", "RoleId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: WikiFolder; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."WikiFolder" (_id, "createdAt", "updatedAt", name, "WikiFolderId", "worldId") FROM stdin;
\.


--
-- Data for Name: WikiFolderToWikiPage; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."WikiFolderToWikiPage" ("WikiFolderId", "WikiPageId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: WikiPageToWikiPage; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."WikiPageToWikiPage" ("WikiPageId", "relatedWikiId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: UserToRole_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rpgtools
--

SELECT pg_catalog.setval('public."UserToRole_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--


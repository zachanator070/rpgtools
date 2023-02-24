--
-- PostgreSQL database dump
--

-- Dumped from database version 14.5 (Debian 14.5-1.pgdg110+1)
-- Dumped by pg_dump version 14.5 (Debian 14.5-1.pgdg110+1)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Data for Name: AclEntries; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."AclEntry" (_id, permission, "principalType", "createdAt", "updatedAt", principal, subject) FROM stdin;
e97d4bd1-325e-40a2-8abb-5c1fd5d02254	Create world access	Role	2022-11-09 01:55:19.325+00	2022-11-09 01:55:19.328+00	bb0c59f5-284e-4081-a84f-e7403a5b1a7e	9a3e6cb4-69e5-44b6-a4c8-f5a292d0c0f0
\.


--
-- Data for Name: AdminUsersToServerConfig; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."AdminUsersToServerConfig" ("createdAt", "updatedAt", "ServerConfigId", "UserId") FROM stdin;
\.


--
-- Data for Name: Articles; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."Article" (_id, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: CharacterAttributes; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."CharacterAttribute" (_id, name, value, "createdAt", "updatedAt", "CharacterId") FROM stdin;
\.


--
-- Data for Name: Characters; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."Character" (_id, name, color, "createdAt", "updatedAt", "GameId", "playerId") FROM stdin;
\.


--
-- Data for Name: Chunks; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."Chunk" (_id, x, y, width, height, "createdAt", "updatedAt", "imageId", "fileId", "ImageId") FROM stdin;
\.


--
-- Data for Name: Files; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."File" (_id, content, filename, "mimeType", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: FogStrokes; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."FogStroke" (_id, size, type, "createdAt", "updatedAt", "GameId") FROM stdin;
\.


--
-- Data for Name: GameModels; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."GameModel" (_id, x, z, "lookAtX", "lookAtZ", color, "createdAt", "updatedAt", "GameId", "modelId", "wikiId") FROM stdin;
\.


--
-- Data for Name: Games; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."Game" (_id, "passwordHash", "createdAt", "updatedAt", "worldId", "mapId", "hostId") FROM stdin;
\.


--
-- Data for Name: Images; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."Image" (_id, width, height, "chunkWidth", "chunkHeight", name, "createdAt", "updatedAt", "worldId", "iconId") FROM stdin;
\.


--
-- Data for Name: Items; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."Item" (_id, "modelColor", "createdAt", "updatedAt", "pageModelId") FROM stdin;
\.


--
-- Data for Name: Messages; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."Message" (_id, sender, "senderUser", receiver, "receiverUser", message, "timestamp", "createdAt", "updatedAt", "GameId") FROM stdin;
\.


--
-- Data for Name: Models; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."Model" (_id, name, depth, width, height, "fileName", notes, "createdAt", "updatedAt", "worldId", "fileId") FROM stdin;
\.


--
-- Data for Name: Monsters; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."Monster" (_id, "modelColor", "createdAt", "updatedAt", "pageModelId") FROM stdin;
\.


--
-- Data for Name: PathNodes; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."PathNode" (_id, x, y, "createdAt", "updatedAt", "FogStrokeId", "StrokeId") FROM stdin;
\.


--
-- Data for Name: People; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."Person" (_id, "modelColor", "createdAt", "updatedAt", "pageModelId") FROM stdin;
\.


--
-- Data for Name: Pins; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."Pin" (_id, x, y, "createdAt", "updatedAt", "mapId", "pageId", "worldId") FROM stdin;
\.


--
-- Data for Name: Places; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."Place" (_id, "pixelsPerFoot", "createdAt", "updatedAt", "mapImageId") FROM stdin;
\.


--
-- Data for Name: RegisterCodes; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."RegisterCode" (_id, code, "createdAt", "updatedAt", "ServerConfigId") FROM stdin;
\.


--
-- Data for Name: Roles; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."Role" (_id, name, "createdAt", "updatedAt", "worldId") FROM stdin;
2cbc2816-9038-450c-8d24-b259e76e93eb	Everyone	2022-11-09 01:55:19.314+00	2022-11-09 01:55:19.314+00	\N
bb0c59f5-284e-4081-a84f-e7403a5b1a7e	Logged In	2022-11-09 01:55:19.32+00	2022-11-09 01:55:19.32+00	\N
\.


--
-- Data for Name: ServerConfigs; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."ServerConfig" (_id, version, "unlockCode", "createdAt", "updatedAt") FROM stdin;
9a3e6cb4-69e5-44b6-a4c8-f5a292d0c0f0	1.0	unlock_me	2022-11-09 01:55:19.298+00	2022-11-09 01:55:19.322+00
\.


--
-- Data for Name: Strokes; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."Stroke" (_id, color, size, fill, type, "createdAt", "updatedAt", "GameId") FROM stdin;
\.


--
-- Data for Name: UserToRoles; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."UserToRole" ("createdAt", "updatedAt", "UserId", "RoleId") FROM stdin;
\.


--
-- Data for Name: Users; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."User" (_id, email, username, password, "tokenVersion", "createdAt", "updatedAt", "currentWorldId") FROM stdin;
\.


--
-- Data for Name: WikiFolderToWikiPage; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."WikiFolderToWikiPage" ("createdAt", "updatedAt", "WikiFolderId", "WikiPageId") FROM stdin;
\.


--
-- Data for Name: WikiFolders; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."WikiFolder" (_id, name, "createdAt", "updatedAt", "worldId", "WikiFolderId") FROM stdin;
\.


--
-- Data for Name: WikiPages; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."WikiPage" (_id, name, "contentId", type, "createdAt", "updatedAt", wiki, "worldId", "coverImageId") FROM stdin;
\.


--
-- Data for Name: Worlds; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."World" (_id, name, "createdAt", "updatedAt", "wikiPageId", "rootFolderId") FROM stdin;
\.


--
-- PostgreSQL database dump complete
--


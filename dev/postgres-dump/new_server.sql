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
-- Name: AclEntries; Type: TABLE; Schema: public; Owner: rpgtools
--

CREATE TABLE public."AclEntries" (
    _id uuid NOT NULL,
    permission character varying(255) NOT NULL,
    "principalType" character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    principal uuid,
    subject uuid
);


ALTER TABLE public."AclEntries" OWNER TO rpgtools;

--
-- Name: AdminUsersToServerConfig; Type: TABLE; Schema: public; Owner: rpgtools
--

CREATE TABLE public."AdminUsersToServerConfig" (
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "ServerConfigId" uuid NOT NULL,
    "UserId" uuid NOT NULL
);


ALTER TABLE public."AdminUsersToServerConfig" OWNER TO rpgtools;

--
-- Name: Articles; Type: TABLE; Schema: public; Owner: rpgtools
--

CREATE TABLE public."Articles" (
    _id uuid NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Articles" OWNER TO rpgtools;

--
-- Name: CharacterAttributes; Type: TABLE; Schema: public; Owner: rpgtools
--

CREATE TABLE public."CharacterAttributes" (
    _id uuid NOT NULL,
    name character varying(255) NOT NULL,
    value double precision NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "CharacterId" uuid
);


ALTER TABLE public."CharacterAttributes" OWNER TO rpgtools;

--
-- Name: Characters; Type: TABLE; Schema: public; Owner: rpgtools
--

CREATE TABLE public."Characters" (
    _id uuid NOT NULL,
    name character varying(255) NOT NULL,
    color character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "GameId" uuid,
    "playerId" uuid
);


ALTER TABLE public."Characters" OWNER TO rpgtools;

--
-- Name: Chunks; Type: TABLE; Schema: public; Owner: rpgtools
--

CREATE TABLE public."Chunks" (
    _id uuid NOT NULL,
    x double precision NOT NULL,
    y double precision NOT NULL,
    width double precision NOT NULL,
    height double precision NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "imageId" uuid,
    "fileId" uuid,
    "ImageId" uuid
);


ALTER TABLE public."Chunks" OWNER TO rpgtools;

--
-- Name: Files; Type: TABLE; Schema: public; Owner: rpgtools
--

CREATE TABLE public."Files" (
    _id uuid NOT NULL,
    content bytea NOT NULL,
    filename character varying(255) NOT NULL,
    "mimeType" character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Files" OWNER TO rpgtools;

--
-- Name: FogStrokes; Type: TABLE; Schema: public; Owner: rpgtools
--

CREATE TABLE public."FogStrokes" (
    _id uuid NOT NULL,
    size double precision,
    type character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "GameId" uuid
);


ALTER TABLE public."FogStrokes" OWNER TO rpgtools;

--
-- Name: GameModels; Type: TABLE; Schema: public; Owner: rpgtools
--

CREATE TABLE public."GameModels" (
    _id uuid NOT NULL,
    x double precision NOT NULL,
    z double precision NOT NULL,
    "lookAtX" double precision NOT NULL,
    "lookAtZ" double precision NOT NULL,
    color character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "GameId" uuid,
    "modelId" uuid,
    "wikiId" uuid
);


ALTER TABLE public."GameModels" OWNER TO rpgtools;

--
-- Name: Games; Type: TABLE; Schema: public; Owner: rpgtools
--

CREATE TABLE public."Games" (
    _id uuid NOT NULL,
    "passwordHash" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "worldId" uuid,
    "mapId" uuid,
    "hostId" uuid
);


ALTER TABLE public."Games" OWNER TO rpgtools;

--
-- Name: Images; Type: TABLE; Schema: public; Owner: rpgtools
--

CREATE TABLE public."Images" (
    _id uuid NOT NULL,
    width integer NOT NULL,
    height integer NOT NULL,
    "chunkWidth" integer NOT NULL,
    "chunkHeight" integer NOT NULL,
    name character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "worldId" uuid,
    "iconId" uuid
);


ALTER TABLE public."Images" OWNER TO rpgtools;

--
-- Name: Items; Type: TABLE; Schema: public; Owner: rpgtools
--

CREATE TABLE public."Items" (
    _id uuid NOT NULL,
    "modelColor" character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "pageModelId" uuid
);


ALTER TABLE public."Items" OWNER TO rpgtools;

--
-- Name: Messages; Type: TABLE; Schema: public; Owner: rpgtools
--

CREATE TABLE public."Messages" (
    _id uuid NOT NULL,
    sender character varying(255) NOT NULL,
    "senderUser" character varying(255) NOT NULL,
    receiver character varying(255) NOT NULL,
    "receiverUser" character varying(255) NOT NULL,
    message character varying(255) NOT NULL,
    "timestamp" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "GameId" uuid
);


ALTER TABLE public."Messages" OWNER TO rpgtools;

--
-- Name: Models; Type: TABLE; Schema: public; Owner: rpgtools
--

CREATE TABLE public."Models" (
    _id uuid NOT NULL,
    name character varying(255) NOT NULL,
    depth integer NOT NULL,
    width integer NOT NULL,
    height integer NOT NULL,
    "fileName" character varying(255) NOT NULL,
    notes character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "worldId" uuid,
    "fileId" uuid
);


ALTER TABLE public."Models" OWNER TO rpgtools;

--
-- Name: Monsters; Type: TABLE; Schema: public; Owner: rpgtools
--

CREATE TABLE public."Monsters" (
    _id uuid NOT NULL,
    "modelColor" character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "pageModelId" uuid
);


ALTER TABLE public."Monsters" OWNER TO rpgtools;

--
-- Name: PathNodes; Type: TABLE; Schema: public; Owner: rpgtools
--

CREATE TABLE public."PathNodes" (
    _id uuid NOT NULL,
    x double precision NOT NULL,
    y double precision NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "FogStrokeId" uuid,
    "StrokeId" uuid
);


ALTER TABLE public."PathNodes" OWNER TO rpgtools;

--
-- Name: People; Type: TABLE; Schema: public; Owner: rpgtools
--

CREATE TABLE public."People" (
    _id uuid NOT NULL,
    "modelColor" character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "pageModelId" uuid
);


ALTER TABLE public."People" OWNER TO rpgtools;

--
-- Name: Pins; Type: TABLE; Schema: public; Owner: rpgtools
--

CREATE TABLE public."Pins" (
    _id uuid NOT NULL,
    x double precision NOT NULL,
    y double precision NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "mapId" uuid,
    "pageId" uuid,
    "worldId" uuid
);


ALTER TABLE public."Pins" OWNER TO rpgtools;

--
-- Name: Places; Type: TABLE; Schema: public; Owner: rpgtools
--

CREATE TABLE public."Places" (
    _id uuid NOT NULL,
    "pixelsPerFoot" integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "mapImageId" uuid
);


ALTER TABLE public."Places" OWNER TO rpgtools;

--
-- Name: RegisterCodes; Type: TABLE; Schema: public; Owner: rpgtools
--

CREATE TABLE public."RegisterCodes" (
    _id uuid NOT NULL,
    code character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "ServerConfigId" uuid
);


ALTER TABLE public."RegisterCodes" OWNER TO rpgtools;

--
-- Name: Roles; Type: TABLE; Schema: public; Owner: rpgtools
--

CREATE TABLE public."Roles" (
    _id uuid NOT NULL,
    name character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "worldId" uuid
);


ALTER TABLE public."Roles" OWNER TO rpgtools;

--
-- Name: ServerConfigs; Type: TABLE; Schema: public; Owner: rpgtools
--

CREATE TABLE public."ServerConfigs" (
    _id uuid NOT NULL,
    version character varying(255) NOT NULL,
    "unlockCode" character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."ServerConfigs" OWNER TO rpgtools;

--
-- Name: Strokes; Type: TABLE; Schema: public; Owner: rpgtools
--

CREATE TABLE public."Strokes" (
    _id uuid NOT NULL,
    color character varying(255),
    size double precision,
    fill boolean,
    type character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "GameId" uuid
);


ALTER TABLE public."Strokes" OWNER TO rpgtools;

--
-- Name: UserToRole; Type: TABLE; Schema: public; Owner: rpgtools
--

CREATE TABLE public."UserToRole" (
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "UserId" uuid NOT NULL,
    "RoleId" uuid NOT NULL
);


ALTER TABLE public."UserToRole" OWNER TO rpgtools;

--
-- Name: Users; Type: TABLE; Schema: public; Owner: rpgtools
--

CREATE TABLE public."Users" (
    _id uuid NOT NULL,
    email character varying(255) NOT NULL,
    username character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    "tokenVersion" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "currenWorldId" uuid
);


ALTER TABLE public."Users" OWNER TO rpgtools;

--
-- Name: WikiFolderToWikiPage; Type: TABLE; Schema: public; Owner: rpgtools
--

CREATE TABLE public."WikiFolderToWikiPage" (
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "WikiFolderId" uuid NOT NULL,
    "WikiPageId" uuid NOT NULL
);


ALTER TABLE public."WikiFolderToWikiPage" OWNER TO rpgtools;

--
-- Name: WikiFolders; Type: TABLE; Schema: public; Owner: rpgtools
--

CREATE TABLE public."WikiFolders" (
    _id uuid NOT NULL,
    name character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "worldId" uuid,
    "WikiFolderId" uuid
);


ALTER TABLE public."WikiFolders" OWNER TO rpgtools;

--
-- Name: WikiPages; Type: TABLE; Schema: public; Owner: rpgtools
--

CREATE TABLE public."WikiPages" (
    _id uuid NOT NULL,
    name character varying(255) NOT NULL,
    "contentId" uuid,
    type character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    wiki uuid,
    "worldId" uuid,
    "coverImageId" uuid
);


ALTER TABLE public."WikiPages" OWNER TO rpgtools;

--
-- Name: Worlds; Type: TABLE; Schema: public; Owner: rpgtools
--

CREATE TABLE public."Worlds" (
    _id uuid NOT NULL,
    name character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "wikiPageId" uuid,
    "rootFolderId" uuid
);


ALTER TABLE public."Worlds" OWNER TO rpgtools;

--
-- Data for Name: AclEntries; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."AclEntries" (_id, permission, "principalType", "createdAt", "updatedAt", principal, subject) FROM stdin;
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

COPY public."Articles" (_id, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: CharacterAttributes; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."CharacterAttributes" (_id, name, value, "createdAt", "updatedAt", "CharacterId") FROM stdin;
\.


--
-- Data for Name: Characters; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."Characters" (_id, name, color, "createdAt", "updatedAt", "GameId", "playerId") FROM stdin;
\.


--
-- Data for Name: Chunks; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."Chunks" (_id, x, y, width, height, "createdAt", "updatedAt", "imageId", "fileId", "ImageId") FROM stdin;
\.


--
-- Data for Name: Files; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."Files" (_id, content, filename, "mimeType", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: FogStrokes; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."FogStrokes" (_id, size, type, "createdAt", "updatedAt", "GameId") FROM stdin;
\.


--
-- Data for Name: GameModels; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."GameModels" (_id, x, z, "lookAtX", "lookAtZ", color, "createdAt", "updatedAt", "GameId", "modelId", "wikiId") FROM stdin;
\.


--
-- Data for Name: Games; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."Games" (_id, "passwordHash", "createdAt", "updatedAt", "worldId", "mapId", "hostId") FROM stdin;
\.


--
-- Data for Name: Images; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."Images" (_id, width, height, "chunkWidth", "chunkHeight", name, "createdAt", "updatedAt", "worldId", "iconId") FROM stdin;
\.


--
-- Data for Name: Items; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."Items" (_id, "modelColor", "createdAt", "updatedAt", "pageModelId") FROM stdin;
\.


--
-- Data for Name: Messages; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."Messages" (_id, sender, "senderUser", receiver, "receiverUser", message, "timestamp", "createdAt", "updatedAt", "GameId") FROM stdin;
\.


--
-- Data for Name: Models; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."Models" (_id, name, depth, width, height, "fileName", notes, "createdAt", "updatedAt", "worldId", "fileId") FROM stdin;
\.


--
-- Data for Name: Monsters; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."Monsters" (_id, "modelColor", "createdAt", "updatedAt", "pageModelId") FROM stdin;
\.


--
-- Data for Name: PathNodes; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."PathNodes" (_id, x, y, "createdAt", "updatedAt", "FogStrokeId", "StrokeId") FROM stdin;
\.


--
-- Data for Name: People; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."People" (_id, "modelColor", "createdAt", "updatedAt", "pageModelId") FROM stdin;
\.


--
-- Data for Name: Pins; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."Pins" (_id, x, y, "createdAt", "updatedAt", "mapId", "pageId", "worldId") FROM stdin;
\.


--
-- Data for Name: Places; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."Places" (_id, "pixelsPerFoot", "createdAt", "updatedAt", "mapImageId") FROM stdin;
\.


--
-- Data for Name: RegisterCodes; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."RegisterCodes" (_id, code, "createdAt", "updatedAt", "ServerConfigId") FROM stdin;
\.


--
-- Data for Name: Roles; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."Roles" (_id, name, "createdAt", "updatedAt", "worldId") FROM stdin;
2cbc2816-9038-450c-8d24-b259e76e93eb	Everyone	2022-11-09 01:55:19.314+00	2022-11-09 01:55:19.314+00	\N
bb0c59f5-284e-4081-a84f-e7403a5b1a7e	Logged In	2022-11-09 01:55:19.32+00	2022-11-09 01:55:19.32+00	\N
\.


--
-- Data for Name: ServerConfigs; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."ServerConfigs" (_id, version, "unlockCode", "createdAt", "updatedAt") FROM stdin;
9a3e6cb4-69e5-44b6-a4c8-f5a292d0c0f0	1.0	unlock_me	2022-11-09 01:55:19.298+00	2022-11-09 01:55:19.322+00
\.


--
-- Data for Name: Strokes; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."Strokes" (_id, color, size, fill, type, "createdAt", "updatedAt", "GameId") FROM stdin;
\.


--
-- Data for Name: UserToRole; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."UserToRole" ("createdAt", "updatedAt", "UserId", "RoleId") FROM stdin;
\.


--
-- Data for Name: Users; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."Users" (_id, email, username, password, "tokenVersion", "createdAt", "updatedAt", "currenWorldId") FROM stdin;
\.


--
-- Data for Name: WikiFolderToWikiPage; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."WikiFolderToWikiPage" ("createdAt", "updatedAt", "WikiFolderId", "WikiPageId") FROM stdin;
\.


--
-- Data for Name: WikiFolders; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."WikiFolders" (_id, name, "createdAt", "updatedAt", "worldId", "WikiFolderId") FROM stdin;
\.


--
-- Data for Name: WikiPages; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."WikiPages" (_id, name, "contentId", type, "createdAt", "updatedAt", wiki, "worldId", "coverImageId") FROM stdin;
\.


--
-- Data for Name: Worlds; Type: TABLE DATA; Schema: public; Owner: rpgtools
--

COPY public."Worlds" (_id, name, "createdAt", "updatedAt", "wikiPageId", "rootFolderId") FROM stdin;
\.


--
-- Name: AclEntries AclEntries_pkey; Type: CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."AclEntries"
    ADD CONSTRAINT "AclEntries_pkey" PRIMARY KEY (_id);


--
-- Name: AdminUsersToServerConfig AdminUsersToServerConfig_pkey; Type: CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."AdminUsersToServerConfig"
    ADD CONSTRAINT "AdminUsersToServerConfig_pkey" PRIMARY KEY ("ServerConfigId", "UserId");


--
-- Name: Articles Articles_pkey; Type: CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."Articles"
    ADD CONSTRAINT "Articles_pkey" PRIMARY KEY (_id);


--
-- Name: CharacterAttributes CharacterAttributes_pkey; Type: CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."CharacterAttributes"
    ADD CONSTRAINT "CharacterAttributes_pkey" PRIMARY KEY (_id);


--
-- Name: Characters Characters_pkey; Type: CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."Characters"
    ADD CONSTRAINT "Characters_pkey" PRIMARY KEY (_id);


--
-- Name: Chunks Chunks_pkey; Type: CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."Chunks"
    ADD CONSTRAINT "Chunks_pkey" PRIMARY KEY (_id);


--
-- Name: Files Files_pkey; Type: CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."Files"
    ADD CONSTRAINT "Files_pkey" PRIMARY KEY (_id);


--
-- Name: FogStrokes FogStrokes_pkey; Type: CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."FogStrokes"
    ADD CONSTRAINT "FogStrokes_pkey" PRIMARY KEY (_id);


--
-- Name: GameModels GameModels_pkey; Type: CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."GameModels"
    ADD CONSTRAINT "GameModels_pkey" PRIMARY KEY (_id);


--
-- Name: Games Games_pkey; Type: CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."Games"
    ADD CONSTRAINT "Games_pkey" PRIMARY KEY (_id);


--
-- Name: Images Images_pkey; Type: CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."Images"
    ADD CONSTRAINT "Images_pkey" PRIMARY KEY (_id);


--
-- Name: Items Items_pkey; Type: CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."Items"
    ADD CONSTRAINT "Items_pkey" PRIMARY KEY (_id);


--
-- Name: Messages Messages_pkey; Type: CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."Messages"
    ADD CONSTRAINT "Messages_pkey" PRIMARY KEY (_id);


--
-- Name: Models Models_pkey; Type: CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."Models"
    ADD CONSTRAINT "Models_pkey" PRIMARY KEY (_id);


--
-- Name: Monsters Monsters_pkey; Type: CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."Monsters"
    ADD CONSTRAINT "Monsters_pkey" PRIMARY KEY (_id);


--
-- Name: PathNodes PathNodes_pkey; Type: CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."PathNodes"
    ADD CONSTRAINT "PathNodes_pkey" PRIMARY KEY (_id);


--
-- Name: People People_pkey; Type: CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."People"
    ADD CONSTRAINT "People_pkey" PRIMARY KEY (_id);


--
-- Name: Pins Pins_pkey; Type: CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."Pins"
    ADD CONSTRAINT "Pins_pkey" PRIMARY KEY (_id);


--
-- Name: Places Places_pkey; Type: CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."Places"
    ADD CONSTRAINT "Places_pkey" PRIMARY KEY (_id);


--
-- Name: RegisterCodes RegisterCodes_pkey; Type: CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."RegisterCodes"
    ADD CONSTRAINT "RegisterCodes_pkey" PRIMARY KEY (_id);


--
-- Name: Roles Roles_pkey; Type: CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."Roles"
    ADD CONSTRAINT "Roles_pkey" PRIMARY KEY (_id);


--
-- Name: ServerConfigs ServerConfigs_pkey; Type: CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."ServerConfigs"
    ADD CONSTRAINT "ServerConfigs_pkey" PRIMARY KEY (_id);


--
-- Name: Strokes Strokes_pkey; Type: CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."Strokes"
    ADD CONSTRAINT "Strokes_pkey" PRIMARY KEY (_id);


--
-- Name: UserToRole UserToRole_pkey; Type: CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."UserToRole"
    ADD CONSTRAINT "UserToRole_pkey" PRIMARY KEY ("UserId", "RoleId");


--
-- Name: Users Users_pkey; Type: CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY (_id);


--
-- Name: WikiFolderToWikiPage WikiFolderToWikiPage_pkey; Type: CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."WikiFolderToWikiPage"
    ADD CONSTRAINT "WikiFolderToWikiPage_pkey" PRIMARY KEY ("WikiFolderId", "WikiPageId");


--
-- Name: WikiFolders WikiFolders_pkey; Type: CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."WikiFolders"
    ADD CONSTRAINT "WikiFolders_pkey" PRIMARY KEY (_id);


--
-- Name: WikiPages WikiPages_pkey; Type: CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."WikiPages"
    ADD CONSTRAINT "WikiPages_pkey" PRIMARY KEY (_id);


--
-- Name: Worlds Worlds_pkey; Type: CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."Worlds"
    ADD CONSTRAINT "Worlds_pkey" PRIMARY KEY (_id);


--
-- Name: CharacterAttributes CharacterAttributes_CharacterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."CharacterAttributes"
    ADD CONSTRAINT "CharacterAttributes_CharacterId_fkey" FOREIGN KEY ("CharacterId") REFERENCES public."Characters"(_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Characters Characters_GameId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."Characters"
    ADD CONSTRAINT "Characters_GameId_fkey" FOREIGN KEY ("GameId") REFERENCES public."Games"(_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Characters Characters_playerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."Characters"
    ADD CONSTRAINT "Characters_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES public."Users"(_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Chunks Chunks_ImageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."Chunks"
    ADD CONSTRAINT "Chunks_ImageId_fkey" FOREIGN KEY ("ImageId") REFERENCES public."Images"(_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Chunks Chunks_fileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."Chunks"
    ADD CONSTRAINT "Chunks_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES public."Files"(_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Chunks Chunks_imageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."Chunks"
    ADD CONSTRAINT "Chunks_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES public."Images"(_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: FogStrokes FogStrokes_GameId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."FogStrokes"
    ADD CONSTRAINT "FogStrokes_GameId_fkey" FOREIGN KEY ("GameId") REFERENCES public."Games"(_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: GameModels GameModels_GameId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."GameModels"
    ADD CONSTRAINT "GameModels_GameId_fkey" FOREIGN KEY ("GameId") REFERENCES public."Games"(_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: GameModels GameModels_modelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."GameModels"
    ADD CONSTRAINT "GameModels_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES public."Models"(_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Games Games_hostId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."Games"
    ADD CONSTRAINT "Games_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES public."Users"(_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Games Games_mapId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."Games"
    ADD CONSTRAINT "Games_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES public."Places"(_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Games Games_worldId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."Games"
    ADD CONSTRAINT "Games_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES public."Worlds"(_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Images Images_iconId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."Images"
    ADD CONSTRAINT "Images_iconId_fkey" FOREIGN KEY ("iconId") REFERENCES public."Images"(_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Images Images_worldId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."Images"
    ADD CONSTRAINT "Images_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES public."Worlds"(_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Items Items_pageModelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."Items"
    ADD CONSTRAINT "Items_pageModelId_fkey" FOREIGN KEY ("pageModelId") REFERENCES public."Models"(_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Messages Messages_GameId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."Messages"
    ADD CONSTRAINT "Messages_GameId_fkey" FOREIGN KEY ("GameId") REFERENCES public."Games"(_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Models Models_fileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."Models"
    ADD CONSTRAINT "Models_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES public."Files"(_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Models Models_worldId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."Models"
    ADD CONSTRAINT "Models_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES public."Worlds"(_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Monsters Monsters_pageModelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."Monsters"
    ADD CONSTRAINT "Monsters_pageModelId_fkey" FOREIGN KEY ("pageModelId") REFERENCES public."Models"(_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PathNodes PathNodes_FogStrokeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."PathNodes"
    ADD CONSTRAINT "PathNodes_FogStrokeId_fkey" FOREIGN KEY ("FogStrokeId") REFERENCES public."FogStrokes"(_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PathNodes PathNodes_StrokeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."PathNodes"
    ADD CONSTRAINT "PathNodes_StrokeId_fkey" FOREIGN KEY ("StrokeId") REFERENCES public."Strokes"(_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: People People_pageModelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."People"
    ADD CONSTRAINT "People_pageModelId_fkey" FOREIGN KEY ("pageModelId") REFERENCES public."Models"(_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Pins Pins_mapId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."Pins"
    ADD CONSTRAINT "Pins_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES public."WikiPages"(_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Pins Pins_worldId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."Pins"
    ADD CONSTRAINT "Pins_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES public."Worlds"(_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Places Places_mapImageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."Places"
    ADD CONSTRAINT "Places_mapImageId_fkey" FOREIGN KEY ("mapImageId") REFERENCES public."Images"(_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: RegisterCodes RegisterCodes_ServerConfigId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."RegisterCodes"
    ADD CONSTRAINT "RegisterCodes_ServerConfigId_fkey" FOREIGN KEY ("ServerConfigId") REFERENCES public."ServerConfigs"(_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Roles Roles_worldId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."Roles"
    ADD CONSTRAINT "Roles_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES public."Worlds"(_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Strokes Strokes_GameId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."Strokes"
    ADD CONSTRAINT "Strokes_GameId_fkey" FOREIGN KEY ("GameId") REFERENCES public."Games"(_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Users Users_currenWorldId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_currenWorldId_fkey" FOREIGN KEY ("currenWorldId") REFERENCES public."Worlds"(_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: WikiFolders WikiFolders_WikiFolderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."WikiFolders"
    ADD CONSTRAINT "WikiFolders_WikiFolderId_fkey" FOREIGN KEY ("WikiFolderId") REFERENCES public."WikiFolders"(_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: WikiFolders WikiFolders_worldId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."WikiFolders"
    ADD CONSTRAINT "WikiFolders_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES public."Worlds"(_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: WikiPages WikiPages_coverImageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."WikiPages"
    ADD CONSTRAINT "WikiPages_coverImageId_fkey" FOREIGN KEY ("coverImageId") REFERENCES public."Images"(_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: WikiPages WikiPages_worldId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."WikiPages"
    ADD CONSTRAINT "WikiPages_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES public."Worlds"(_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Worlds Worlds_rootFolderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rpgtools
--

ALTER TABLE ONLY public."Worlds"
    ADD CONSTRAINT "Worlds_rootFolderId_fkey" FOREIGN KEY ("rootFolderId") REFERENCES public."WikiFolders"(_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--


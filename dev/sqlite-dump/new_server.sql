--
-- PostgreSQL database dump
--

-- Dumped from database version 15.2 (Debian 15.2-1.pgdg110+1)
-- Dumped by pg_dump version 15.2 (Debian 15.2-1.pgdg110+1)

--
-- Data for Name: AclEntry; Type: TABLE DATA; Schema: main; Owner: rpgtools
--

INSERT INTO main."AclEntry" VALUES ('e97d4bd1-325e-40a2-8abb-5c1fd5d02254', '2022-11-09 01:55:19.325+00', '2022-11-09 01:55:19.328+00', 'Create world access', 'Role', 'bb0c59f5-284e-4081-a84f-e7403a5b1a7e', '9a3e6cb4-69e5-44b6-a4c8-f5a292d0c0f0');


--
-- Data for Name: AdminUsersToServerConfig; Type: TABLE DATA; Schema: main; Owner: rpgtools
--



--
-- Data for Name: Article; Type: TABLE DATA; Schema: main; Owner: rpgtools
--



--
-- Data for Name: WikiFolder; Type: TABLE DATA; Schema: main; Owner: rpgtools
--



--
-- Data for Name: World; Type: TABLE DATA; Schema: main; Owner: rpgtools
--



--
-- Data for Name: Image; Type: TABLE DATA; Schema: main; Owner: rpgtools
--



--
-- Data for Name: Place; Type: TABLE DATA; Schema: main; Owner: rpgtools
--



--
-- Data for Name: User; Type: TABLE DATA; Schema: main; Owner: rpgtools
--



--
-- Data for Name: Game; Type: TABLE DATA; Schema: main; Owner: rpgtools
--



--
-- Data for Name: Character; Type: TABLE DATA; Schema: main; Owner: rpgtools
--



--
-- Data for Name: CharacterAttribute; Type: TABLE DATA; Schema: main; Owner: rpgtools
--



--
-- Data for Name: File; Type: TABLE DATA; Schema: main; Owner: rpgtools
--



--
-- Data for Name: Chunk; Type: TABLE DATA; Schema: main; Owner: rpgtools
--



--
-- Data for Name: FogStroke; Type: TABLE DATA; Schema: main; Owner: rpgtools
--



--
-- Data for Name: Model; Type: TABLE DATA; Schema: main; Owner: rpgtools
--



--
-- Data for Name: GameModel; Type: TABLE DATA; Schema: main; Owner: rpgtools
--



--
-- Data for Name: Item; Type: TABLE DATA; Schema: main; Owner: rpgtools
--



--
-- Data for Name: Message; Type: TABLE DATA; Schema: main; Owner: rpgtools
--



--
-- Data for Name: Monster; Type: TABLE DATA; Schema: main; Owner: rpgtools
--



--
-- Data for Name: Stroke; Type: TABLE DATA; Schema: main; Owner: rpgtools
--



--
-- Data for Name: PathNode; Type: TABLE DATA; Schema: main; Owner: rpgtools
--



--
-- Data for Name: Person; Type: TABLE DATA; Schema: main; Owner: rpgtools
--



--
-- Data for Name: WikiPage; Type: TABLE DATA; Schema: main; Owner: rpgtools
--



--
-- Data for Name: Pin; Type: TABLE DATA; Schema: main; Owner: rpgtools
--



--
-- Data for Name: ServerConfig; Type: TABLE DATA; Schema: main; Owner: rpgtools
--

INSERT INTO main."ServerConfig" VALUES ('9a3e6cb4-69e5-44b6-a4c8-f5a292d0c0f0', '2022-11-09 01:55:19.298+00', '2022-11-09 01:55:19.322+00', '1.0', 'unlock_me', NULL);


--
-- Data for Name: RegisterCode; Type: TABLE DATA; Schema: main; Owner: rpgtools
--



--
-- Data for Name: Role; Type: TABLE DATA; Schema: main; Owner: rpgtools
--

INSERT INTO main."Role" VALUES ('2cbc2816-9038-450c-8d24-b259e76e93eb', '2022-11-09 01:55:19.314+00', '2022-11-09 01:55:19.314+00', 'Everyone', NULL);
INSERT INTO main."Role" VALUES ('bb0c59f5-284e-4081-a84f-e7403a5b1a7e', '2022-11-09 01:55:19.32+00', '2022-11-09 01:55:19.32+00', 'Logged In', NULL);


--
-- Data for Name: UserToRole; Type: TABLE DATA; Schema: main; Owner: rpgtools
--



--
-- Data for Name: WikiFolderToWikiPage; Type: TABLE DATA; Schema: main; Owner: rpgtools
--



--
-- Name: UserToRole_id_seq; Type: SEQUENCE SET; Schema: main; Owner: rpgtools
--


--
-- PostgreSQL database dump complete
--


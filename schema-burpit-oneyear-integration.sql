-- BURP — /burp-it One Year Bible integration
-- 1. Adds day_number to reading_plans (additive, no existing data touched)
-- 2. Backfills day_number for the 110 existing rows (parsed from their own titles)
-- 3. Fills the one genuine gap (Day 120, never created) and creates every
--    remaining day (225-365) through Jan 31, 2027, using the exact same
--    schedule already seeded in one_year_plan_days.
-- Existing titles, descriptions, discussions, and comments are NEVER modified
-- or deleted by this script.

alter table public.reading_plans add column if not exists day_number int;
create index if not exists idx_reading_plans_day_number on public.reading_plans(day_number);

-- Backfill existing rows
update public.reading_plans set day_number = 114 where id = 'ded6912a-1155-40aa-b8ca-5b53c90ab069';
update public.reading_plans set day_number = 115 where id = '35b2bd1f-0506-4b44-b8c2-7914841c035e';
update public.reading_plans set day_number = 116 where id = 'd4319b18-20c2-4f94-b802-48b76faf0ff4';
update public.reading_plans set day_number = 117 where id = '2f41646d-4e2d-40aa-b8b8-a4b6dd34d100';
update public.reading_plans set day_number = 118 where id = 'fa19129e-b255-4f0f-9b86-d64123689113';
update public.reading_plans set day_number = 119 where id = '711b1bcd-b4b3-4298-bc08-596f68cbd7f2';
update public.reading_plans set day_number = 121 where id = '97cd1978-ef25-4c3f-807e-afb3adafb18a';
update public.reading_plans set day_number = 122 where id = '4b4595ed-56dc-484d-bec8-5aa7926546d4';
update public.reading_plans set day_number = 123 where id = 'e0241788-bb1c-4398-9c1c-3fff44210ddb';
update public.reading_plans set day_number = 124 where id = 'b3f8d0ff-a936-48d6-bde3-54c076c7813b';
update public.reading_plans set day_number = 125 where id = 'fd4f5ac6-468a-4b0c-bb00-3f8f121daf69';
update public.reading_plans set day_number = 126 where id = 'f1838643-a753-42ce-a30b-52c7e794bf1e';
update public.reading_plans set day_number = 127 where id = '6f868028-a982-4c45-a9bd-f18c63777846';
update public.reading_plans set day_number = 128 where id = 'cf192a3f-99dd-42e9-b0db-d81db1d80fc7';
update public.reading_plans set day_number = 129 where id = 'c7bf9edd-6cf1-406f-9daa-17dd57c9ecbb';
update public.reading_plans set day_number = 130 where id = 'ac15e4b5-8f65-4a30-b091-124bce2ef236';
update public.reading_plans set day_number = 131 where id = '84e5897d-e716-405b-9d79-e823be9fdbc4';
update public.reading_plans set day_number = 132 where id = '03d4de3e-3714-4396-aff8-fc320599e632';
update public.reading_plans set day_number = 133 where id = '2622bbd1-6004-4d77-aa11-1a7a49ead379';
update public.reading_plans set day_number = 134 where id = 'f6d97dd7-860e-475b-b1c2-f2d6f21d6879';
update public.reading_plans set day_number = 135 where id = '6d895020-041f-429f-8d6d-efe837a9a872';
update public.reading_plans set day_number = 136 where id = 'a980659b-52ef-4c5d-961c-4f6df64d5f22';
update public.reading_plans set day_number = 137 where id = '3c45abc7-0cda-4fef-afad-1b5a949d8fd3';
update public.reading_plans set day_number = 138 where id = 'e7bec9f0-ff9a-4022-932d-258439650458';
update public.reading_plans set day_number = 139 where id = 'f179b687-f3f6-44bf-8599-e07d9506b64c';
update public.reading_plans set day_number = 140 where id = '4f7855b6-6d96-4f50-9572-7a287e459885';
update public.reading_plans set day_number = 141 where id = '0c3918a8-15cb-4ae1-b133-2751b65fc509';
update public.reading_plans set day_number = 142 where id = '151e6684-f350-4c72-980e-fd0302893a41';
update public.reading_plans set day_number = 143 where id = '53499fb5-6baa-478b-9b65-4ffd21b58e67';
update public.reading_plans set day_number = 144 where id = '91218a7a-fbef-4352-8c15-58609d6c18dc';
update public.reading_plans set day_number = 145 where id = '3384faf3-ead1-40c3-833e-81b7625e4a1f';
update public.reading_plans set day_number = 146 where id = 'ba77d7f7-0055-433f-9c50-aa9179736eab';
update public.reading_plans set day_number = 147 where id = '46a56582-4f12-4fba-a9fc-392268bfe722';
update public.reading_plans set day_number = 148 where id = '7f6f44f5-b38c-440b-8154-0aef1cf983cb';
update public.reading_plans set day_number = 149 where id = 'f70dab03-c44b-4495-aaf5-6db86e5fc649';
update public.reading_plans set day_number = 150 where id = '1c5974ec-8ba8-4ba7-a52e-9ffb6f4b36b9';
update public.reading_plans set day_number = 151 where id = '1ed129c0-649c-4e0a-b8fa-a1345946b5ab';
update public.reading_plans set day_number = 152 where id = '3a16a740-af26-4ac4-b7f2-253e18beacff';
update public.reading_plans set day_number = 153 where id = 'b0b9e7d7-89a6-41f6-8186-21276c22b5cb';
update public.reading_plans set day_number = 154 where id = '7d0f6d43-466a-44c5-bd14-81abaabfc993';
update public.reading_plans set day_number = 155 where id = 'edcaa46b-8f40-4eca-8d27-e509751c6d49';
update public.reading_plans set day_number = 156 where id = '56fa6d4c-78eb-4265-8840-7b5185f39806';
update public.reading_plans set day_number = 157 where id = '87d8f35c-7425-4966-bac2-556a65e22ec4';
update public.reading_plans set day_number = 158 where id = '1d3348b7-1705-4dea-b1a1-09657dd612b0';
update public.reading_plans set day_number = 159 where id = '76b4cb44-2a56-44c5-9a12-60c022ac2f95';
update public.reading_plans set day_number = 160 where id = 'df4640ad-ad21-4189-9bab-25143a3c923d';
update public.reading_plans set day_number = 161 where id = '55121ba8-34cf-442e-84c5-6267e853023a';
update public.reading_plans set day_number = 162 where id = '64dcf49c-ceb1-4f74-97ed-703989b01975';
update public.reading_plans set day_number = 163 where id = 'de268f23-64ac-4042-85a2-b626e45f6906';
update public.reading_plans set day_number = 164 where id = 'eb81954a-4570-4c96-91e9-ac48794cb1dc';
update public.reading_plans set day_number = 165 where id = 'ba049e2d-e993-4c5a-91d3-0eb3b8ae621d';
update public.reading_plans set day_number = 166 where id = 'ddf039b1-7413-42d1-b6cf-961aa2ee818b';
update public.reading_plans set day_number = 167 where id = '44d18bbe-842d-472b-bd36-0c4cbb4b27a4';
update public.reading_plans set day_number = 168 where id = 'cdec45ad-0141-4e50-97f1-1e4012554ec2';
update public.reading_plans set day_number = 169 where id = '952f4227-7878-403e-9249-868d6befd357';
update public.reading_plans set day_number = 170 where id = '6468337d-db0d-4382-b159-0370237f54c7';
update public.reading_plans set day_number = 171 where id = 'b9742922-d0bd-4df3-8edf-38ea6e55da46';
update public.reading_plans set day_number = 172 where id = '6d55ad2a-a6db-4078-a027-6bb3b874bf0e';
update public.reading_plans set day_number = 173 where id = '04a019ff-eb1f-4b45-bc2c-e0c7d1096fbb';
update public.reading_plans set day_number = 174 where id = 'df8b8624-14a6-4458-b8f8-c8f0330240ec';
update public.reading_plans set day_number = 175 where id = 'd9665f6d-3ee5-41cd-b39d-61df50521f73';
update public.reading_plans set day_number = 176 where id = '7622aa1b-81b5-4d5b-8caf-de96a0150ac6';
update public.reading_plans set day_number = 177 where id = 'a3a128ce-7ce1-4746-aff2-3afefc27e7d0';
update public.reading_plans set day_number = 178 where id = 'f85f26dd-d918-48b8-81af-2a3ae1f2923b';
update public.reading_plans set day_number = 179 where id = '9a180b54-93a4-4fd3-8db9-4dc8c9efa764';
update public.reading_plans set day_number = 180 where id = 'e2f6863d-2ed0-4708-9915-de83fc1ee1da';
update public.reading_plans set day_number = 181 where id = '5f633db8-6cc6-4f81-b847-dee1634c97c7';
update public.reading_plans set day_number = 182 where id = '1415cc98-0a97-4341-a4fd-97da0f6dfb6f';
update public.reading_plans set day_number = 183 where id = 'cff44822-24d4-4b97-af62-2afa14bf7acb';
update public.reading_plans set day_number = 184 where id = '53d91a77-3ad8-4091-a1f0-5018776c827f';
update public.reading_plans set day_number = 185 where id = 'fdc9712a-1297-44a2-88a9-598bf80cec5e';
update public.reading_plans set day_number = 186 where id = 'b147cc4f-76f0-4139-8b9c-3694682cf1f7';
update public.reading_plans set day_number = 187 where id = 'ed7651e2-fd60-457f-809c-d1494dce6fa8';
update public.reading_plans set day_number = 188 where id = '2bb820c3-a1e4-492c-8433-cfa6167422c5';
update public.reading_plans set day_number = 189 where id = '4ae35824-2afb-4b4d-88d4-e716d78557e0';
update public.reading_plans set day_number = 190 where id = '7498c7b1-b704-4ccb-82d0-12b72ea1f28c';
update public.reading_plans set day_number = 191 where id = 'abdb9213-3453-45fb-9392-78c5a6cd0269';
update public.reading_plans set day_number = 192 where id = '55cf69d6-bd3b-42e6-9b05-897a07de7d5b';
update public.reading_plans set day_number = 193 where id = 'fdabcd3d-bc7b-4eee-9943-b76d0babe6da';
update public.reading_plans set day_number = 194 where id = '9aee2563-a5aa-4386-b4a5-40cd91e66985';
update public.reading_plans set day_number = 195 where id = '4b57708b-fdec-4340-992b-6a8955087423';
update public.reading_plans set day_number = 196 where id = 'a22b8a56-bb43-4095-9afa-f9ecbb2bbebf';
update public.reading_plans set day_number = 197 where id = 'f73074c1-3d97-4f0a-89e3-78a8695722fd';
update public.reading_plans set day_number = 198 where id = 'd2f88703-3f8d-4a46-94b9-4731cdc32ddb';
update public.reading_plans set day_number = 199 where id = '1938f753-b008-48e0-a168-9af10e3eb564';
update public.reading_plans set day_number = 200 where id = 'b2f95731-174b-4253-b6ab-137fa7e025e4';
update public.reading_plans set day_number = 201 where id = 'e3209c23-ab0f-4d50-a7b6-15ebd8f7cca2';
update public.reading_plans set day_number = 202 where id = '3ab6a1cb-cc5d-4111-9d4e-b6b942729f35';
update public.reading_plans set day_number = 203 where id = '29d831db-5e7d-4ed5-961c-bae07b1474f1';
update public.reading_plans set day_number = 204 where id = '1046a0c4-0d99-41ca-b7ac-218e3cb6bbff';
update public.reading_plans set day_number = 205 where id = '00935a26-78a3-4202-9d50-daeb5ce7c602';
update public.reading_plans set day_number = 206 where id = '1ce3eba1-918b-4aaf-8fb9-15e2c970af4c';
update public.reading_plans set day_number = 207 where id = 'b7c0c913-71f9-4bae-bb5d-9e4cbfd7d95b';
update public.reading_plans set day_number = 208 where id = '6f1d5de8-99c3-4002-bcbe-3326d5853f0f';
update public.reading_plans set day_number = 209 where id = '3ded801f-588b-4b33-bf18-6bc0e5b1d7d6';
update public.reading_plans set day_number = 210 where id = 'ed6c7e2f-1f1a-4eec-96bb-31a26ce322e4';
update public.reading_plans set day_number = 211 where id = '84dfc253-0975-45df-af78-bb0f727917c8';
update public.reading_plans set day_number = 212 where id = '0b41dace-d8b9-4232-bb6d-cb70aba1d0a2';
update public.reading_plans set day_number = 213 where id = 'c63f5ecb-6b97-431b-9ccd-373034a8c20e';
update public.reading_plans set day_number = 214 where id = '359d4233-a5bd-4fc0-bc38-6b1fc52fe328';
update public.reading_plans set day_number = 215 where id = '60e4571e-61c3-429c-8bf1-ec0ab16d135e';
update public.reading_plans set day_number = 216 where id = '209516e9-5571-4e7c-9a2c-7ab43dde2e36';
update public.reading_plans set day_number = 217 where id = '6fa9cf2f-a69a-4e86-a52a-8b2a17a2e783';
update public.reading_plans set day_number = 218 where id = 'a8ac3ca5-efca-4b3c-825b-63ef3805e2a8';
update public.reading_plans set day_number = 219 where id = '116e0d0a-5341-4fb9-9744-9dfdfce542d6';
update public.reading_plans set day_number = 220 where id = 'd6add855-ee71-4a48-af98-6518d7d82bbb';
update public.reading_plans set day_number = 221 where id = '09327203-aeee-4728-8424-13658e2501ec';
update public.reading_plans set day_number = 222 where id = 'f999aebe-bf01-412d-873e-c3976eadee1e';
update public.reading_plans set day_number = 223 where id = '05f1a9aa-fdb6-4b1a-a316-e5450f16f2bf';
update public.reading_plans set day_number = 224 where id = 'a2065aef-5c46-46db-b804-51041cf9e91f';

-- Fill the Day 120 gap + create all remaining days through Day 365
insert into public.reading_plans (day_number, title, description, created_at) values
(120, 'Day 120. Sunday, 31st May, 2026', '2 Samuel 19:31-20:26, Psalm 7, 2 Samuel 21:1-22, 1 Chronicles 20:4-8', '2026-05-31T06:00:00Z'),
(225, 'Day 225. Sunday, 13th September, 2026', 'Jeremiah 31:15-40, Jeremiah 49:34-51:14', '2026-09-13T06:00:00Z'),
(226, 'Day 226. Monday, 14th September, 2026', 'Jeremiah 51:15-58, 2 Chronicles 36:10, 2 Kings 24:10-17, 1 Chronicles 3:10-16, 2 Chronicles 36:11-14, Jeremiah 52:1-3, 2 Kings 24:18-20, Jeremiah 37:1-10', '2026-09-14T06:00:00Z'),
(227, 'Day 227. Tuesday, 15th September, 2026', 'Jeremiah 37:11-38:28, Ezekiel 1:1-3:15', '2026-09-15T06:00:00Z'),
(228, 'Day 228. Wednesday, 16th September, 2026', 'Ezekiel 3:16-4:17, Jeremiah 27:1-28:17, Jeremiah 51:59-64', '2026-09-16T06:00:00Z'),
(229, 'Day 229. Thursday, 17th September, 2026', 'Ezekiel 5:1-9:11', '2026-09-17T06:00:00Z'),
(230, 'Day 230. Friday, 18th September, 2026', 'Ezekiel 10:1-13:23', '2026-09-18T06:00:00Z'),
(231, 'Day 231. Saturday, 19th September, 2026', 'Ezekiel 14:1-16:63', '2026-09-19T06:00:00Z'),
(232, 'Day 232. Sunday, 20th September, 2026', 'Ezekiel 17:1-19:14', '2026-09-20T06:00:00Z'),
(233, 'Day 233. Monday, 21st September, 2026', 'Ezekiel 20:1-22:16', '2026-09-21T06:00:00Z'),
(234, 'Day 234. Tuesday, 22nd September, 2026', 'Ezekiel 22:17-23:49, 2 Kings 24:20-25:2, Jeremiah 52:3-5, Jeremiah 39:1, Ezekiel 24:1-14', '2026-09-22T06:00:00Z'),
(235, 'Day 235. Wednesday, 23rd September, 2026', 'Ezekiel 24:15-25:17, Jeremiah 34:1-22, Jeremiah 21:1-14, Ezekiel 29:1-16, Ezekiel 30:20-31:18', '2026-09-23T06:00:00Z'),
(236, 'Day 236. Thursday, 24th September, 2026', 'Jeremiah 32:1-33:26, Ezekiel 26:1-14', '2026-09-24T06:00:00Z'),
(237, 'Day 237. Friday, 25th September, 2026', 'Ezekiel 26:15-28:26, 2 Kings 25:3-7, Jeremiah 52:6-11, Jeremiah 39:2-10', '2026-09-25T06:00:00Z'),
(238, 'Day 238. Saturday, 26th September, 2026', 'Jeremiah 39:11-18, Jeremiah 40:1-6, 2 Kings 25:8-21, Jeremiah 52:12-27, 2 Chronicles 36:15-21, Lamentations 1:1-22', '2026-09-26T06:00:00Z'),
(239, 'Day 239. Sunday, 27th September, 2026', 'Lamentations 2:1-4:22', '2026-09-27T06:00:00Z'),
(240, 'Day 240. Monday, 28th September, 2026', 'Lamentations 5:1-22, Obadiah 1:1-21, 2 Kings 25:22-26, Jeremiah 40:7-41:18', '2026-09-28T06:00:00Z'),
(241, 'Day 241. Tuesday, 29th September, 2026', 'Jeremiah 42:1-44:30, Ezekiel 33:21-33', '2026-09-29T06:00:00Z'),
(242, 'Day 242. Wednesday, 30th September, 2026', 'Ezekiel 34:1-36:38', '2026-09-30T06:00:00Z'),
(243, 'Day 243. Thursday, 1st October, 2026', 'Ezekiel 37:1-39:29, Ezekiel 32:1-16', '2026-10-01T06:00:00Z'),
(244, 'Day 244. Friday, 2nd October, 2026', 'Ezekiel 32:17-33:20, Jeremiah 52:28-30, Psalm 137:1-9, 1 Chronicles 4:24-5:17', '2026-10-02T06:00:00Z'),
(245, 'Day 245. Saturday, 3rd October, 2026', '1 Chronicles 5:18-26, 1 Chronicles 6:3, 1 Chronicles 6:49, 1 Chronicles 6:4-15, 1 Chronicles 7:1-8:28', '2026-10-03T06:00:00Z'),
(246, 'Day 246. Sunday, 4th October, 2026', '1 Chronicles 8:29-9:1, Daniel 4:1-37, Ezekiel 40:1-37', '2026-10-04T06:00:00Z'),
(247, 'Day 247. Monday, 5th October, 2026', 'Ezekiel 40:38-43:27', '2026-10-05T06:00:00Z'),
(248, 'Day 248. Tuesday, 6th October, 2026', 'Ezekiel 44:1-46:24', '2026-10-06T06:00:00Z'),
(249, 'Day 249. Wednesday, 7th October, 2026', 'Ezekiel 47:1-48:35, Ezekiel 29:17-30:19, 2 Kings 25:27-30, Jeremiah 52:31-34', '2026-10-07T06:00:00Z'),
(250, 'Day 250. Thursday, 8th October, 2026', 'Daniel 7:1-8:27, Daniel 5:1-31', '2026-10-08T06:00:00Z'),
(251, 'Day 251. Friday, 9th October, 2026', 'Daniel 6:1-28, Daniel 9:1-27, 2 Chronicles 36:22-23, Ezra 1:1-11, 1 Chronicles 3:17-19', '2026-10-09T06:00:00Z'),
(252, 'Day 252. Saturday, 10th October, 2026', 'Ezra 2:1-4:5, 1 Chronicles 3:19-24', '2026-10-10T06:00:00Z'),
(253, 'Day 253. Sunday, 11th October, 2026', 'Daniel 10:1-12:13, Ezra 4:24-5:1, Haggai 1:1-15', '2026-10-11T06:00:00Z'),
(254, 'Day 254. Monday, 12th October, 2026', 'Haggai 2:1-9, Zechariah 1:1-6, Haggai 2:10-19, Ezra 5:2, Haggai 2:20-23, Zechariah 1:7-5:11', '2026-10-12T06:00:00Z'),
(255, 'Day 255. Tuesday, 13th October, 2026', 'Zechariah 6:1-15, Ezra 5:3-6:14, Zechariah 7:1-8:23', '2026-10-13T06:00:00Z'),
(256, 'Day 256. Wednesday, 14th October, 2026', 'Zechariah 9:1-14:21', '2026-10-14T06:00:00Z'),
(257, 'Day 257. Thursday, 15th October, 2026', 'Ezra 6:14-22, Ezra 4:6, Esther 1:1-4:17', '2026-10-15T06:00:00Z'),
(258, 'Day 258. Friday, 16th October, 2026', 'Esther 5:1-10:3', '2026-10-16T06:00:00Z'),
(259, 'Day 259. Saturday, 17th October, 2026', 'Ezra 4:7-23, Ezra 7:1-8:36', '2026-10-17T06:00:00Z'),
(260, 'Day 260. Sunday, 18th October, 2026', 'Ezra 9:1-10:44, Nehemiah 1:1-2:20', '2026-10-18T06:00:00Z'),
(261, 'Day 261. Monday, 19th October, 2026', 'Nehemiah 3:1-7:3', '2026-10-19T06:00:00Z'),
(262, 'Day 262. Tuesday, 20th October, 2026', 'Nehemiah 7:4-8:12', '2026-10-20T06:00:00Z'),
(263, 'Day 263. Wednesday, 21st October, 2026', 'Nehemiah 8:13-10:39', '2026-10-21T06:00:00Z'),
(264, 'Day 264. Thursday, 22nd October, 2026', 'Nehemiah 11:1-12:26, 1 Chronicles 9:1-34', '2026-10-22T06:00:00Z'),
(265, 'Day 265. Friday, 23rd October, 2026', 'Nehemiah 12:27-13:6, Nehemiah 5:14-19, Nehemiah 13:7-31, Malachi 1:1-2:9', '2026-10-23T06:00:00Z'),
(266, 'Day 266. Saturday, 24th October, 2026', 'Malachi 2:10-4:6, Joel 1:1-3:21', '2026-10-24T06:00:00Z'),
(267, 'Day 267. Sunday, 25th October, 2026', 'Mark 1:1, Luke 1:1-4, John 1:1-18, Matthew 1:1-17, Luke 3:23-38, Luke 1:5-38', '2026-10-25T06:00:00Z'),
(268, 'Day 268. Monday, 26th October, 2026', 'Luke 1:39-80, Matthew 1:18-25, Luke 2:1-40', '2026-10-26T06:00:00Z'),
(269, 'Day 269. Tuesday, 27th October, 2026', 'Matthew 2:1-23, Luke 2:41-52, Mark 1:2-8, Matthew 3:1-12, Luke 3:1-18, Mark 1:9-11, Matthew 3:13-17, Luke 3:21-22', '2026-10-27T06:00:00Z'),
(270, 'Day 270. Wednesday, 28th October, 2026', 'Mark 1:12-13, Matthew 4:1-11, Luke 4:1-15, John 1:19-2:25', '2026-10-28T06:00:00Z'),
(271, 'Day 271. Thursday, 29th October, 2026', 'John 3:1-4:45, Luke 3:19-20', '2026-10-29T06:00:00Z'),
(272, 'Day 272. Friday, 30th October, 2026', 'Mark 1:14-15, Matthew 4:12-17, Luke 3:23, John 4:46-54, Luke 4:16-30, Mark 1:16-20, Matthew 4:18-22, Mark 1:21-28, Luke 4:31-37, Mark 1:29-34, Matthew 8:14-17, Luke 4:38-41, Mark 1:35-39, Luke 4:42-44, Matthew 4:23-25', '2026-10-30T06:00:00Z'),
(273, 'Day 273. Saturday, 31st October, 2026', 'Luke 5:1-11, Mark 1:40-45, Matthew 8:1-4, Luke 5:12-16, Mark 2:1-12, Matthew 9:1-8, Luke 5:17-26, Mark 2:13-17, Matthew 9:9-13, Luke 5:27-32, Mark 2:18-22, Matthew 9:14-17, Luke 5:33-39', '2026-10-31T06:00:00Z'),
(274, 'Day 274. Sunday, 1st November, 2026', 'John 5:1-47, Mark 2:23-28, Matthew 12:1-8, Luke 6:1-5, Mark 3:1-6, Matthew 12:9-14, Luke 6:6-11, Matthew 12:15-21', '2026-11-01T06:00:00Z'),
(275, 'Day 275. Monday, 2nd November, 2026', 'Mark 3:7-19, Luke 6:12-16, Matthew 5:1-12, Luke 6:17-26, Matthew 5:13-48, Luke 6:27-36, Matthew 6:1-4', '2026-11-02T06:00:00Z'),
(276, 'Day 276. Tuesday, 3rd November, 2026', 'Matthew 6:5-7:6, Luke 6:37-42, Matthew 7:7-20, Luke 6:43-45, Matthew 7:21-29, Luke 6:46-49', '2026-11-03T06:00:00Z'),
(277, 'Day 277. Wednesday, 4th November, 2026', 'Matthew 8:5-13, Luke 7:1-17, Matthew 11:1-19, Luke 7:18-35, Matthew 11:20-30, Luke 7:36-50', '2026-11-04T06:00:00Z'),
(278, 'Day 278. Thursday, 5th November, 2026', 'Luke 8:1-3, Mark 3:20-30, Matthew 12:22-45, Mark 3:31-35, Matthew 12:46-50, Luke 8:19-21, Mark 4:1-9, Matthew 13:1-9, Luke 8:4-8, Mark 4:10-20', '2026-11-05T06:00:00Z'),
(279, 'Day 279. Friday, 6th November, 2026', 'Matthew 13:10-23, Luke 8:9-18, Mark 4:21-29, Matthew 13:24-30, Mark 4:30-34, Matthew 13:31-52, Mark 4:35-41, Matthew 8:23-27, Luke 8:22-25', '2026-11-06T06:00:00Z'),
(280, 'Day 280. Saturday, 7th November, 2026', 'Mark 5:1-20, Matthew 8:28-34, Luke 8:26-39, Mark 5:21-43, Matthew 9:18-26, Luke 8:40-56', '2026-11-07T06:00:00Z'),
(281, 'Day 281. Sunday, 8th November, 2026', 'Matthew 9:27-34, Mark 6:1-6, Matthew 13:53-58, Matthew 9:35-38, Mark 6:7-13, Matthew 10:1-42, Luke 9:1-6', '2026-11-08T06:00:00Z'),
(282, 'Day 282. Monday, 9th November, 2026', 'Luke 9:7-9, Mark 6:14-29, Matthew 14:1-21, Luke 9:10-17, John 6:1-15, Matthew 14:22-33, John 6:16-21, Mark 6:53-56, Matthew 14:34-36', '2026-11-09T06:00:00Z'),
(283, 'Day 283. Tuesday, 10th November, 2026', 'John 6:22-71, Mark 7:1-23, Matthew 15:1-20', '2026-11-10T06:00:00Z'),
(284, 'Day 284. Wednesday, 11th November, 2026', 'Mark 7:24-30, Matthew 15:21-28, Mark 7:31-37, Matthew 15:29-31, Mark 8:1-10, Matthew 15:32-16:4, Mark 8:11-21, Matthew 16:5-12', '2026-11-11T06:00:00Z'),
(285, 'Day 285. Thursday, 12th November, 2026', 'Mark 8:22-30, Matthew 16:13-20, Luke 9:18-20, Mark 8:31-9:1, Matthew 16:21-28, Luke 9:21-27, Mark 9:2-13, Matthew 17:1-13, Luke 9:28-36', '2026-11-12T06:00:00Z'),
(286, 'Day 286. Friday, 13th November, 2026', 'Mark 9:14-29, Matthew 17:14-21, Luke 9:37-43, Mark 9:30-32, Matthew 17:22-23, Luke 9:43-45, Mark 9:33-37, Matthew 18:1-6, Luke 9:46-48, Mark 9:38-41, Luke 9:49-50, Matthew 18:7-35, Luke 9:51, John 7:2-9', '2026-11-13T06:00:00Z'),
(287, 'Day 287. Saturday, 14th November, 2026', 'John 7:1, Luke 9:51-56, Matthew 8:18-22, Luke 9:57-62, John 7:10-8:20', '2026-11-14T06:00:00Z'),
(288, 'Day 288. Sunday, 15th November, 2026', 'John 8:21-59, Luke 10:1-11:13', '2026-11-15T06:00:00Z'),
(289, 'Day 289. Monday, 16th November, 2026', 'Luke 11:14-12:34', '2026-11-16T06:00:00Z'),
(290, 'Day 290. Tuesday, 17th November, 2026', 'Luke 12:35-13:21, John 9:1-41', '2026-11-17T06:00:00Z'),
(291, 'Day 291. Wednesday, 18th November, 2026', 'John 10:1-42, Luke 13:22-14:24', '2026-11-18T06:00:00Z'),
(292, 'Day 292. Thursday, 19th November, 2026', 'Luke 14:25-17:10, John 11:1-37', '2026-11-19T06:00:00Z'),
(293, 'Day 293. Friday, 20th November, 2026', 'John 11:38-57, Luke 17:11-18:8', '2026-11-20T06:00:00Z'),
(294, 'Day 294. Saturday, 21st November, 2026', 'Luke 18:9-14, Mark 10:1-12, Matthew 19:1-12, Mark 10:13-16, Matthew 19:13-15, Luke 18:15-17, Mark 10:17-31, Matthew 19:16-30, Luke 18:18-30', '2026-11-21T06:00:00Z'),
(295, 'Day 295. Sunday, 22nd November, 2026', 'Matthew 20:1-16, Mark 10:32-34, Matthew 20:17-19, Luke 18:31-34, Mark 10:35-45, Matthew 20:20-34, Mark 10:46-52, Luke 18:35-19:27', '2026-11-22T06:00:00Z'),
(296, 'Day 296. Monday, 23rd November, 2026', 'Mark 14:3-9, Matthew 26:6-13, John 12:1-11, Mark 11:1-11, Matthew 21:1-11, Luke 19:28-40, John 12:12-19, Luke 19:41-44, John 12:20-36', '2026-11-23T06:00:00Z'),
(297, 'Day 297. Tuesday, 24th November, 2026', 'John 12:37-50, Mark 11:12-14, Matthew 21:18-22, Mark 11:15-19, Matthew 21:12-17, Luke 19:45-48, Mark 11:20-33, Matthew 21:23-27, Luke 20:1-8', '2026-11-24T06:00:00Z'),
(298, 'Day 298. Wednesday, 25th November, 2026', 'Matthew 21:28-32, Mark 12:1-12, Matthew 21:33-46, Luke 20:9-19, Matthew 22:1-14, Mark 12:13-17, Matthew 22:15-22, Luke 20:20-26, Mark 12:18-27, Matthew 22:23-33, Luke 20:27-40', '2026-11-25T06:00:00Z'),
(299, 'Day 299. Thursday, 26th November, 2026', 'Mark 12:28-34, Matthew 22:34-40, Mark 12:35-37, Matthew 22:41-46, Luke 20:41-44, Mark 12:38-40, Matthew 23:1-12, Luke 20:45-47, Matthew 23:13-39, Mark 12:41-44, Luke 21:1-4', '2026-11-26T06:00:00Z'),
(300, 'Day 300. Friday, 27th November, 2026', 'Mark 13:1-23, Matthew 24:1-25, Luke 21:5-24, Mark 13:24-31, Matthew 24:26-35, Luke 21:25-33', '2026-11-27T06:00:00Z'),
(301, 'Day 301. Saturday, 28th November, 2026', 'Mark 13:32-37, Matthew 24:36-51, Luke 21:34-38, Matthew 25:1-46', '2026-11-28T06:00:00Z'),
(302, 'Day 302. Sunday, 29th November, 2026', 'Mark 14:1-2, Matthew 26:1-5, Luke 22:1-2, Mark 14:10-11, Matthew 26:14-16, Luke 22:3-6, Mark 14:12-16, Matthew 26:17-19, Luke 22:7-13, John 13:1-20, Mark 14:17-26, Matthew 26:20-30, Luke 22:14-30, John 13:18-30', '2026-11-29T06:00:00Z'),
(303, 'Day 303. Monday, 30th November, 2026', 'John 13:31-38, Mark 14:27-31, Matthew 26:31-35, Luke 22:31-38, John 14:1-15:17', '2026-11-30T06:00:00Z'),
(304, 'Day 304. Tuesday, 1st December, 2026', 'John 15:18-17:26', '2026-12-01T06:00:00Z'),
(305, 'Day 305. Wednesday, 2nd December, 2026', 'John 18:1-2, Mark 14:32-42, Matthew 26:36-46, Luke 22:39-46, Mark 14:43-52, Matthew 26:47-56, Luke 22:47-53, John 18:3-24', '2026-12-02T06:00:00Z'),
(306, 'Day 306. Thursday, 3rd December, 2026', 'Mark 14:53-65, Matthew 26:57-68, Mark 14:66-72, Matthew 26:69-75, Luke 22:54-65, John 18:25-27, Mark 15:1, Matthew 27:1-2, Luke 22:66-71, Matthew 27:3-10', '2026-12-03T06:00:00Z'),
(307, 'Day 307. Friday, 4th December, 2026', 'Mark 15:2-5, Matthew 27:11-14, Luke 23:1-12, John 18:28-40, Mark 15:6-15, Matthew 27:15-26, Luke 23:13-25, John 19:1-16, Mark 15:16-20, Matthew 27:27-31', '2026-12-04T06:00:00Z'),
(308, 'Day 308. Saturday, 5th December, 2026', 'Mark 15:21-24, Matthew 27:32-34, Luke 23:26-31, John 19:17, Mark 15:25-32, Matthew 27:35-44, Luke 23:32-43, John 19:18-27, Mark 15:33-41, Matthew 27:45-56, Luke 23:44-49, John 19:28-37', '2026-12-05T06:00:00Z'),
(309, 'Day 309. Sunday, 6th December, 2026', 'Mark 15:42-47, Matthew 27:57-61, Luke 23:50-56, John 19:38-42, Matthew 27:62-66, Mark 16:1-8, Matthew 28:1-7, Luke 24:1-12, Mark 16:9-13, John 20:1-18, Matthew 28:8-15', '2026-12-06T06:00:00Z'),
(310, 'Day 310. Monday, 7th December, 2026', 'Luke 24:13-43, Mark 16:12-13, John 20:19-23, Mark 16:14, John 20:24-21:25, Matthew 28:16-20, Mark 16:15-18, Luke 24:44-49', '2026-12-07T06:00:00Z'),
(311, 'Day 311. Tuesday, 8th December, 2026', 'Mark 16:19-20, Luke 24:50-53, Acts 1:1-2:47', '2026-12-08T06:00:00Z'),
(312, 'Day 312. Wednesday, 9th December, 2026', 'Acts 3:1-5:42', '2026-12-09T06:00:00Z'),
(313, 'Day 313. Thursday, 10th December, 2026', 'Acts 6:1-8:1', '2026-12-10T06:00:00Z'),
(314, 'Day 314. Friday, 11th December, 2026', 'Acts 8:1-9:43', '2026-12-11T06:00:00Z'),
(315, 'Day 315. Saturday, 12th December, 2026', 'Acts 10:1-12:5', '2026-12-12T06:00:00Z'),
(316, 'Day 316. Sunday, 13th December, 2026', 'Acts 12:6-14:20', '2026-12-13T06:00:00Z'),
(317, 'Day 317. Monday, 14th December, 2026', 'Acts 14:21-28, Galatians 1:1-3:23', '2026-12-14T06:00:00Z'),
(318, 'Day 318. Tuesday, 15th December, 2026', 'Galatians 3:24-6:18, Acts 15:1-21', '2026-12-15T06:00:00Z'),
(319, 'Day 319. Wednesday, 16th December, 2026', 'Acts 15:22-17:15', '2026-12-16T06:00:00Z'),
(320, 'Day 320. Thursday, 17th December, 2026', 'Acts 17:16-18:3, 1 Thessalonians 1:1-5:11', '2026-12-17T06:00:00Z'),
(321, 'Day 321. Friday, 18th December, 2026', '1 Thessalonians 5:12-28, 2 Thessalonians 1:1-3:18, Acts 18:4-23', '2026-12-18T06:00:00Z'),
(322, 'Day 322. Saturday, 19th December, 2026', 'Acts 18:24-19:20, 1 Corinthians 1:1-3:23', '2026-12-19T06:00:00Z'),
(323, 'Day 323. Sunday, 20th December, 2026', '1 Corinthians 4:1-7:40', '2026-12-20T06:00:00Z'),
(324, 'Day 324. Monday, 21st December, 2026', '1 Corinthians 8:1-11:1', '2026-12-21T06:00:00Z'),
(325, 'Day 325. Tuesday, 22nd December, 2026', '1 Corinthians 11:2-13:13', '2026-12-22T06:00:00Z'),
(326, 'Day 326. Wednesday, 23rd December, 2026', '1 Corinthians 14:1-15:58', '2026-12-23T06:00:00Z'),
(327, 'Day 327. Thursday, 24th December, 2026', '1 Corinthians 16:1-24, Acts 19:21-20:6, Romans 1:1-32', '2026-12-24T06:00:00Z'),
(328, 'Day 328. Friday, 25th December, 2026', 'Romans 2:1-4:25', '2026-12-25T06:00:00Z'),
(329, 'Day 329. Saturday, 26th December, 2026', 'Romans 5:1-8:17', '2026-12-26T06:00:00Z'),
(330, 'Day 330. Sunday, 27th December, 2026', 'Romans 8:18-10:21', '2026-12-27T06:00:00Z'),
(331, 'Day 331. Monday, 28th December, 2026', 'Romans 11:1-14:23', '2026-12-28T06:00:00Z'),
(332, 'Day 332. Tuesday, 29th December, 2026', 'Romans 15:1-16:27, 2 Corinthians 1:1-2:4', '2026-12-29T06:00:00Z'),
(333, 'Day 333. Wednesday, 30th December, 2026', '2 Corinthians 2:5-6:13', '2026-12-30T06:00:00Z'),
(334, 'Day 334. Thursday, 31st December, 2026', '2 Corinthians 6:14-10:18', '2026-12-31T06:00:00Z'),
(335, 'Day 335. Friday, 1st January, 2027', '2 Corinthians 11:1-13:13, Acts 20:7-12', '2027-01-01T06:00:00Z'),
(336, 'Day 336. Saturday, 2nd January, 2027', 'Acts 20:13-21:36', '2027-01-02T06:00:00Z'),
(337, 'Day 337. Sunday, 3rd January, 2027', 'Acts 21:37-23:35', '2027-01-03T06:00:00Z'),
(338, 'Day 338. Monday, 4th January, 2027', 'Acts 24:1-26:32', '2027-01-04T06:00:00Z'),
(339, 'Day 339. Tuesday, 5th January, 2027', 'Acts 27:1-44', '2027-01-05T06:00:00Z'),
(340, 'Day 340. Wednesday, 6th January, 2027', 'Acts 28:1-31, Ephesians 1:1-2:22', '2027-01-06T06:00:00Z'),
(341, 'Day 341. Thursday, 7th January, 2027', 'Ephesians 3:1-5:14', '2027-01-07T06:00:00Z'),
(342, 'Day 342. Friday, 8th January, 2027', 'Ephesians 5:15-6:23, Colossians 1:1-23', '2027-01-08T06:00:00Z'),
(343, 'Day 343. Saturday, 9th January, 2027', 'Colossians 1:24-4:18', '2027-01-09T06:00:00Z'),
(344, 'Day 344. Sunday, 10th January, 2027', 'Philemon 1:1-25, Philippians 1:1-2:11', '2027-01-10T06:00:00Z'),
(345, 'Day 345. Monday, 11th January, 2027', 'Philippians 2:12-4:23', '2027-01-11T06:00:00Z'),
(346, 'Day 346. Tuesday, 12th January, 2027', 'James 1:1-3:18', '2027-01-12T06:00:00Z'),
(347, 'Day 347. Wednesday, 13th January, 2027', 'James 4:1-5:20, 1 Timothy 1:1-2:15', '2027-01-13T06:00:00Z'),
(348, 'Day 348. Thursday, 14th January, 2027', '1 Timothy 3:1-6:10', '2027-01-14T06:00:00Z'),
(349, 'Day 349. Friday, 15th January, 2027', '1 Timothy 6:11-21, Titus 1:1-3:15, 2 Timothy 1:1-18', '2027-01-15T06:00:00Z'),
(350, 'Day 350. Saturday, 16th January, 2027', '2 Timothy 2:1-4:18', '2027-01-16T06:00:00Z'),
(351, 'Day 351. Sunday, 17th January, 2027', '2 Timothy 4:19-22, Hebrews 1:1-4:13', '2027-01-17T06:00:00Z'),
(352, 'Day 352. Monday, 18th January, 2027', 'Hebrews 4:14-7:28', '2027-01-18T06:00:00Z'),
(353, 'Day 353. Tuesday, 19th January, 2027', 'Hebrews 8:1-10:39', '2027-01-19T06:00:00Z'),
(354, 'Day 354. Wednesday, 20th January, 2027', 'Hebrews 11:1-12:29', '2027-01-20T06:00:00Z'),
(355, 'Day 355. Thursday, 21st January, 2027', 'Hebrews 13:1-25, 1 Peter 1:1-2:3', '2027-01-21T06:00:00Z'),
(356, 'Day 356. Friday, 22nd January, 2027', '1 Peter 2:4-5:11', '2027-01-22T06:00:00Z'),
(357, 'Day 357. Saturday, 23rd January, 2027', '1 Peter 5:12-14, 2 Peter 1:1-3:18', '2027-01-23T06:00:00Z'),
(358, 'Day 358. Sunday, 24th January, 2027', '1 John 1:1-4:6', '2027-01-24T06:00:00Z'),
(359, 'Day 359. Monday, 25th January, 2027', '1 John 4:7-5:21, 2 John 1:1-13, 3 John 1:1-15', '2027-01-25T06:00:00Z'),
(360, 'Day 360. Tuesday, 26th January, 2027', 'Jude 1:1-25, Revelation 1:1-2:29', '2027-01-26T06:00:00Z'),
(361, 'Day 361. Wednesday, 27th January, 2027', 'Revelation 3:1-6:17', '2027-01-27T06:00:00Z'),
(362, 'Day 362. Thursday, 28th January, 2027', 'Revelation 7:1-10:11', '2027-01-28T06:00:00Z'),
(363, 'Day 363. Friday, 29th January, 2027', 'Revelation 11:1-14:20', '2027-01-29T06:00:00Z'),
(364, 'Day 364. Saturday, 30th January, 2027', 'Revelation 15:1-18:24', '2027-01-30T06:00:00Z'),
(365, 'Day 365. Sunday, 31st January, 2027', 'Revelation 19:1-22:21', '2027-01-31T06:00:00Z');

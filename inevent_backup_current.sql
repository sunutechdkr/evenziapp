--
-- PostgreSQL database dump
--

-- Dumped from database version 14.17 (Homebrew)
-- Dumped by pg_dump version 14.17 (Homebrew)

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
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: mac
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO mac;

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: mac
--

CREATE TABLE public.accounts (
    id text NOT NULL,
    user_id text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    provider_account_id text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);


ALTER TABLE public.accounts OWNER TO mac;

--
-- Name: event_sessions; Type: TABLE; Schema: public; Owner: mac
--

CREATE TABLE public.event_sessions (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    start_date timestamp(3) without time zone NOT NULL,
    end_date timestamp(3) without time zone NOT NULL,
    start_time text NOT NULL,
    end_time text NOT NULL,
    location text,
    speaker text,
    capacity integer,
    event_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.event_sessions OWNER TO mac;

--
-- Name: events; Type: TABLE; Schema: public; Owner: mac
--

CREATE TABLE public.events (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    location text NOT NULL,
    slug text NOT NULL,
    banner text,
    start_date timestamp(3) without time zone NOT NULL,
    end_date timestamp(3) without time zone NOT NULL,
    start_time text,
    end_time text,
    sector text,
    type text,
    format text,
    timezone text,
    video_url text,
    support_email text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    user_id text NOT NULL,
    logo text
);


ALTER TABLE public.events OWNER TO mac;

--
-- Name: registrations; Type: TABLE; Schema: public; Owner: mac
--

CREATE TABLE public.registrations (
    id text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    type text DEFAULT 'PARTICIPANT'::text NOT NULL,
    event_id text NOT NULL,
    qr_code text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    checked_in boolean DEFAULT false NOT NULL,
    check_in_time timestamp(3) without time zone
);


ALTER TABLE public.registrations OWNER TO mac;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: mac
--

CREATE TABLE public.sessions (
    id text NOT NULL,
    session_token text NOT NULL,
    user_id text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO mac;

--
-- Name: users; Type: TABLE; Schema: public; Owner: mac
--

CREATE TABLE public.users (
    id text NOT NULL,
    name text,
    email text,
    email_verified timestamp(3) without time zone,
    image text,
    password text,
    role text DEFAULT 'USER'::text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO mac;

--
-- Name: verification_tokens; Type: TABLE; Schema: public; Owner: mac
--

CREATE TABLE public.verification_tokens (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.verification_tokens OWNER TO mac;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: mac
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
407b0979-c40a-42fc-9ac6-a8993001a2ff	9a25797b36e8c302d4aa7a7aa7a09c727d515c76615d68d69178fb58eb774c0e	2025-05-09 13:33:20.463516+00	20250425015244_init	\N	\N	2025-05-09 13:33:20.453258+00	1
8b78e4f5-7715-4661-92ca-2d133c10af3b	820e09d1f5b3aaae993f9ca53da5217123763da87edb9b0e96343e06a9d70630	2025-05-09 13:33:20.465107+00	20250430012025_add_event_fields	\N	\N	2025-05-09 13:33:20.463854+00	1
0215e319-a881-421a-89e4-b56fb377fa84	3c64dbda5723847acca174e31da6931abe100e1d7d2f82519d3a0745e272f8a4	2025-05-09 13:33:20.466489+00	20250430204805_remove_event_date	\N	\N	2025-05-09 13:33:20.465427+00	1
b0aeb4ca-c98b-4dae-8a79-d7fb477e5679	373550b994dc8412fd12a140110cc5952ca24db8c3c98c719ae51693e1cdb925	2025-05-09 13:33:20.469682+00	20250501001459_remove_event_and_registration_models	\N	\N	2025-05-09 13:33:20.466799+00	1
002f4dee-40c0-4fa2-8b6b-3e42f63e479b	542b23d9ea14730c65a693d4a6bec9ad5b3e2c6614a6e4edf785dcf14c03cc3c	2025-05-09 13:33:20.473394+00	20250501002231_add_event_model	\N	\N	2025-05-09 13:33:20.469967+00	1
09cf773b-f82d-47b6-a7ea-1f02c0e4a727	5600ff5dff88f5182deaf9e3287a65de786196baac279237b330164e4ba2a959	2025-05-09 13:33:20.47715+00	20250501003228_add_registration_model	\N	\N	2025-05-09 13:33:20.473725+00	1
de18fe04-c1e5-414c-96fd-676ea7841c8f	d684262ff3bb170e147747bb75deae36a514c65c892226d9875f93690cd629c7	2025-05-09 13:33:20.478911+00	20250501130755_add_event_logo	\N	\N	2025-05-09 13:33:20.477652+00	1
62a64af3-d72b-4c7e-90ad-03ef680f2255	a19939a8783557888f23e773156a7c824ddf1056a92e00179354ab33b1cacdbe	2025-05-09 13:33:20.481917+00	20250509132719_add_event_sessions	\N	\N	2025-05-09 13:33:20.479213+00	1
\.


--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: mac
--

COPY public.accounts (id, user_id, type, provider, provider_account_id, refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
\.


--
-- Data for Name: event_sessions; Type: TABLE DATA; Schema: public; Owner: mac
--

COPY public.event_sessions (id, title, description, start_date, end_date, start_time, end_time, location, speaker, capacity, event_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: mac
--

COPY public.events (id, name, description, location, slug, banner, start_date, end_date, start_time, end_time, sector, type, format, timezone, video_url, support_email, created_at, updated_at, user_id, logo) FROM stdin;
\.


--
-- Data for Name: registrations; Type: TABLE DATA; Schema: public; Owner: mac
--

COPY public.registrations (id, first_name, last_name, email, phone, type, event_id, qr_code, created_at, updated_at, checked_in, check_in_time) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: mac
--

COPY public.sessions (id, session_token, user_id, expires) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: mac
--

COPY public.users (id, name, email, email_verified, image, password, role, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: verification_tokens; Type: TABLE DATA; Schema: public; Owner: mac
--

COPY public.verification_tokens (identifier, token, expires) FROM stdin;
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: mac
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: mac
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: event_sessions event_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: mac
--

ALTER TABLE ONLY public.event_sessions
    ADD CONSTRAINT event_sessions_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: mac
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: registrations registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: mac
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: mac
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: mac
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: accounts_provider_provider_account_id_key; Type: INDEX; Schema: public; Owner: mac
--

CREATE UNIQUE INDEX accounts_provider_provider_account_id_key ON public.accounts USING btree (provider, provider_account_id);


--
-- Name: events_slug_key; Type: INDEX; Schema: public; Owner: mac
--

CREATE UNIQUE INDEX events_slug_key ON public.events USING btree (slug);


--
-- Name: registrations_qr_code_key; Type: INDEX; Schema: public; Owner: mac
--

CREATE UNIQUE INDEX registrations_qr_code_key ON public.registrations USING btree (qr_code);


--
-- Name: sessions_session_token_key; Type: INDEX; Schema: public; Owner: mac
--

CREATE UNIQUE INDEX sessions_session_token_key ON public.sessions USING btree (session_token);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: mac
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: verification_tokens_identifier_token_key; Type: INDEX; Schema: public; Owner: mac
--

CREATE UNIQUE INDEX verification_tokens_identifier_token_key ON public.verification_tokens USING btree (identifier, token);


--
-- Name: accounts accounts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mac
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: event_sessions event_sessions_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mac
--

ALTER TABLE ONLY public.event_sessions
    ADD CONSTRAINT event_sessions_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: events events_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mac
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: registrations registrations_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mac
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mac
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


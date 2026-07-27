--
-- PostgreSQL database dump
--

\restrict EznCQIlUdarFMqBpFomee93sOTudDGiBOVcOxvTbWBPl7zdDEs5J3FKXfx1Sbxp

-- Dumped from database version 17.10
-- Dumped by pg_dump version 17.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE ONLY public.watchlists DROP CONSTRAINT "watchlists_userId_fkey";
ALTER TABLE ONLY public.watchlist_items DROP CONSTRAINT "watchlist_items_watchlistId_fkey";
ALTER TABLE ONLY public.watchlist_items DROP CONSTRAINT "watchlist_items_stockId_fkey";
ALTER TABLE ONLY public.vip_signals DROP CONSTRAINT "vip_signals_stockId_fkey";
ALTER TABLE ONLY public.vip_signals DROP CONSTRAINT "vip_signals_authorId_fkey";
ALTER TABLE ONLY public.users DROP CONSTRAINT "users_teamId_fkey";
ALTER TABLE ONLY public.users DROP CONSTRAINT "users_departmentId_fkey";
ALTER TABLE ONLY public.users DROP CONSTRAINT "users_brokerId_fkey";
ALTER TABLE ONLY public.user_subscriptions DROP CONSTRAINT "user_subscriptions_userId_fkey";
ALTER TABLE ONLY public.user_subscriptions DROP CONSTRAINT "user_subscriptions_planId_fkey";
ALTER TABLE ONLY public.user_sessions DROP CONSTRAINT "user_sessions_userId_fkey";
ALTER TABLE ONLY public.user_roles DROP CONSTRAINT "user_roles_userId_fkey";
ALTER TABLE ONLY public.user_roles DROP CONSTRAINT "user_roles_roleId_fkey";
ALTER TABLE ONLY public.user_roles DROP CONSTRAINT "user_roles_assignedById_fkey";
ALTER TABLE ONLY public.transactions DROP CONSTRAINT "transactions_invoiceId_fkey";
ALTER TABLE ONLY public.teams DROP CONSTRAINT "teams_leaderId_fkey";
ALTER TABLE ONLY public.teams DROP CONSTRAINT "teams_departmentId_fkey";
ALTER TABLE ONLY public.stocks DROP CONSTRAINT "stocks_industryId_fkey";
ALTER TABLE ONLY public.stocks DROP CONSTRAINT "stocks_exchangeId_fkey";
ALTER TABLE ONLY public.stock_prices_daily DROP CONSTRAINT "stock_prices_daily_stockId_fkey";
ALTER TABLE ONLY public.signal_targets DROP CONSTRAINT "signal_targets_signalId_fkey";
ALTER TABLE ONLY public.signal_execution_logs DROP CONSTRAINT "signal_execution_logs_signalId_fkey";
ALTER TABLE ONLY public.role_permissions DROP CONSTRAINT "role_permissions_roleId_fkey";
ALTER TABLE ONLY public.role_permissions DROP CONSTRAINT "role_permissions_permissionId_fkey";
ALTER TABLE ONLY public.role_permissions DROP CONSTRAINT "role_permissions_assignedById_fkey";
ALTER TABLE ONLY public.report_files DROP CONSTRAINT "report_files_uploaderId_fkey";
ALTER TABLE ONLY public.recommended_portfolios DROP CONSTRAINT "recommended_portfolios_managerId_fkey";
ALTER TABLE ONLY public.price_alerts DROP CONSTRAINT "price_alerts_userId_fkey";
ALTER TABLE ONLY public.price_alerts DROP CONSTRAINT "price_alerts_stockId_fkey";
ALTER TABLE ONLY public.portfolio_nav_snapshots DROP CONSTRAINT "portfolio_nav_snapshots_portfolioId_fkey";
ALTER TABLE ONLY public.portfolio_holdings DROP CONSTRAINT "portfolio_holdings_stockId_fkey";
ALTER TABLE ONLY public.portfolio_holdings DROP CONSTRAINT "portfolio_holdings_portfolioId_fkey";
ALTER TABLE ONLY public.password_reset_tokens DROP CONSTRAINT "password_reset_tokens_userId_fkey";
ALTER TABLE ONLY public.notifications DROP CONSTRAINT "notifications_userId_fkey";
ALTER TABLE ONLY public.notification_delivery_logs DROP CONSTRAINT "notification_delivery_logs_notificationId_fkey";
ALTER TABLE ONLY public.invoices DROP CONSTRAINT "invoices_userId_fkey";
ALTER TABLE ONLY public.invoices DROP CONSTRAINT "invoices_subscriptionId_fkey";
ALTER TABLE ONLY public.industries DROP CONSTRAINT "industries_sectorId_fkey";
ALTER TABLE ONLY public.financial_indicators DROP CONSTRAINT "financial_indicators_stockId_fkey";
ALTER TABLE ONLY public.featured_contents DROP CONSTRAINT "featured_contents_blogId_fkey";
ALTER TABLE ONLY public.email_verification_tokens DROP CONSTRAINT "email_verification_tokens_userId_fkey";
ALTER TABLE ONLY public.copy_trade_orders DROP CONSTRAINT "copy_trade_orders_masterId_fkey";
ALTER TABLE ONLY public.copy_trade_copiers DROP CONSTRAINT "copy_trade_copiers_masterId_fkey";
ALTER TABLE ONLY public.content_revisions DROP CONSTRAINT "content_revisions_editorId_fkey";
ALTER TABLE ONLY public.content_revisions DROP CONSTRAINT "content_revisions_blogId_fkey";
ALTER TABLE ONLY public.blogs DROP CONSTRAINT "blogs_categoryId_fkey";
ALTER TABLE ONLY public.blogs DROP CONSTRAINT "blogs_authorId_fkey";
ALTER TABLE ONLY public.blog_tags DROP CONSTRAINT "blog_tags_tagId_fkey";
ALTER TABLE ONLY public.blog_tags DROP CONSTRAINT "blog_tags_blogId_fkey";
ALTER TABLE ONLY public.audit_logs DROP CONSTRAINT "audit_logs_userId_fkey";
DROP INDEX public."watchlists_userId_name_key";
DROP INDEX public."watchlists_userId_idx";
DROP INDEX public."watchlist_items_watchlistId_stockId_key";
DROP INDEX public."vip_signals_stockId_idx";
DROP INDEX public."vip_signals_status_publishedAt_idx";
DROP INDEX public.users_phone_status_idx;
DROP INDEX public.users_phone_key;
DROP INDEX public.users_email_status_idx;
DROP INDEX public.users_email_key;
DROP INDEX public."users_departmentId_teamId_status_idx";
DROP INDEX public."users_brokerId_deletedAt_status_idx";
DROP INDEX public."user_subscriptions_userId_status_idx";
DROP INDEX public."user_subscriptions_endDate_status_idx";
DROP INDEX public."user_sessions_userId_isRevoked_idx";
DROP INDEX public."user_sessions_refreshToken_key";
DROP INDEX public."user_sessions_refreshToken_idx";
DROP INDEX public."user_roles_roleId_idx";
DROP INDEX public."transactions_providerId_idx";
DROP INDEX public."transactions_invoiceId_status_idx";
DROP INDEX public."teams_leaderId_status_idx";
DROP INDEX public."teams_departmentId_status_idx";
DROP INDEX public.teams_code_key;
DROP INDEX public.tags_slug_key;
DROP INDEX public.stocks_symbol_key;
DROP INDEX public.stocks_isin_key;
DROP INDEX public."stocks_industryId_idx";
DROP INDEX public."stocks_exchangeId_status_idx";
DROP INDEX public."stock_prices_daily_stockId_date_key";
DROP INDEX public.stock_prices_daily_date_idx;
DROP INDEX public.stock_exchanges_code_key;
DROP INDEX public."signal_targets_signalId_idx";
DROP INDEX public."signal_execution_logs_signalId_executedAt_idx";
DROP INDEX public.sectors_name_key;
DROP INDEX public.sectors_code_key;
DROP INDEX public.sector_rotation_history_trade_date_sector_code_key;
DROP INDEX public.sector_rotation_history_trade_date_idx;
DROP INDEX public.sector_rotation_history_sector_code_idx;
DROP INDEX public.roles_name_key;
DROP INDEX public.roles_code_key;
DROP INDEX public.research_reports_subject_idx;
DROP INDEX public.research_reports_report_type_idx;
DROP INDEX public."report_files_status_reportType_idx";
DROP INDEX public.recommended_portfolios_status_idx;
DROP INDEX public."price_alerts_userId_idx";
DROP INDEX public."price_alerts_status_stockId_idx";
DROP INDEX public."portfolio_nav_snapshots_portfolioId_date_key";
DROP INDEX public."portfolio_holdings_portfolioId_stockId_key";
DROP INDEX public.permissions_module_action_idx;
DROP INDEX public.permissions_code_key;
DROP INDEX public."payment_webhook_logs_idempotencyKey_key";
DROP INDEX public."password_reset_tokens_userId_idx";
DROP INDEX public.password_reset_tokens_token_key;
DROP INDEX public.password_reset_tokens_token_idx;
DROP INDEX public."outbox_events_status_createdAt_idx";
DROP INDEX public."notifications_userId_status_createdAt_idx";
DROP INDEX public."notification_delivery_logs_notificationId_idx";
DROP INDEX public.money_flow_history_trade_date_ticker_key;
DROP INDEX public.money_flow_history_trade_date_idx;
DROP INDEX public.money_flow_history_ticker_idx;
DROP INDEX public.money_flow_history_sector_code_idx;
DROP INDEX public.market_regime_history_trade_date_index_code_key;
DROP INDEX public.market_regime_history_trade_date_idx;
DROP INDEX public.market_regime_history_index_code_idx;
DROP INDEX public."market_data_sync_logs_status_startedAt_idx";
DROP INDEX public.market_breadth_history_trade_date_idx;
DROP INDEX public.market_breadth_history_trade_date_exchange_key;
DROP INDEX public.market_breadth_history_exchange_idx;
DROP INDEX public."invoices_userId_status_idx";
DROP INDEX public."industries_sectorId_idx";
DROP INDEX public.industries_name_key;
DROP INDEX public.industries_code_key;
DROP INDEX public.foreign_flow_history_trade_date_ticker_key;
DROP INDEX public.foreign_flow_history_trade_date_idx;
DROP INDEX public.foreign_flow_history_ticker_idx;
DROP INDEX public.foreign_flow_history_sector_code_idx;
DROP INDEX public."financial_indicators_stockId_period_date_key";
DROP INDEX public.featured_contents_position_idx;
DROP INDEX public."featured_contents_blogId_key";
DROP INDEX public."email_verification_tokens_userId_idx";
DROP INDEX public."departments_status_deletedAt_idx";
DROP INDEX public.departments_name_key;
DROP INDEX public.departments_code_key;
DROP INDEX public."content_revisions_blogId_createdAt_idx";
DROP INDEX public.categories_slug_key;
DROP INDEX public."blogs_status_publishedAt_idx";
DROP INDEX public.blogs_slug_key;
DROP INDEX public."blogs_categoryId_idx";
DROP INDEX public."blogs_authorId_idx";
DROP INDEX public."audit_logs_userId_createdAt_idx";
DROP INDEX public."audit_logs_tableName_recordId_idx";
DROP INDEX public."audit_logs_action_createdAt_idx";
ALTER TABLE ONLY public.watchlists DROP CONSTRAINT watchlists_pkey;
ALTER TABLE ONLY public.watchlist_items DROP CONSTRAINT watchlist_items_pkey;
ALTER TABLE ONLY public.vip_signals DROP CONSTRAINT vip_signals_pkey;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
ALTER TABLE ONLY public.user_subscriptions DROP CONSTRAINT user_subscriptions_pkey;
ALTER TABLE ONLY public.user_sessions DROP CONSTRAINT user_sessions_pkey;
ALTER TABLE ONLY public.user_roles DROP CONSTRAINT user_roles_pkey;
ALTER TABLE ONLY public.transactions DROP CONSTRAINT transactions_pkey;
ALTER TABLE ONLY public.teams DROP CONSTRAINT teams_pkey;
ALTER TABLE ONLY public.tags DROP CONSTRAINT tags_pkey;
ALTER TABLE ONLY public.subscription_plans DROP CONSTRAINT subscription_plans_pkey;
ALTER TABLE ONLY public.stocks DROP CONSTRAINT stocks_pkey;
ALTER TABLE ONLY public.stock_prices_daily DROP CONSTRAINT stock_prices_daily_pkey;
ALTER TABLE ONLY public.stock_exchanges DROP CONSTRAINT stock_exchanges_pkey;
ALTER TABLE ONLY public.signal_targets DROP CONSTRAINT signal_targets_pkey;
ALTER TABLE ONLY public.signal_execution_logs DROP CONSTRAINT signal_execution_logs_pkey;
ALTER TABLE ONLY public.sectors DROP CONSTRAINT sectors_pkey;
ALTER TABLE ONLY public.sector_rotation_history DROP CONSTRAINT sector_rotation_history_pkey;
ALTER TABLE ONLY public.roles DROP CONSTRAINT roles_pkey;
ALTER TABLE ONLY public.role_permissions DROP CONSTRAINT role_permissions_pkey;
ALTER TABLE ONLY public.research_reports DROP CONSTRAINT research_reports_pkey;
ALTER TABLE ONLY public.report_files DROP CONSTRAINT report_files_pkey;
ALTER TABLE ONLY public.recommended_portfolios DROP CONSTRAINT recommended_portfolios_pkey;
ALTER TABLE ONLY public.price_alerts DROP CONSTRAINT price_alerts_pkey;
ALTER TABLE ONLY public.portfolio_nav_snapshots DROP CONSTRAINT portfolio_nav_snapshots_pkey;
ALTER TABLE ONLY public.portfolio_holdings DROP CONSTRAINT portfolio_holdings_pkey;
ALTER TABLE ONLY public.permissions DROP CONSTRAINT permissions_pkey;
ALTER TABLE ONLY public.payment_webhook_logs DROP CONSTRAINT payment_webhook_logs_pkey;
ALTER TABLE ONLY public.password_reset_tokens DROP CONSTRAINT password_reset_tokens_pkey;
ALTER TABLE ONLY public.outbox_events DROP CONSTRAINT outbox_events_pkey;
ALTER TABLE ONLY public.notifications DROP CONSTRAINT notifications_pkey;
ALTER TABLE ONLY public.notification_delivery_logs DROP CONSTRAINT notification_delivery_logs_pkey;
ALTER TABLE ONLY public.money_flow_history DROP CONSTRAINT money_flow_history_pkey;
ALTER TABLE ONLY public.market_regime_history DROP CONSTRAINT market_regime_history_pkey;
ALTER TABLE ONLY public.market_data_sync_logs DROP CONSTRAINT market_data_sync_logs_pkey;
ALTER TABLE ONLY public.market_breadth_history DROP CONSTRAINT market_breadth_history_pkey;
ALTER TABLE ONLY public.invoices DROP CONSTRAINT invoices_pkey;
ALTER TABLE ONLY public.industries DROP CONSTRAINT industries_pkey;
ALTER TABLE ONLY public.handbooks DROP CONSTRAINT handbooks_pkey;
ALTER TABLE ONLY public.foreign_flow_history DROP CONSTRAINT foreign_flow_history_pkey;
ALTER TABLE ONLY public.financial_indicators DROP CONSTRAINT financial_indicators_pkey;
ALTER TABLE ONLY public.featured_contents DROP CONSTRAINT featured_contents_pkey;
ALTER TABLE ONLY public.email_verification_tokens DROP CONSTRAINT email_verification_tokens_pkey;
ALTER TABLE ONLY public.departments DROP CONSTRAINT departments_pkey;
ALTER TABLE ONLY public.copy_trade_orders DROP CONSTRAINT copy_trade_orders_pkey;
ALTER TABLE ONLY public.copy_trade_masters DROP CONSTRAINT copy_trade_masters_pkey;
ALTER TABLE ONLY public.copy_trade_copiers DROP CONSTRAINT copy_trade_copiers_pkey;
ALTER TABLE ONLY public.content_revisions DROP CONSTRAINT content_revisions_pkey;
ALTER TABLE ONLY public.categories DROP CONSTRAINT categories_pkey;
ALTER TABLE ONLY public.blogs DROP CONSTRAINT blogs_pkey;
ALTER TABLE ONLY public.blog_tags DROP CONSTRAINT blog_tags_pkey;
ALTER TABLE ONLY public.audit_logs DROP CONSTRAINT audit_logs_pkey;
ALTER TABLE ONLY public._prisma_migrations DROP CONSTRAINT _prisma_migrations_pkey;
ALTER TABLE public.watchlists ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.watchlist_items ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.vip_signals ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.user_subscriptions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.user_sessions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.transactions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.teams ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.tags ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.subscription_plans ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.stocks ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.stock_prices_daily ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.stock_exchanges ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.signal_targets ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.signal_execution_logs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.sectors ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.sector_rotation_history ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.roles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.research_reports ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.report_files ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.recommended_portfolios ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.price_alerts ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.portfolio_nav_snapshots ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.portfolio_holdings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.permissions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.payment_webhook_logs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.password_reset_tokens ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.outbox_events ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.notifications ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.notification_delivery_logs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.money_flow_history ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.market_regime_history ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.market_data_sync_logs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.market_breadth_history ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.invoices ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.industries ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.handbooks ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.foreign_flow_history ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.financial_indicators ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.featured_contents ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.email_verification_tokens ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.departments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.copy_trade_orders ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.copy_trade_masters ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.copy_trade_copiers ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.content_revisions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.categories ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.blogs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.audit_logs ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE public.watchlists_id_seq;
DROP TABLE public.watchlists;
DROP SEQUENCE public.watchlist_items_id_seq;
DROP TABLE public.watchlist_items;
DROP SEQUENCE public.vip_signals_id_seq;
DROP TABLE public.vip_signals;
DROP SEQUENCE public.users_id_seq;
DROP TABLE public.users;
DROP SEQUENCE public.user_subscriptions_id_seq;
DROP TABLE public.user_subscriptions;
DROP SEQUENCE public.user_sessions_id_seq;
DROP TABLE public.user_sessions;
DROP TABLE public.user_roles;
DROP SEQUENCE public.transactions_id_seq;
DROP TABLE public.transactions;
DROP SEQUENCE public.teams_id_seq;
DROP TABLE public.teams;
DROP SEQUENCE public.tags_id_seq;
DROP TABLE public.tags;
DROP SEQUENCE public.subscription_plans_id_seq;
DROP TABLE public.subscription_plans;
DROP SEQUENCE public.stocks_id_seq;
DROP TABLE public.stocks;
DROP SEQUENCE public.stock_prices_daily_id_seq;
DROP TABLE public.stock_prices_daily;
DROP SEQUENCE public.stock_exchanges_id_seq;
DROP TABLE public.stock_exchanges;
DROP SEQUENCE public.signal_targets_id_seq;
DROP TABLE public.signal_targets;
DROP SEQUENCE public.signal_execution_logs_id_seq;
DROP TABLE public.signal_execution_logs;
DROP SEQUENCE public.sectors_id_seq;
DROP TABLE public.sectors;
DROP SEQUENCE public.sector_rotation_history_id_seq;
DROP TABLE public.sector_rotation_history;
DROP SEQUENCE public.roles_id_seq;
DROP TABLE public.roles;
DROP TABLE public.role_permissions;
DROP SEQUENCE public.research_reports_id_seq;
DROP TABLE public.research_reports;
DROP SEQUENCE public.report_files_id_seq;
DROP TABLE public.report_files;
DROP SEQUENCE public.recommended_portfolios_id_seq;
DROP TABLE public.recommended_portfolios;
DROP SEQUENCE public.price_alerts_id_seq;
DROP TABLE public.price_alerts;
DROP SEQUENCE public.portfolio_nav_snapshots_id_seq;
DROP TABLE public.portfolio_nav_snapshots;
DROP SEQUENCE public.portfolio_holdings_id_seq;
DROP TABLE public.portfolio_holdings;
DROP SEQUENCE public.permissions_id_seq;
DROP TABLE public.permissions;
DROP SEQUENCE public.payment_webhook_logs_id_seq;
DROP TABLE public.payment_webhook_logs;
DROP SEQUENCE public.password_reset_tokens_id_seq;
DROP TABLE public.password_reset_tokens;
DROP SEQUENCE public.outbox_events_id_seq;
DROP TABLE public.outbox_events;
DROP SEQUENCE public.notifications_id_seq;
DROP TABLE public.notifications;
DROP SEQUENCE public.notification_delivery_logs_id_seq;
DROP TABLE public.notification_delivery_logs;
DROP SEQUENCE public.money_flow_history_id_seq;
DROP TABLE public.money_flow_history;
DROP SEQUENCE public.market_regime_history_id_seq;
DROP TABLE public.market_regime_history;
DROP SEQUENCE public.market_data_sync_logs_id_seq;
DROP TABLE public.market_data_sync_logs;
DROP SEQUENCE public.market_breadth_history_id_seq;
DROP TABLE public.market_breadth_history;
DROP SEQUENCE public.invoices_id_seq;
DROP TABLE public.invoices;
DROP SEQUENCE public.industries_id_seq;
DROP TABLE public.industries;
DROP SEQUENCE public.handbooks_id_seq;
DROP TABLE public.handbooks;
DROP SEQUENCE public.foreign_flow_history_id_seq;
DROP TABLE public.foreign_flow_history;
DROP SEQUENCE public.financial_indicators_id_seq;
DROP TABLE public.financial_indicators;
DROP SEQUENCE public.featured_contents_id_seq;
DROP TABLE public.featured_contents;
DROP SEQUENCE public.email_verification_tokens_id_seq;
DROP TABLE public.email_verification_tokens;
DROP SEQUENCE public.departments_id_seq;
DROP TABLE public.departments;
DROP SEQUENCE public.copy_trade_orders_id_seq;
DROP TABLE public.copy_trade_orders;
DROP SEQUENCE public.copy_trade_masters_id_seq;
DROP TABLE public.copy_trade_masters;
DROP SEQUENCE public.copy_trade_copiers_id_seq;
DROP TABLE public.copy_trade_copiers;
DROP SEQUENCE public.content_revisions_id_seq;
DROP TABLE public.content_revisions;
DROP SEQUENCE public.categories_id_seq;
DROP TABLE public.categories;
DROP SEQUENCE public.blogs_id_seq;
DROP TABLE public.blogs;
DROP TABLE public.blog_tags;
DROP SEQUENCE public.audit_logs_id_seq;
DROP TABLE public.audit_logs;
DROP TABLE public._prisma_migrations;
DROP TYPE public."SUBSCRIPTION_TIER";
DROP TYPE public."SUBSCRIPTION_STATUS";
DROP TYPE public."STOCK_STATUS";
DROP TYPE public."SIGNAL_STATUS";
DROP TYPE public."SIGNAL_SOURCE";
DROP TYPE public."SIGNAL_DIRECTION";
DROP TYPE public."ROLE_CODE";
DROP TYPE public."RISK_TASTE";
DROP TYPE public."REVISION_ACTION";
DROP TYPE public."REPORT_TYPE";
DROP TYPE public."RECORD_STATUS";
DROP TYPE public."PORTFOLIO_STATUS";
DROP TYPE public."PERMISSION_MODULE";
DROP TYPE public."PERMISSION_ACTION";
DROP TYPE public."PAYMENT_STATUS";
DROP TYPE public."OUTBOX_STATUS";
DROP TYPE public."NOTIFICATION_STATUS";
DROP TYPE public."NOTIFICATION_PRIORITY";
DROP TYPE public."NOTIFICATION_CHANNEL";
DROP TYPE public."MARKET_SYNC_STATUS";
DROP TYPE public."INVOICE_STATUS";
DROP TYPE public."INDICATOR_PERIOD";
DROP TYPE public."EXCHANGE_CODE";
DROP TYPE public."CONTENT_VISIBILITY";
DROP TYPE public."BLOG_STATUS";
DROP TYPE public."BILLING_PROVIDER";
DROP TYPE public."AUDIT_SOURCE";
DROP TYPE public."ALERT_STATUS";
DROP TYPE public."ALERT_CONDITION";
-- *not* dropping schema, since initdb creates it
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: ALERT_CONDITION; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ALERT_CONDITION" AS ENUM (
    'PRICE_ABOVE',
    'PRICE_BELOW',
    'VOLUME_SPIKE',
    'PCT_CHANGE_UP',
    'PCT_CHANGE_DOWN'
);


--
-- Name: ALERT_STATUS; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ALERT_STATUS" AS ENUM (
    'ACTIVE',
    'TRIGGERED',
    'DISABLED'
);


--
-- Name: AUDIT_SOURCE; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AUDIT_SOURCE" AS ENUM (
    'USER',
    'SYSTEM',
    'CRON',
    'QUEUE',
    'WEBHOOK'
);


--
-- Name: BILLING_PROVIDER; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."BILLING_PROVIDER" AS ENUM (
    'VIETQR',
    'ZALOPAY',
    'MANUAL'
);


--
-- Name: BLOG_STATUS; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."BLOG_STATUS" AS ENUM (
    'DRAFT',
    'PENDING_REVIEW',
    'PUBLISHED',
    'UNPUBLISHED'
);


--
-- Name: CONTENT_VISIBILITY; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CONTENT_VISIBILITY" AS ENUM (
    'PUBLIC',
    'PREMIUM'
);


--
-- Name: EXCHANGE_CODE; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."EXCHANGE_CODE" AS ENUM (
    'HOSE',
    'HNX',
    'UPCOM'
);


--
-- Name: INDICATOR_PERIOD; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."INDICATOR_PERIOD" AS ENUM (
    'DAILY',
    'WEEKLY',
    'MONTHLY',
    'QUARTERLY',
    'YEARLY'
);


--
-- Name: INVOICE_STATUS; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."INVOICE_STATUS" AS ENUM (
    'DRAFT',
    'OPEN',
    'PAID',
    'VOID',
    'UNCOLLECTIBLE'
);


--
-- Name: MARKET_SYNC_STATUS; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MARKET_SYNC_STATUS" AS ENUM (
    'PENDING',
    'SUCCESS',
    'FAILED'
);


--
-- Name: NOTIFICATION_CHANNEL; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."NOTIFICATION_CHANNEL" AS ENUM (
    'SYSTEM',
    'EMAIL',
    'SMS',
    'PUSH'
);


--
-- Name: NOTIFICATION_PRIORITY; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."NOTIFICATION_PRIORITY" AS ENUM (
    'LOW',
    'NORMAL',
    'HIGH',
    'URGENT'
);


--
-- Name: NOTIFICATION_STATUS; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."NOTIFICATION_STATUS" AS ENUM (
    'UNREAD',
    'READ',
    'ARCHIVED'
);


--
-- Name: OUTBOX_STATUS; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OUTBOX_STATUS" AS ENUM (
    'PENDING',
    'PROCESSED',
    'FAILED'
);


--
-- Name: PAYMENT_STATUS; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PAYMENT_STATUS" AS ENUM (
    'PENDING',
    'SUCCESS',
    'FAILED',
    'REFUNDED'
);


--
-- Name: PERMISSION_ACTION; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PERMISSION_ACTION" AS ENUM (
    'CREATE',
    'READ',
    'UPDATE',
    'DELETE',
    'PUBLISH',
    'APPROVE',
    'EXPORT'
);


--
-- Name: PERMISSION_MODULE; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PERMISSION_MODULE" AS ENUM (
    'AUTH',
    'USER',
    'ROLE',
    'DEPARTMENT',
    'TEAM',
    'VIP_SIGNALS',
    'PORTFOLIO',
    'BLOG',
    'CATEGORY',
    'INVOICE',
    'SUBSCRIPTION',
    'WATCHLIST',
    'REPORT',
    'SYSTEM'
);


--
-- Name: PORTFOLIO_STATUS; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PORTFOLIO_STATUS" AS ENUM (
    'DRAFT',
    'ACTIVE',
    'INACTIVE',
    'CLOSED'
);


--
-- Name: RECORD_STATUS; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."RECORD_STATUS" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'LOCKED'
);


--
-- Name: REPORT_TYPE; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."REPORT_TYPE" AS ENUM (
    'MARKET_SUMMARY',
    'VIP_RECOMMENDATION',
    'MACRO_ANALYSIS'
);


--
-- Name: REVISION_ACTION; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."REVISION_ACTION" AS ENUM (
    'CREATED',
    'UPDATED',
    'STATUS_CHANGED'
);


--
-- Name: RISK_TASTE; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."RISK_TASTE" AS ENUM (
    'CONSERVATIVE',
    'MODERATE',
    'AGGRESSIVE'
);


--
-- Name: ROLE_CODE; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ROLE_CODE" AS ENUM (
    'SUPER_ADMIN',
    'CEO',
    'ASSISTANT_CEO',
    'EDITOR_ADMIN',
    'EDITOR_PRO',
    'EDITOR',
    'SALE_ADMIN',
    'SALE',
    'EXPERT',
    'CLIENT',
    'CLIENT_VIP'
);


--
-- Name: SIGNAL_DIRECTION; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SIGNAL_DIRECTION" AS ENUM (
    'BUY',
    'SELL'
);


--
-- Name: SIGNAL_SOURCE; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SIGNAL_SOURCE" AS ENUM (
    'SYSTEM',
    'EXPERT'
);


--
-- Name: SIGNAL_STATUS; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SIGNAL_STATUS" AS ENUM (
    'DRAFT',
    'PUBLISHED',
    'REACHED_TARGET',
    'CUT_LOSS',
    'CLOSED'
);


--
-- Name: STOCK_STATUS; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."STOCK_STATUS" AS ENUM (
    'ACTIVE',
    'SUSPENDED',
    'DELISTED'
);


--
-- Name: SUBSCRIPTION_STATUS; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SUBSCRIPTION_STATUS" AS ENUM (
    'ACTIVE',
    'PAST_DUE',
    'CANCELED',
    'EXPIRED'
);


--
-- Name: SUBSCRIPTION_TIER; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SUBSCRIPTION_TIER" AS ENUM (
    'STANDARD',
    'SILVER',
    'GOLD',
    'DIAMOND'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id bigint NOT NULL,
    "userId" integer,
    source public."AUDIT_SOURCE" NOT NULL,
    action character varying(100) NOT NULL,
    "tableName" character varying(50) NOT NULL,
    "recordId" character varying(50) NOT NULL,
    "oldValues" jsonb,
    "newValues" jsonb,
    "ipAddress" character varying(45),
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audit_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: blog_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_tags (
    "blogId" integer NOT NULL,
    "tagId" integer NOT NULL
);


--
-- Name: blogs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blogs (
    id integer NOT NULL,
    "authorId" integer NOT NULL,
    "categoryId" integer NOT NULL,
    slug character varying(255) NOT NULL,
    title character varying(255) NOT NULL,
    excerpt text,
    content text NOT NULL,
    status public."BLOG_STATUS" DEFAULT 'DRAFT'::public."BLOG_STATUS" NOT NULL,
    visibility public."CONTENT_VISIBILITY" DEFAULT 'PUBLIC'::public."CONTENT_VISIBILITY" NOT NULL,
    "minTierAccess" public."SUBSCRIPTION_TIER" DEFAULT 'STANDARD'::public."SUBSCRIPTION_TIER" NOT NULL,
    "publishedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    views integer DEFAULT 0 NOT NULL
);


--
-- Name: blogs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.blogs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: blogs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.blogs_id_seq OWNED BY public.blogs.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    slug character varying(100) NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: content_revisions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content_revisions (
    id bigint NOT NULL,
    "blogId" integer NOT NULL,
    "editorId" integer NOT NULL,
    action public."REVISION_ACTION" NOT NULL,
    "snapshotData" jsonb NOT NULL,
    reason text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: content_revisions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.content_revisions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: content_revisions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.content_revisions_id_seq OWNED BY public.content_revisions.id;


--
-- Name: copy_trade_copiers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.copy_trade_copiers (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    "masterId" integer NOT NULL,
    capital numeric(19,4) NOT NULL,
    multiplier numeric(5,2) NOT NULL,
    profit numeric(19,4) NOT NULL,
    status public."RECORD_STATUS" DEFAULT 'ACTIVE'::public."RECORD_STATUS" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: copy_trade_copiers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.copy_trade_copiers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: copy_trade_copiers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.copy_trade_copiers_id_seq OWNED BY public.copy_trade_copiers.id;


--
-- Name: copy_trade_masters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.copy_trade_masters (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    strategy character varying(255) NOT NULL,
    aum numeric(19,4) NOT NULL,
    followers integer DEFAULT 0 NOT NULL,
    profit numeric(9,2) NOT NULL,
    "winRate" numeric(5,2) NOT NULL,
    status public."RECORD_STATUS" DEFAULT 'ACTIVE'::public."RECORD_STATUS" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: copy_trade_masters_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.copy_trade_masters_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: copy_trade_masters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.copy_trade_masters_id_seq OWNED BY public.copy_trade_masters.id;


--
-- Name: copy_trade_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.copy_trade_orders (
    id integer NOT NULL,
    "time" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "masterId" integer NOT NULL,
    symbol character varying(10) NOT NULL,
    action character varying(10) NOT NULL,
    price numeric(19,4) NOT NULL,
    quantity bigint NOT NULL,
    accounts integer NOT NULL,
    status character varying(20) DEFAULT 'SUCCESS'::character varying NOT NULL,
    "successRate" numeric(5,2) DEFAULT 100.00 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: copy_trade_orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.copy_trade_orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: copy_trade_orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.copy_trade_orders_id_seq OWNED BY public.copy_trade_orders.id;


--
-- Name: departments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.departments (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(50) NOT NULL,
    description text,
    status public."RECORD_STATUS" DEFAULT 'ACTIVE'::public."RECORD_STATUS" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


--
-- Name: departments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.departments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;


--
-- Name: email_verification_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_verification_tokens (
    id bigint NOT NULL,
    "userId" integer NOT NULL,
    code character varying(6) NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "usedAt" timestamp(3) without time zone,
    attempts integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: email_verification_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.email_verification_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: email_verification_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.email_verification_tokens_id_seq OWNED BY public.email_verification_tokens.id;


--
-- Name: featured_contents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.featured_contents (
    id integer NOT NULL,
    "blogId" integer NOT NULL,
    "position" integer DEFAULT 1 NOT NULL,
    "featuredAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: featured_contents_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.featured_contents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: featured_contents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.featured_contents_id_seq OWNED BY public.featured_contents.id;


--
-- Name: financial_indicators; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.financial_indicators (
    id bigint NOT NULL,
    "stockId" integer NOT NULL,
    period public."INDICATOR_PERIOD" NOT NULL,
    date date NOT NULL,
    "peRatio" numeric(19,4),
    "pbRatio" numeric(19,4),
    eps numeric(19,4),
    "marketCap" numeric(24,4),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: financial_indicators_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.financial_indicators_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: financial_indicators_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.financial_indicators_id_seq OWNED BY public.financial_indicators.id;


--
-- Name: foreign_flow_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.foreign_flow_history (
    id bigint NOT NULL,
    trade_date date NOT NULL,
    ticker character varying(10) NOT NULL,
    sector_code character varying(50),
    sector_name character varying(100),
    foreign_buy_value numeric(19,4),
    foreign_sell_value numeric(19,4),
    foreign_net_value numeric(19,4),
    foreign_buy_volume bigint,
    foreign_sell_volume bigint,
    foreign_net_volume bigint,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: foreign_flow_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.foreign_flow_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: foreign_flow_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.foreign_flow_history_id_seq OWNED BY public.foreign_flow_history.id;


--
-- Name: handbooks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.handbooks (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    "driveLink" character varying(1024),
    category character varying(50) NOT NULL,
    status public."RECORD_STATUS" DEFAULT 'ACTIVE'::public."RECORD_STATUS" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    description text,
    "linkType" character varying(50) DEFAULT 'link'::character varying NOT NULL,
    "order" integer DEFAULT 0 NOT NULL
);


--
-- Name: handbooks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.handbooks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: handbooks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.handbooks_id_seq OWNED BY public.handbooks.id;


--
-- Name: industries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.industries (
    id integer NOT NULL,
    "sectorId" integer NOT NULL,
    name character varying(100) NOT NULL,
    code character varying(50) NOT NULL,
    description text,
    status public."RECORD_STATUS" DEFAULT 'ACTIVE'::public."RECORD_STATUS" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


--
-- Name: industries_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.industries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: industries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.industries_id_seq OWNED BY public.industries.id;


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoices (
    id bigint NOT NULL,
    "userId" integer NOT NULL,
    "subscriptionId" bigint,
    amount numeric(19,4) NOT NULL,
    currency character varying(10) DEFAULT 'VND'::character varying NOT NULL,
    status public."INVOICE_STATUS" DEFAULT 'DRAFT'::public."INVOICE_STATUS" NOT NULL,
    "dueDate" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


--
-- Name: invoices_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.invoices_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: invoices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.invoices_id_seq OWNED BY public.invoices.id;


--
-- Name: market_breadth_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.market_breadth_history (
    id integer NOT NULL,
    trade_date date NOT NULL,
    exchange character varying(20) NOT NULL,
    advancing_count integer NOT NULL,
    declining_count integer NOT NULL,
    unchanged_count integer NOT NULL,
    total_count integer NOT NULL,
    advance_decline_ratio numeric(9,4),
    new_high_count integer,
    new_low_count integer,
    above_ma20_count integer,
    above_ma50_count integer,
    above_ma200_count integer,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: market_breadth_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.market_breadth_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: market_breadth_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.market_breadth_history_id_seq OWNED BY public.market_breadth_history.id;


--
-- Name: market_data_sync_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.market_data_sync_logs (
    id bigint NOT NULL,
    source character varying(100) NOT NULL,
    "syncType" character varying(50) NOT NULL,
    status public."MARKET_SYNC_STATUS" DEFAULT 'PENDING'::public."MARKET_SYNC_STATUS" NOT NULL,
    "recordsUpserted" integer DEFAULT 0 NOT NULL,
    "recordsFailed" integer DEFAULT 0 NOT NULL,
    "errorMessage" text,
    "startedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "completedAt" timestamp(3) without time zone
);


--
-- Name: market_data_sync_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.market_data_sync_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: market_data_sync_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.market_data_sync_logs_id_seq OWNED BY public.market_data_sync_logs.id;


--
-- Name: market_regime_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.market_regime_history (
    id integer NOT NULL,
    trade_date date NOT NULL,
    index_code character varying(20) NOT NULL,
    close numeric(19,4) NOT NULL,
    ema20 numeric(19,4),
    ema50 numeric(19,4),
    ema200 numeric(19,4),
    atr numeric(19,4),
    adx numeric(19,4),
    regime character varying(20) NOT NULL,
    risk_score integer,
    explanation text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: market_regime_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.market_regime_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: market_regime_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.market_regime_history_id_seq OWNED BY public.market_regime_history.id;


--
-- Name: money_flow_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.money_flow_history (
    id bigint NOT NULL,
    trade_date date NOT NULL,
    ticker character varying(10) NOT NULL,
    sector_code character varying(50),
    sector_name character varying(100),
    market_cap_group character varying(20),
    buy_value numeric(19,4),
    sell_value numeric(19,4),
    net_value numeric(19,4),
    total_value numeric(19,4),
    net_value_ratio numeric(9,4),
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: money_flow_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.money_flow_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: money_flow_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.money_flow_history_id_seq OWNED BY public.money_flow_history.id;


--
-- Name: notification_delivery_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_delivery_logs (
    id bigint NOT NULL,
    "notificationId" bigint NOT NULL,
    channel public."NOTIFICATION_CHANNEL" NOT NULL,
    "isSuccess" boolean DEFAULT false NOT NULL,
    "errorMessage" text,
    "sentAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: notification_delivery_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notification_delivery_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notification_delivery_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notification_delivery_logs_id_seq OWNED BY public.notification_delivery_logs.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id bigint NOT NULL,
    "userId" integer NOT NULL,
    title character varying(255) NOT NULL,
    content text NOT NULL,
    priority public."NOTIFICATION_PRIORITY" DEFAULT 'NORMAL'::public."NOTIFICATION_PRIORITY" NOT NULL,
    status public."NOTIFICATION_STATUS" DEFAULT 'UNREAD'::public."NOTIFICATION_STATUS" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: outbox_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.outbox_events (
    id bigint NOT NULL,
    "eventType" character varying(100) NOT NULL,
    payload jsonb NOT NULL,
    status public."OUTBOX_STATUS" DEFAULT 'PENDING'::public."OUTBOX_STATUS" NOT NULL,
    "errorReason" text,
    "retryCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: outbox_events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.outbox_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: outbox_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.outbox_events_id_seq OWNED BY public.outbox_events.id;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_reset_tokens (
    id bigint NOT NULL,
    "userId" integer NOT NULL,
    token character varying(255) NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "usedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.password_reset_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.password_reset_tokens_id_seq OWNED BY public.password_reset_tokens.id;


--
-- Name: payment_webhook_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_webhook_logs (
    id bigint NOT NULL,
    provider public."BILLING_PROVIDER" NOT NULL,
    payload jsonb NOT NULL,
    status public."OUTBOX_STATUS" DEFAULT 'PENDING'::public."OUTBOX_STATUS" NOT NULL,
    "errorReason" text,
    "idempotencyKey" character varying(255),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: payment_webhook_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payment_webhook_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payment_webhook_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payment_webhook_logs_id_seq OWNED BY public.payment_webhook_logs.id;


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permissions (
    id integer NOT NULL,
    module public."PERMISSION_MODULE" NOT NULL,
    action public."PERMISSION_ACTION" NOT NULL,
    code character varying(100) NOT NULL,
    description text,
    status public."RECORD_STATUS" DEFAULT 'ACTIVE'::public."RECORD_STATUS" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;


--
-- Name: portfolio_holdings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.portfolio_holdings (
    id integer NOT NULL,
    "portfolioId" integer NOT NULL,
    "stockId" integer NOT NULL,
    quantity bigint NOT NULL,
    "avgEntryPrice" numeric(19,4) NOT NULL,
    "currentPrice" numeric(19,4) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: portfolio_holdings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.portfolio_holdings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: portfolio_holdings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.portfolio_holdings_id_seq OWNED BY public.portfolio_holdings.id;


--
-- Name: portfolio_nav_snapshots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.portfolio_nav_snapshots (
    id bigint NOT NULL,
    "portfolioId" integer NOT NULL,
    date date NOT NULL,
    nav numeric(19,4) NOT NULL,
    "cashBalance" numeric(19,4) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: portfolio_nav_snapshots_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.portfolio_nav_snapshots_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: portfolio_nav_snapshots_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.portfolio_nav_snapshots_id_seq OWNED BY public.portfolio_nav_snapshots.id;


--
-- Name: price_alerts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.price_alerts (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "stockId" integer NOT NULL,
    condition public."ALERT_CONDITION" NOT NULL,
    "targetValue" numeric(19,4) NOT NULL,
    notes text,
    status public."ALERT_STATUS" DEFAULT 'ACTIVE'::public."ALERT_STATUS" NOT NULL,
    "lastTriggeredAt" timestamp(3) without time zone,
    "cooldownMinutes" integer DEFAULT 60 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: price_alerts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.price_alerts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: price_alerts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.price_alerts_id_seq OWNED BY public.price_alerts.id;


--
-- Name: recommended_portfolios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recommended_portfolios (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    "managerId" integer,
    status public."PORTFOLIO_STATUS" DEFAULT 'DRAFT'::public."PORTFOLIO_STATUS" NOT NULL,
    "minTierAccess" public."SUBSCRIPTION_TIER" DEFAULT 'GOLD'::public."SUBSCRIPTION_TIER" NOT NULL,
    "initialCapital" numeric(19,4) NOT NULL,
    "currentNav" numeric(19,4) NOT NULL,
    "cashBalance" numeric(19,4) DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


--
-- Name: recommended_portfolios_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.recommended_portfolios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: recommended_portfolios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.recommended_portfolios_id_seq OWNED BY public.recommended_portfolios.id;


--
-- Name: report_files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.report_files (
    id integer NOT NULL,
    "uploaderId" integer NOT NULL,
    title character varying(255) NOT NULL,
    "reportType" public."REPORT_TYPE" NOT NULL,
    "fileUrl" character varying(1024) NOT NULL,
    "fileSize" integer NOT NULL,
    status public."BLOG_STATUS" DEFAULT 'DRAFT'::public."BLOG_STATUS" NOT NULL,
    "minTierAccess" public."SUBSCRIPTION_TIER" DEFAULT 'GOLD'::public."SUBSCRIPTION_TIER" NOT NULL,
    "publishedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


--
-- Name: report_files_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.report_files_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: report_files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.report_files_id_seq OWNED BY public.report_files.id;


--
-- Name: research_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.research_reports (
    id integer NOT NULL,
    report_type character varying(50) NOT NULL,
    subject character varying(100) NOT NULL,
    language character varying(10) NOT NULL,
    format character varying(20) NOT NULL,
    title character varying(255) NOT NULL,
    content text NOT NULL,
    generated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    metadata_json jsonb
);


--
-- Name: research_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.research_reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: research_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.research_reports_id_seq OWNED BY public.research_reports.id;


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.role_permissions (
    "roleId" integer NOT NULL,
    "permissionId" integer NOT NULL,
    "assignedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "assignedById" integer
);


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    code public."ROLE_CODE" NOT NULL,
    description text,
    "isSystem" boolean DEFAULT false NOT NULL,
    status public."RECORD_STATUS" DEFAULT 'ACTIVE'::public."RECORD_STATUS" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: sector_rotation_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sector_rotation_history (
    id integer NOT NULL,
    trade_date date NOT NULL,
    sector_code character varying(50) NOT NULL,
    sector_name character varying(100) NOT NULL,
    return_1d numeric(9,4),
    return_1w numeric(9,4),
    return_1m numeric(9,4),
    return_3m numeric(9,4),
    return_6m numeric(9,4),
    return_ytd numeric(9,4),
    relative_strength numeric(9,4),
    rank_1m integer,
    rank_3m integer,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: sector_rotation_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sector_rotation_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sector_rotation_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sector_rotation_history_id_seq OWNED BY public.sector_rotation_history.id;


--
-- Name: sectors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sectors (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    code character varying(50) NOT NULL,
    description text,
    status public."RECORD_STATUS" DEFAULT 'ACTIVE'::public."RECORD_STATUS" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


--
-- Name: sectors_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sectors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sectors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sectors_id_seq OWNED BY public.sectors.id;


--
-- Name: signal_execution_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.signal_execution_logs (
    id bigint NOT NULL,
    "signalId" integer NOT NULL,
    "fromStatus" public."SIGNAL_STATUS" NOT NULL,
    "toStatus" public."SIGNAL_STATUS" NOT NULL,
    "triggerPrice" numeric(19,4),
    reason text,
    "executedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: signal_execution_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.signal_execution_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: signal_execution_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.signal_execution_logs_id_seq OWNED BY public.signal_execution_logs.id;


--
-- Name: signal_targets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.signal_targets (
    id integer NOT NULL,
    "signalId" integer NOT NULL,
    price numeric(19,4) NOT NULL,
    "targetIndex" integer NOT NULL,
    "isHit" boolean DEFAULT false NOT NULL,
    "hitAt" timestamp(3) without time zone
);


--
-- Name: signal_targets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.signal_targets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: signal_targets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.signal_targets_id_seq OWNED BY public.signal_targets.id;


--
-- Name: stock_exchanges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_exchanges (
    id integer NOT NULL,
    code public."EXCHANGE_CODE" NOT NULL,
    name character varying(100) NOT NULL,
    status public."RECORD_STATUS" DEFAULT 'ACTIVE'::public."RECORD_STATUS" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: stock_exchanges_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.stock_exchanges_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: stock_exchanges_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.stock_exchanges_id_seq OWNED BY public.stock_exchanges.id;


--
-- Name: stock_prices_daily; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_prices_daily (
    id bigint NOT NULL,
    "stockId" integer NOT NULL,
    date date NOT NULL,
    open numeric(19,4) NOT NULL,
    high numeric(19,4) NOT NULL,
    low numeric(19,4) NOT NULL,
    close numeric(19,4) NOT NULL,
    volume bigint NOT NULL,
    "adjClose" numeric(19,4),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: stock_prices_daily_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.stock_prices_daily_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: stock_prices_daily_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.stock_prices_daily_id_seq OWNED BY public.stock_prices_daily.id;


--
-- Name: stocks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stocks (
    id integer NOT NULL,
    symbol character varying(10) NOT NULL,
    "companyName" character varying(255) NOT NULL,
    "exchangeId" integer NOT NULL,
    "industryId" integer,
    status public."STOCK_STATUS" DEFAULT 'ACTIVE'::public."STOCK_STATUS" NOT NULL,
    isin character varying(50),
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    act character varying(50),
    analyst character varying(100),
    identify_trend text,
    "order" integer DEFAULT 0 NOT NULL,
    resistance_range character varying(100),
    rsi_mfi character varying(50),
    support_range character varying(100),
    top_status integer DEFAULT 0 NOT NULL,
    trading_price_range character varying(100)
);


--
-- Name: stocks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.stocks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: stocks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.stocks_id_seq OWNED BY public.stocks.id;


--
-- Name: subscription_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscription_plans (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    "tierLevel" public."SUBSCRIPTION_TIER" NOT NULL,
    price numeric(19,4) NOT NULL,
    currency character varying(10) DEFAULT 'VND'::character varying NOT NULL,
    "durationDays" integer NOT NULL,
    status public."RECORD_STATUS" DEFAULT 'ACTIVE'::public."RECORD_STATUS" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    features text
);


--
-- Name: subscription_plans_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.subscription_plans_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: subscription_plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.subscription_plans_id_seq OWNED BY public.subscription_plans.id;


--
-- Name: tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tags (
    id integer NOT NULL,
    slug character varying(100) NOT NULL,
    name character varying(100) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: tags_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tags_id_seq OWNED BY public.tags.id;


--
-- Name: teams; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teams (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(50) NOT NULL,
    "departmentId" integer NOT NULL,
    "leaderId" integer,
    description text,
    status public."RECORD_STATUS" DEFAULT 'ACTIVE'::public."RECORD_STATUS" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


--
-- Name: teams_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.teams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: teams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.teams_id_seq OWNED BY public.teams.id;


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transactions (
    id bigint NOT NULL,
    "invoiceId" bigint NOT NULL,
    provider public."BILLING_PROVIDER" NOT NULL,
    "providerId" character varying(255),
    amount numeric(19,4) NOT NULL,
    currency character varying(10) DEFAULT 'VND'::character varying NOT NULL,
    status public."PAYMENT_STATUS" DEFAULT 'PENDING'::public."PAYMENT_STATUS" NOT NULL,
    "errorMessage" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.transactions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.transactions_id_seq OWNED BY public.transactions.id;


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    "userId" integer NOT NULL,
    "roleId" integer NOT NULL,
    "assignedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "assignedById" integer
);


--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_sessions (
    id bigint NOT NULL,
    "userId" integer NOT NULL,
    "refreshToken" text NOT NULL,
    "ipAddress" character varying(45),
    "userAgent" text,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "isRevoked" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: user_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_sessions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_sessions_id_seq OWNED BY public.user_sessions.id;


--
-- Name: user_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_subscriptions (
    id bigint NOT NULL,
    "userId" integer NOT NULL,
    "planId" integer NOT NULL,
    status public."SUBSCRIPTION_STATUS" DEFAULT 'ACTIVE'::public."SUBSCRIPTION_STATUS" NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "isPermanent" boolean DEFAULT false NOT NULL
);


--
-- Name: user_subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_subscriptions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_subscriptions_id_seq OWNED BY public.user_subscriptions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    "passwordHash" character varying(255) NOT NULL,
    "fullName" character varying(255) NOT NULL,
    phone character varying(20),
    dob date,
    address text,
    "avatarUrl" text,
    "brokerId" integer,
    "departmentId" integer,
    "teamId" integer,
    "riskTaste" public."RISK_TASTE",
    "tierLevel" public."SUBSCRIPTION_TIER" DEFAULT 'STANDARD'::public."SUBSCRIPTION_TIER" NOT NULL,
    status public."RECORD_STATUS" DEFAULT 'ACTIVE'::public."RECORD_STATUS" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "emailVerifiedAt" timestamp(3) without time zone,
    "investmentDuration" character varying(50),
    "investmentStyle" character varying(50),
    "stockAccount" character varying(100),
    "stockCompany" character varying(100),
    "legacyTier" character varying(50),
    company character varying(255),
    "joinDate" date,
    "position" character varying(255),
    "sortOrder" integer,
    "referralId" character varying(50),
    "referralName" character varying(255),
    "paymentProofUrl" text,
    "staffCode" character varying(50)
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: vip_signals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vip_signals (
    id integer NOT NULL,
    "stockId" integer NOT NULL,
    "authorId" integer,
    source public."SIGNAL_SOURCE" DEFAULT 'EXPERT'::public."SIGNAL_SOURCE" NOT NULL,
    direction public."SIGNAL_DIRECTION" NOT NULL,
    status public."SIGNAL_STATUS" DEFAULT 'DRAFT'::public."SIGNAL_STATUS" NOT NULL,
    "minTierAccess" public."SUBSCRIPTION_TIER" DEFAULT 'GOLD'::public."SUBSCRIPTION_TIER" NOT NULL,
    "entryPrice" numeric(19,4) NOT NULL,
    "cutLossPrice" numeric(19,4) NOT NULL,
    "targetPrice" numeric(19,4) NOT NULL,
    notes text,
    "publishedAt" timestamp(3) without time zone,
    "closedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


--
-- Name: vip_signals_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vip_signals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vip_signals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vip_signals_id_seq OWNED BY public.vip_signals.id;


--
-- Name: watchlist_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.watchlist_items (
    id integer NOT NULL,
    "watchlistId" integer NOT NULL,
    "stockId" integer NOT NULL,
    "addedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: watchlist_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.watchlist_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: watchlist_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.watchlist_items_id_seq OWNED BY public.watchlist_items.id;


--
-- Name: watchlists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.watchlists (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    name character varying(100) NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: watchlists_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.watchlists_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: watchlists_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.watchlists_id_seq OWNED BY public.watchlists.id;


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: blogs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blogs ALTER COLUMN id SET DEFAULT nextval('public.blogs_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: content_revisions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_revisions ALTER COLUMN id SET DEFAULT nextval('public.content_revisions_id_seq'::regclass);


--
-- Name: copy_trade_copiers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copy_trade_copiers ALTER COLUMN id SET DEFAULT nextval('public.copy_trade_copiers_id_seq'::regclass);


--
-- Name: copy_trade_masters id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copy_trade_masters ALTER COLUMN id SET DEFAULT nextval('public.copy_trade_masters_id_seq'::regclass);


--
-- Name: copy_trade_orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copy_trade_orders ALTER COLUMN id SET DEFAULT nextval('public.copy_trade_orders_id_seq'::regclass);


--
-- Name: departments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);


--
-- Name: email_verification_tokens id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_verification_tokens ALTER COLUMN id SET DEFAULT nextval('public.email_verification_tokens_id_seq'::regclass);


--
-- Name: featured_contents id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.featured_contents ALTER COLUMN id SET DEFAULT nextval('public.featured_contents_id_seq'::regclass);


--
-- Name: financial_indicators id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financial_indicators ALTER COLUMN id SET DEFAULT nextval('public.financial_indicators_id_seq'::regclass);


--
-- Name: foreign_flow_history id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.foreign_flow_history ALTER COLUMN id SET DEFAULT nextval('public.foreign_flow_history_id_seq'::regclass);


--
-- Name: handbooks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.handbooks ALTER COLUMN id SET DEFAULT nextval('public.handbooks_id_seq'::regclass);


--
-- Name: industries id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industries ALTER COLUMN id SET DEFAULT nextval('public.industries_id_seq'::regclass);


--
-- Name: invoices id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices ALTER COLUMN id SET DEFAULT nextval('public.invoices_id_seq'::regclass);


--
-- Name: market_breadth_history id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.market_breadth_history ALTER COLUMN id SET DEFAULT nextval('public.market_breadth_history_id_seq'::regclass);


--
-- Name: market_data_sync_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.market_data_sync_logs ALTER COLUMN id SET DEFAULT nextval('public.market_data_sync_logs_id_seq'::regclass);


--
-- Name: market_regime_history id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.market_regime_history ALTER COLUMN id SET DEFAULT nextval('public.market_regime_history_id_seq'::regclass);


--
-- Name: money_flow_history id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.money_flow_history ALTER COLUMN id SET DEFAULT nextval('public.money_flow_history_id_seq'::regclass);


--
-- Name: notification_delivery_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_delivery_logs ALTER COLUMN id SET DEFAULT nextval('public.notification_delivery_logs_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: outbox_events id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.outbox_events ALTER COLUMN id SET DEFAULT nextval('public.outbox_events_id_seq'::regclass);


--
-- Name: password_reset_tokens id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens ALTER COLUMN id SET DEFAULT nextval('public.password_reset_tokens_id_seq'::regclass);


--
-- Name: payment_webhook_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_webhook_logs ALTER COLUMN id SET DEFAULT nextval('public.payment_webhook_logs_id_seq'::regclass);


--
-- Name: permissions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);


--
-- Name: portfolio_holdings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolio_holdings ALTER COLUMN id SET DEFAULT nextval('public.portfolio_holdings_id_seq'::regclass);


--
-- Name: portfolio_nav_snapshots id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolio_nav_snapshots ALTER COLUMN id SET DEFAULT nextval('public.portfolio_nav_snapshots_id_seq'::regclass);


--
-- Name: price_alerts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.price_alerts ALTER COLUMN id SET DEFAULT nextval('public.price_alerts_id_seq'::regclass);


--
-- Name: recommended_portfolios id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recommended_portfolios ALTER COLUMN id SET DEFAULT nextval('public.recommended_portfolios_id_seq'::regclass);


--
-- Name: report_files id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_files ALTER COLUMN id SET DEFAULT nextval('public.report_files_id_seq'::regclass);


--
-- Name: research_reports id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.research_reports ALTER COLUMN id SET DEFAULT nextval('public.research_reports_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: sector_rotation_history id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sector_rotation_history ALTER COLUMN id SET DEFAULT nextval('public.sector_rotation_history_id_seq'::regclass);


--
-- Name: sectors id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sectors ALTER COLUMN id SET DEFAULT nextval('public.sectors_id_seq'::regclass);


--
-- Name: signal_execution_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signal_execution_logs ALTER COLUMN id SET DEFAULT nextval('public.signal_execution_logs_id_seq'::regclass);


--
-- Name: signal_targets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signal_targets ALTER COLUMN id SET DEFAULT nextval('public.signal_targets_id_seq'::regclass);


--
-- Name: stock_exchanges id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_exchanges ALTER COLUMN id SET DEFAULT nextval('public.stock_exchanges_id_seq'::regclass);


--
-- Name: stock_prices_daily id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_prices_daily ALTER COLUMN id SET DEFAULT nextval('public.stock_prices_daily_id_seq'::regclass);


--
-- Name: stocks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stocks ALTER COLUMN id SET DEFAULT nextval('public.stocks_id_seq'::regclass);


--
-- Name: subscription_plans id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscription_plans ALTER COLUMN id SET DEFAULT nextval('public.subscription_plans_id_seq'::regclass);


--
-- Name: tags id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags ALTER COLUMN id SET DEFAULT nextval('public.tags_id_seq'::regclass);


--
-- Name: teams id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teams ALTER COLUMN id SET DEFAULT nextval('public.teams_id_seq'::regclass);


--
-- Name: transactions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);


--
-- Name: user_sessions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions ALTER COLUMN id SET DEFAULT nextval('public.user_sessions_id_seq'::regclass);


--
-- Name: user_subscriptions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_subscriptions ALTER COLUMN id SET DEFAULT nextval('public.user_subscriptions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: vip_signals id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vip_signals ALTER COLUMN id SET DEFAULT nextval('public.vip_signals_id_seq'::regclass);


--
-- Name: watchlist_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.watchlist_items ALTER COLUMN id SET DEFAULT nextval('public.watchlist_items_id_seq'::regclass);


--
-- Name: watchlists id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.watchlists ALTER COLUMN id SET DEFAULT nextval('public.watchlists_id_seq'::regclass);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
5f0d5d49-5d0d-417e-8781-b1b3aa8ba560	22304d849d29f385de70551204cf156a014d540fbfc78348a0dc58437df4b982	2026-06-16 14:24:51.009655+07	20260517114027_init	\N	\N	2026-06-16 14:24:50.9883+07	1
7a5693cd-55e8-43b6-9296-87c348a981ea	e914099df4a3fe23803b20df04cdfddaa52a424ac928cf0ca59d71f865a94770	2026-06-16 14:24:51.150046+07	20260518070338_init_wave1_foundation	\N	\N	2026-06-16 14:24:51.010497+07	1
566ca035-c8ff-4bec-b2c6-efbff170db6a	fd2e047cbf008a2020d1368bbf0d8f215a84c94d89aa4670ec94283a1870ac80	2026-06-16 14:24:51.208189+07	20260518075234_init_wave2b_billing	\N	\N	2026-06-16 14:24:51.150572+07	1
29f8aedc-3be2-43ff-885c-f695f4810bdc	f4cf8a1763f8720d01bc43e1d2af1d1fc91d0a8dd587cba2ec19bcbbb8411463	2026-06-16 14:24:51.278028+07	20260518080807_init_wave3a_market	\N	\N	2026-06-16 14:24:51.208875+07	1
4663705f-2fc3-43e5-afed-a6c986323fa7	1cd62df03af3841dc788dcb6b16f7b1188c29b0e6932d65bee542dae271662d6	2026-06-16 14:24:51.33465+07	20260518081701_init_wave3b_signals	\N	\N	2026-06-16 14:24:51.278476+07	1
5abc97c2-f072-44c5-9f96-8fe4b6243f01	0b6ff50c77eb779496255e107690572ce947c02798151d162821ee389d992c31	2026-06-16 14:24:51.377694+07	20260518082907_init_wave3c_alerts	\N	\N	2026-06-16 14:24:51.335083+07	1
67bf6898-6cb6-4612-b75e-5c352409a20e	d70dc37ec4d68959c63212cfc0ed14d9e0190bb767710003e6be56dddaac1ac9	2026-06-16 14:24:51.432897+07	20260518083629_init_wave4_cms	\N	\N	2026-06-16 14:24:51.378157+07	1
d6511054-45d9-4a13-9ee8-9fc1f4be0c6c	6a8388a1702f2f0a3676873cbc93a6cb8601fad8802e316d2cc45b9478bc441e	2026-06-16 14:24:59.274673+07	20260616072459_add_auth_verification	\N	\N	2026-06-16 14:24:59.103522+07	1
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, "userId", source, action, "tableName", "recordId", "oldValues", "newValues", "ipAddress", "userAgent", "createdAt") FROM stdin;
1	1	SYSTEM	SYSTEM_SEED	users	1	\N	{"note": "Foundation seeder executed", "email": "admin@fintop.vn"}	127.0.0.1	CLI Seeder	2026-06-16 07:25:15.897
2	1	SYSTEM	MOCK_DATA_SEED	system	0	\N	{"note": "Comprehensive mock data seed executed", "blogs": 15, "stocks": 20, "signals": 6}	127.0.0.1	CLI Mock Data Seeder	2026-06-16 07:25:32.269
3	1	SYSTEM	QA_SEED_WAVE2	system	0	\N	{"note": "Wave 2 QA seed executed", "reportsCreated": [1, 2], "signalsCreated": [7, 8, 9, 10], "notificationsCreated": ["1", "2"]}	127.0.0.1	CLI QA Seeder	2026-06-16 07:25:57.634
4	1	SYSTEM	SYSTEM_SEED	users	1	\N	{"note": "Foundation seeder executed", "email": "admin@fintop.vn"}	127.0.0.1	CLI Seeder	2026-06-16 08:03:21.546
5	\N	USER	LOGIN_FAILED	users	N/A	{"email": "testuser@fintop.vn"}	null	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36	2026-06-16 08:06:56.717
6	\N	USER	LOGIN_FAILED	users	N/A	{"email": "testuser@fintop.vn"}	null	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36	2026-06-16 08:06:59.053
7	\N	USER	LOGIN_FAILED	users	N/A	{"email": "testuser@fintop.vn"}	null	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36	2026-06-16 08:07:19.971
8	\N	USER	LOGIN_FAILED	users	N/A	{"email": "testuser@fintop.vn"}	null	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36	2026-06-16 08:08:22.336
9	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-16 08:21:18.411
10	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36	2026-06-16 08:21:49.761
11	\N	USER	LOGIN_FAILED	users	N/A	{"email": "testuser@fintop.vn"}	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36	2026-06-16 08:21:52.11
12	\N	USER	LOGIN_FAILED	users	N/A	{"email": "testuser@fintop.vn"}	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36	2026-06-16 08:21:54.487
13	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36	2026-06-16 08:21:55.944
14	\N	USER	LOGIN_FAILED	users	N/A	{"email": "testuser@fintop.vn"}	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36	2026-06-16 08:22:05.175
15	\N	USER	LOGIN_FAILED	users	N/A	{"email": "testuser@fintop.vn"}	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36	2026-06-16 08:23:07.521
16	\N	USER	LOGIN_FAILED	users	N/A	{"email": "testuser@fintop.vn"}	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36	2026-06-16 08:24:13.36
17	\N	USER	LOGIN_FAILED	users	N/A	{"email": "testuser@fintop.vn"}	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36	2026-06-16 08:24:14.997
18	\N	USER	LOGIN_FAILED	users	N/A	{"email": "wrong@example.com"}	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36	2026-06-16 08:24:16.39
19	5	USER	USER_REGISTER	users	5	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-23 02:44:34.895
20	6	USER	USER_REGISTER	users	6	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-23 02:47:38.971
469	6	USER	LOGIN_SUCCESS	users	6	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-30 04:06:45.282
22	\N	CRON	SCHEDULED_CLEANUP	user_sessions	SYSTEM_BATCH_01	\N	{"status": "CLEANED_EXPIRED_SESSIONS"}	127.0.0.1	System Cron Service	2026-06-23 03:00:43.628
470	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-30 04:07:16.179
24	10	SYSTEM	ARTICLE_CREATED	blogs	16	null	null	\N	\N	2026-06-23 03:01:06.007
25	10	SYSTEM	ARTICLE_PENDING_REVIEW	blogs	16	null	null	\N	\N	2026-06-23 03:01:06.079
26	10	SYSTEM	ARTICLE_PUBLISHED	blogs	16	null	null	\N	\N	2026-06-23 03:01:06.088
30	12	SYSTEM	WATCHLIST_CREATED	watchlists	1	null	null	\N	\N	2026-06-23 03:01:25.536
31	12	SYSTEM	WATCHLIST_ITEM_ADDED	watchlist_items	1	null	null	\N	\N	2026-06-23 03:01:25.574
32	12	SYSTEM	ALERT_CREATED	price_alerts	1	null	null	\N	\N	2026-06-23 03:01:25.598
33	12	SYSTEM	ALERT_TRIGGERED	price_alerts	1	null	null	\N	\N	2026-06-23 03:01:25.617
43	\N	SYSTEM	REALTIME_SIGNAL_BROADCAST	vip_signals	UNKNOWN	null	null	\N	\N	2026-06-23 03:01:32.831
44	14	SYSTEM	SIGNAL_PUBLISHED	vip_signals	11	null	null	\N	\N	2026-06-23 03:01:38.239
45	\N	SYSTEM	REALTIME_SIGNAL_BROADCAST	vip_signals	11	null	null	\N	\N	2026-06-23 03:01:38.31
46	\N	SYSTEM	SIGNAL_REACHED_TARGET	vip_signals	11	null	null	\N	\N	2026-06-23 03:01:38.325
47	14	SYSTEM	PORTFOLIO_CREATED	recommended_portfolios	2	null	null	\N	\N	2026-06-23 03:01:38.34
48	\N	SYSTEM	HOLDING_ADDED	portfolio_holdings	6	null	null	\N	\N	2026-06-23 03:01:38.36
52	16	USER	USER_REGISTER	users	16	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-23 03:03:20.135
53	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-23 03:50:12.445
54	1	USER	USER_STATUS_INACTIVE	users	16	{"status": "ACTIVE"}	{"status": "INACTIVE"}	\N	\N	2026-06-23 03:52:24.433
55	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-23 03:53:59.59
56	1	USER	USER_STATUS_ACTIVE	users	16	{"status": "INACTIVE"}	{"status": "ACTIVE"}	\N	\N	2026-06-23 04:00:32.946
57	1	USER	USER_STATUS_INACTIVE	users	16	{"status": "ACTIVE"}	{"status": "INACTIVE"}	\N	\N	2026-06-23 04:00:33.404
58	1	USER	LOGOUT	user_sessions	6	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-23 04:02:42.896
59	1	USER	LOGOUT	user_sessions	6	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-23 04:02:43.073
60	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-23 04:02:46.841
61	1	USER	USER_STATUS_ACTIVE	users	16	{"status": "INACTIVE"}	{"status": "ACTIVE"}	\N	\N	2026-06-23 04:02:52.607
62	1	USER	LOGOUT	user_sessions	7	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-23 04:07:35.118
63	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-23 04:08:52.018
64	1	USER	USER_DELETED	users	16	{"email": "anhtuan2k5zxc@gmail.com"}	null	\N	\N	2026-06-23 04:08:57.007
65	4	SYSTEM	SUBSCRIPTION_ACTIVATED	user_subscriptions	2	\N	{"planId": 104, "endDate": "2027-06-23T04:11:54.867Z", "tierLevel": "DIAMOND"}	\N	\N	2026-06-23 04:11:54.875
66	1	SYSTEM	ARTICLE_UPDATED	blogs	16	null	null	\N	\N	2026-06-23 04:17:57.941
67	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	8	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-23 04:22:52.337
68	1	SYSTEM	MOCK_DATA_SEED	system	0	\N	{"note": "Comprehensive mock data seed executed", "blogs": 15, "stocks": 20, "signals": 6}	127.0.0.1	CLI Mock Data Seeder	2026-06-23 04:24:44.847
69	\N	CRON	SCHEDULED_CLEANUP	user_sessions	SYSTEM_BATCH_01	\N	{"status": "CLEANED_EXPIRED_SESSIONS"}	127.0.0.1	System Cron Service	2026-06-23 04:26:43.005
471	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-30 04:11:30.953
475	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	79	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-30 04:53:59.762
486	1	USER	USER_STATUS_INACTIVE	users	155	{"status": "ACTIVE"}	{"status": "INACTIVE"}	\N	\N	2026-06-30 07:02:36.275
82	10	SYSTEM	ARTICLE_CREATED	blogs	32	null	null	\N	\N	2026-06-23 04:27:07.79
83	10	SYSTEM	ARTICLE_PENDING_REVIEW	blogs	32	null	null	\N	\N	2026-06-23 04:27:07.855
84	10	SYSTEM	ARTICLE_PUBLISHED	blogs	32	null	null	\N	\N	2026-06-23 04:27:07.863
85	12	SYSTEM	WATCHLIST_CREATED	watchlists	2	null	null	\N	\N	2026-06-23 04:27:18.429
86	12	SYSTEM	WATCHLIST_ITEM_ADDED	watchlist_items	2	null	null	\N	\N	2026-06-23 04:27:18.443
87	12	SYSTEM	ALERT_CREATED	price_alerts	2	null	null	\N	\N	2026-06-23 04:27:18.455
88	12	SYSTEM	ALERT_TRIGGERED	price_alerts	2	null	null	\N	\N	2026-06-23 04:27:18.47
89	\N	SYSTEM	REALTIME_SIGNAL_BROADCAST	vip_signals	UNKNOWN	null	null	\N	\N	2026-06-23 04:27:23.713
90	14	SYSTEM	SIGNAL_PUBLISHED	vip_signals	18	null	null	\N	\N	2026-06-23 04:27:27.036
91	\N	SYSTEM	REALTIME_SIGNAL_BROADCAST	vip_signals	18	null	null	\N	\N	2026-06-23 04:27:27.099
92	\N	SYSTEM	SIGNAL_REACHED_TARGET	vip_signals	18	null	null	\N	\N	2026-06-23 04:27:27.113
93	14	SYSTEM	PORTFOLIO_CREATED	recommended_portfolios	4	null	null	\N	\N	2026-06-23 04:27:27.125
94	\N	SYSTEM	HOLDING_ADDED	portfolio_holdings	12	null	null	\N	\N	2026-06-23 04:27:27.14
98	1	SYSTEM	MOCK_DATA_SEED	system	0	\N	{"note": "Comprehensive mock data seed executed", "blogs": 15, "stocks": 20, "signals": 6}	127.0.0.1	CLI Mock Data Seeder	2026-06-23 04:31:33.509
99	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	8	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-23 04:36:53.671
100	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	8	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-23 05:18:38.763
101	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	8	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-23 06:01:16.25
102	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	8	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-23 06:15:17.761
103	1	SYSTEM	ARTICLE_UPDATED	blogs	47	null	null	\N	\N	2026-06-23 06:19:43.982
104	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	8	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-23 06:29:18.932
105	\N	CRON	SCHEDULED_CLEANUP	user_sessions	SYSTEM_BATCH_01	\N	{"status": "CLEANED_EXPIRED_SESSIONS"}	127.0.0.1	System Cron Service	2026-06-23 06:30:03.931
118	10	SYSTEM	ARTICLE_CREATED	blogs	48	null	null	\N	\N	2026-06-23 06:30:32.648
119	10	SYSTEM	ARTICLE_PENDING_REVIEW	blogs	48	null	null	\N	\N	2026-06-23 06:30:32.739
120	10	SYSTEM	ARTICLE_PUBLISHED	blogs	48	null	null	\N	\N	2026-06-23 06:30:32.751
121	12	SYSTEM	WATCHLIST_CREATED	watchlists	3	null	null	\N	\N	2026-06-23 06:30:46.006
122	12	SYSTEM	WATCHLIST_ITEM_ADDED	watchlist_items	3	null	null	\N	\N	2026-06-23 06:30:46.025
123	12	SYSTEM	ALERT_CREATED	price_alerts	3	null	null	\N	\N	2026-06-23 06:30:46.038
124	12	SYSTEM	ALERT_TRIGGERED	price_alerts	3	null	null	\N	\N	2026-06-23 06:30:46.052
125	\N	SYSTEM	REALTIME_SIGNAL_BROADCAST	vip_signals	UNKNOWN	null	null	\N	\N	2026-06-23 06:30:52.656
126	14	SYSTEM	SIGNAL_PUBLISHED	vip_signals	25	null	null	\N	\N	2026-06-23 06:30:57.487
127	\N	SYSTEM	REALTIME_SIGNAL_BROADCAST	vip_signals	25	null	null	\N	\N	2026-06-23 06:30:57.566
128	\N	SYSTEM	SIGNAL_REACHED_TARGET	vip_signals	25	null	null	\N	\N	2026-06-23 06:30:57.599
129	14	SYSTEM	PORTFOLIO_CREATED	recommended_portfolios	6	null	null	\N	\N	2026-06-23 06:30:57.612
130	\N	SYSTEM	HOLDING_ADDED	portfolio_holdings	18	null	null	\N	\N	2026-06-23 06:30:57.639
134	1	SYSTEM	MOCK_DATA_SEED	system	0	\N	{"note": "Comprehensive mock data seed executed", "blogs": 15, "stocks": 20, "signals": 6}	127.0.0.1	CLI Mock Data Seeder	2026-06-23 06:31:27.03
135	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	8	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-23 06:43:19.846
136	1	SYSTEM	INVOICE_CREATED	invoices	10	null	{"amount": "1500000", "planId": 102, "status": "DRAFT"}	\N	\N	2026-06-23 06:51:28.77
137	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	8	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-23 06:57:20.745
138	1	USER	LOGIN_SUCCESS	users	1	null	null	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-06-23 07:09:56.368
139	1	USER	LOGIN_SUCCESS	users	1	null	null	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-06-23 07:09:59.786
140	1	USER	LOGIN_SUCCESS	users	1	null	null	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-06-23 07:11:05.791
141	1	USER	PLAN_CREATED	subscription_plans	8	null	{"name": "TEST_PLAN", "price": 1250000, "currency": "VND", "features": "T�nh nang test 1;T�nh nang test 2", "tierLevel": "SILVER", "description": "This is a test plan created by test script", "durationDays": 45}	\N	\N	2026-06-23 07:11:10.884
142	1	USER	PLAN_UPDATED	subscription_plans	8	{"name": "TEST_PLAN", "price": 1250000, "status": "ACTIVE", "currency": "VND", "features": "T�nh nang test 1;T�nh nang test 2", "tierLevel": "SILVER", "description": "This is a test plan created by test script", "durationDays": 45}	{"price": 1350000}	\N	\N	2026-06-23 07:11:14.554
143	1	USER	PLAN_DELETED	subscription_plans	8	{"name": "TEST_PLAN"}	null	\N	\N	2026-06-23 07:11:17.729
144	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	8	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-23 07:11:21.406
145	1	SYSTEM	SUBSCRIPTION_ACTIVATED	user_subscriptions	5	\N	{"planId": 102, "endDate": "2026-07-23T07:12:01.438Z", "tierLevel": "SILVER"}	\N	\N	2026-06-23 07:12:01.47
146	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	8	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-23 07:25:23.685
179	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-23 07:39:18.885
212	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	14	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-23 07:53:20.692
213	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	14	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-23 07:53:20.694
214	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	14	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-23 08:07:22.377
215	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	14	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-23 08:21:24.017
216	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	14	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-23 08:35:25.914
217	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	14	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-23 08:49:26.808
218	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	14	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-23 09:03:27.901
219	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	14	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-23 09:17:28.936
220	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	14	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-23 09:31:31.143
221	\N	CRON	SCHEDULED_CLEANUP	user_sessions	SYSTEM_BATCH_01	\N	{"status": "CLEANED_EXPIRED_SESSIONS"}	127.0.0.1	System Cron Service	2026-06-23 11:07:37.042
234	10	SYSTEM	ARTICLE_CREATED	blogs	64	null	null	\N	\N	2026-06-23 11:07:51.779
235	10	SYSTEM	ARTICLE_PENDING_REVIEW	blogs	64	null	null	\N	\N	2026-06-23 11:07:51.856
236	10	SYSTEM	ARTICLE_PUBLISHED	blogs	64	null	null	\N	\N	2026-06-23 11:07:51.868
237	12	SYSTEM	WATCHLIST_CREATED	watchlists	4	null	null	\N	\N	2026-06-23 11:08:02.961
238	12	SYSTEM	WATCHLIST_ITEM_ADDED	watchlist_items	4	null	null	\N	\N	2026-06-23 11:08:03.022
239	12	SYSTEM	ALERT_CREATED	price_alerts	4	null	null	\N	\N	2026-06-23 11:08:03.066
240	12	SYSTEM	ALERT_TRIGGERED	price_alerts	4	null	null	\N	\N	2026-06-23 11:08:03.091
241	\N	SYSTEM	REALTIME_SIGNAL_BROADCAST	vip_signals	UNKNOWN	null	null	\N	\N	2026-06-23 11:08:08.049
242	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-25 02:35:15.253
243	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-25 02:35:28.305
244	1	SYSTEM	SYSTEM_SEED	users	1	\N	{"note": "Foundation seeder executed", "email": "admin@fintop.vn"}	127.0.0.1	CLI Seeder	2026-06-25 02:55:47.132
245	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-25 04:05:08.039
246	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	50	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-25 04:22:38.606
247	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	50	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-25 04:22:39.363
248	1	USER	LOGOUT	user_sessions	50	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-25 04:22:46.024
472	1	SYSTEM	MOCK_DATA_SEED	system	0	\N	{"note": "Comprehensive mock data seed executed", "blogs": 15, "stocks": 20, "signals": 6}	127.0.0.1	CLI Mock Data Seeder	2026-06-30 04:18:59.544
476	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	79	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-30 05:08:09.53
479	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	79	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-30 06:30:19.056
482	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-30 06:38:51.524
487	1	USER	USER_STATUS_ACTIVE	users	155	{"status": "INACTIVE"}	{"status": "ACTIVE"}	\N	\N	2026-06-30 07:02:39.84
489	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	82	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-30 07:07:01.15
491	6	USER	LOGIN_SUCCESS	users	6	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-30 07:14:26.77
494	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	85	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-30 07:36:11.308
495	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-30 07:36:14.785
498	6	USER	LOGIN_SUCCESS	users	6	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-30 07:36:47.232
499	6	USER	LOGIN_SUCCESS	users	6	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-01 00:20:23.463
500	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-01 00:20:40.225
501	6	USER	LOGIN_SUCCESS	users	6	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-01 00:21:03.896
502	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-01 00:21:23.233
503	6	USER	LOGIN_SUCCESS	users	6	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-01 00:31:11.316
504	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-01 00:32:05.655
505	6	USER	LOGIN_SUCCESS	users	6	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-01 00:32:22.035
506	6	USER	LOGIN_SUCCESS	users	6	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-01 00:34:25.341
507	6	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	95	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-01 00:53:30.876
508	6	USER	LOGIN_SUCCESS	users	6	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-01 00:53:32.061
509	6	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	96	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-01 01:41:19.612
510	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-02 02:18:32.871
511	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	97	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-02 02:32:37.658
512	6	USER	LOGIN_SUCCESS	users	6	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-02 02:35:30.288
513	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-02 02:35:59.824
514	6	USER	LOGIN_SUCCESS	users	6	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-02 02:36:08.28
515	6	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	100	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-02 02:50:10.981
516	6	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	100	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-02 03:04:13.679
517	6	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	100	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-02 03:18:16.85
518	6	USER	LOGIN_SUCCESS	users	6	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-02 03:33:17.2
519	\N	CRON	SCHEDULED_CLEANUP	user_sessions	SYSTEM_BATCH_01	\N	{"status": "CLEANED_EXPIRED_SESSIONS"}	127.0.0.1	System Cron Service	2026-07-02 03:35:03.897
249	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-25 04:22:50.197
250	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	51	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-25 05:24:49.775
251	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	51	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-25 05:24:49.772
283	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-25 06:53:08.088
284	1	SYSTEM	ARTICLE_PENDING_REVIEW	blogs	74	null	null	\N	\N	2026-06-25 06:53:28.529
285	1	SYSTEM	ARTICLE_PUBLISHED	blogs	74	null	null	\N	\N	2026-06-25 06:53:28.547
286	1	SYSTEM	ARTICLE_PENDING_REVIEW	blogs	75	null	null	\N	\N	2026-06-25 06:53:29.491
287	1	SYSTEM	ARTICLE_PUBLISHED	blogs	75	null	null	\N	\N	2026-06-25 06:53:29.504
288	1	SYSTEM	ARTICLE_PENDING_REVIEW	blogs	76	null	null	\N	\N	2026-06-25 06:53:30.394
289	1	SYSTEM	ARTICLE_PUBLISHED	blogs	76	null	null	\N	\N	2026-06-25 06:53:30.407
290	1	SYSTEM	ARTICLE_PENDING_REVIEW	blogs	77	null	null	\N	\N	2026-06-25 06:53:31.075
291	1	SYSTEM	ARTICLE_PUBLISHED	blogs	77	null	null	\N	\N	2026-06-25 06:53:31.087
292	1	SYSTEM	ARTICLE_PENDING_REVIEW	blogs	79	null	null	\N	\N	2026-06-25 06:53:32.02
293	1	SYSTEM	ARTICLE_PUBLISHED	blogs	79	null	null	\N	\N	2026-06-25 06:53:32.034
294	1	SYSTEM	ARTICLE_PENDING_REVIEW	blogs	80	null	null	\N	\N	2026-06-25 06:53:32.531
295	1	SYSTEM	ARTICLE_PUBLISHED	blogs	80	null	null	\N	\N	2026-06-25 06:53:32.545
296	1	SYSTEM	ARTICLE_PENDING_REVIEW	blogs	81	null	null	\N	\N	2026-06-25 06:53:33.547
297	1	SYSTEM	ARTICLE_PUBLISHED	blogs	81	null	null	\N	\N	2026-06-25 06:53:33.56
298	1	SYSTEM	ARTICLE_PENDING_REVIEW	blogs	82	null	null	\N	\N	2026-06-25 06:53:34.082
299	1	SYSTEM	ARTICLE_PUBLISHED	blogs	82	null	null	\N	\N	2026-06-25 06:53:34.1
300	1	SYSTEM	ARTICLE_PENDING_REVIEW	blogs	83	null	null	\N	\N	2026-06-25 06:53:34.746
301	1	SYSTEM	ARTICLE_PUBLISHED	blogs	83	null	null	\N	\N	2026-06-25 06:53:34.759
302	1	SYSTEM	ARTICLE_PENDING_REVIEW	blogs	70	null	null	\N	\N	2026-06-25 06:53:40.844
303	1	SYSTEM	ARTICLE_PUBLISHED	blogs	70	null	null	\N	\N	2026-06-25 06:53:40.857
304	1	SYSTEM	ARTICLE_PENDING_REVIEW	blogs	71	null	null	\N	\N	2026-06-25 06:53:41.739
305	1	SYSTEM	ARTICLE_PUBLISHED	blogs	71	null	null	\N	\N	2026-06-25 06:53:41.748
306	1	SYSTEM	ARTICLE_PENDING_REVIEW	blogs	72	null	null	\N	\N	2026-06-25 06:53:42.316
307	1	SYSTEM	ARTICLE_PUBLISHED	blogs	72	null	null	\N	\N	2026-06-25 06:53:42.328
308	1	SYSTEM	ARTICLE_PENDING_REVIEW	blogs	73	null	null	\N	\N	2026-06-25 06:53:42.889
309	1	SYSTEM	ARTICLE_PUBLISHED	blogs	73	null	null	\N	\N	2026-06-25 06:53:42.899
310	1	SYSTEM	ARTICLE_PENDING_REVIEW	blogs	67	null	null	\N	\N	2026-06-25 06:53:44.795
311	1	SYSTEM	ARTICLE_PUBLISHED	blogs	67	null	null	\N	\N	2026-06-25 06:53:44.804
312	1	SYSTEM	ARTICLE_PENDING_REVIEW	blogs	88	null	null	\N	\N	2026-06-25 06:53:53.788
313	1	SYSTEM	ARTICLE_PUBLISHED	blogs	88	null	null	\N	\N	2026-06-25 06:53:53.807
314	1	SYSTEM	ARTICLE_PENDING_REVIEW	blogs	87	null	null	\N	\N	2026-06-25 06:53:54.211
315	1	SYSTEM	ARTICLE_PUBLISHED	blogs	87	null	null	\N	\N	2026-06-25 06:53:54.225
316	1	SYSTEM	ARTICLE_PENDING_REVIEW	blogs	86	null	null	\N	\N	2026-06-25 06:53:55.073
317	1	SYSTEM	ARTICLE_PUBLISHED	blogs	86	null	null	\N	\N	2026-06-25 06:53:55.086
318	1	SYSTEM	ARTICLE_PENDING_REVIEW	blogs	85	null	null	\N	\N	2026-06-25 06:53:55.683
319	1	SYSTEM	ARTICLE_PUBLISHED	blogs	85	null	null	\N	\N	2026-06-25 06:53:55.695
320	1	SYSTEM	ARTICLE_PENDING_REVIEW	blogs	84	null	null	\N	\N	2026-06-25 06:53:56.546
321	1	SYSTEM	ARTICLE_PUBLISHED	blogs	84	null	null	\N	\N	2026-06-25 06:53:56.558
322	3	SYSTEM	SUBSCRIPTION_ACTIVATED	user_subscriptions	6	\N	{"planId": 103, "endDate": "2026-09-23T06:54:13.938Z", "tierLevel": "GOLD"}	\N	\N	2026-06-25 06:54:13.947
323	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	52	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-25 07:07:10.807
324	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	52	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-25 07:21:12.375
325	1	SYSTEM	ARTICLE_DRAFT	blogs	64	null	null	\N	\N	2026-06-25 07:25:10.56
326	1	SYSTEM	ARTICLE_DELETED	blogs	64	null	null	\N	\N	2026-06-25 07:25:18.479
327	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	52	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-25 07:35:15.868
328	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	52	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-25 07:50:50.951
329	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-25 07:50:55.555
473	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	79	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-30 04:25:39.825
477	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	79	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-30 05:40:42.519
480	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-30 06:30:54.24
483	1	USER	ROLE_ASSIGNED	user_roles	155:9	null	{"userId": 155, "roleCode": "EXPERT"}	\N	\N	2026-06-30 06:39:48.967
484	1	USER	ROLE_REMOVED	user_roles	155:9	{"userId": 155, "roleCode": "EXPERT"}	null	\N	\N	2026-06-30 06:39:52.976
496	1	USER	ROLE_REMOVED	user_roles	155:2	{"userId": 155, "roleCode": "CEO"}	null	\N	\N	2026-06-30 07:36:32.296
344	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	53	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-25 08:48:03.429
345	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	53	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-25 08:48:03.431
343	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	53	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-25 08:48:03.432
346	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-28 03:35:26.811
347	1	USER	LOGOUT	user_sessions	56	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-28 03:35:51.697
348	5	USER	PASSWORD_RESET	users	5	null	null	\N	\N	2026-06-28 03:36:36.676
349	108	USER	USER_REGISTER	users	108	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-28 04:27:04.342
352	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-29 02:28:13.995
353	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	57	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-29 02:42:16.447
354	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	57	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-29 02:56:19.742
355	1	USER	USER_STATUS_INACTIVE	users	109	{"status": "ACTIVE"}	{"status": "INACTIVE"}	\N	\N	2026-06-29 03:02:12.489
356	1	USER	USER_STATUS_ACTIVE	users	109	{"status": "INACTIVE"}	{"status": "ACTIVE"}	\N	\N	2026-06-29 03:02:12.821
357	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	57	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-29 03:10:23.258
358	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-29 03:32:21.767
359	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	58	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-29 03:46:25.021
360	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	58	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-29 04:00:29.003
361	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-29 04:24:35.043
362	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	59	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-29 06:13:48.496
363	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	59	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-29 06:13:49.827
364	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-29 06:13:52.653
365	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	60	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-29 06:27:55.926
366	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	60	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-29 06:47:32.047
367	1	USER	USER_DELETED	users	109	{"email": "linhkhanhtran1111@gmail.com"}	null	\N	\N	2026-06-29 07:00:19.176
368	1	USER	USER_DELETED	users	108	{"email": "linhkhantran1111@gmail.com"}	null	\N	\N	2026-06-29 07:00:24.482
369	1	USER	USER_DELETED	users	20	{"email": "test_billing@fintop.vn"}	null	\N	\N	2026-06-29 07:00:29.979
370	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	60	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-29 07:01:36.438
371	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	60	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-29 07:15:40.622
373	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	60	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-29 07:29:49.575
372	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	60	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-29 07:29:49.571
374	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-29 07:29:55.825
375	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	61	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-29 07:43:59.461
376	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	61	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-29 07:58:04.23
401	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-30 02:32:42.158
402	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	69	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-30 02:47:01.517
377	1	USER	HANDBOOK_UPDATED	handbooks	1	{"order": 1, "title": "Nhà đầu tư thành công - Wiliam ONeil", "status": "ACTIVE", "category": "TU_SACH_DAU_TU", "linkType": "link", "driveLink": "https://drive.google.com/open?id=1pnbZmsYUncrvDR-T0mFTsmuIBtQz6xMO", "description": null}	{"order": 1, "title": "Nhà đầu tư thành công - Wiliam ONeil", "status": "ACTIVE", "category": "TU_SACH_DAU_TU", "linkType": "file", "driveLink": "https://drive.google.com/open?id=1pnbZmsYUncrvDR-T0mFTsmuIBtQz6xMO", "description": null}	\N	\N	2026-06-29 08:05:07.736
378	1	USER	HANDBOOK_UPDATED	handbooks	1	{"order": 1, "title": "Nhà đầu tư thành công - Wiliam ONeil", "status": "ACTIVE", "category": "TU_SACH_DAU_TU", "linkType": "file", "driveLink": "https://drive.google.com/open?id=1pnbZmsYUncrvDR-T0mFTsmuIBtQz6xMO", "description": null}	{"order": 1, "title": "Nhà đầu tư thành công - Wiliam ONeil", "status": "ACTIVE", "category": "TU_SACH_DAU_TU", "linkType": "link", "driveLink": "https://drive.google.com/open?id=1pnbZmsYUncrvDR-T0mFTsmuIBtQz6xMO", "description": null}	\N	\N	2026-06-29 08:05:11.911
379	1	USER	HANDBOOK_UPDATED	handbooks	1	{"order": 1, "title": "Nhà đầu tư thành công - Wiliam ONeil", "status": "ACTIVE", "category": "TU_SACH_DAU_TU", "linkType": "link", "driveLink": "https://drive.google.com/open?id=1pnbZmsYUncrvDR-T0mFTsmuIBtQz6xMO", "description": null}	{"order": 5, "title": "Nhà đầu tư thành công - Wiliam ONeil", "status": "ACTIVE", "category": "TU_SACH_DAU_TU", "linkType": "link", "driveLink": "https://drive.google.com/open?id=1pnbZmsYUncrvDR-T0mFTsmuIBtQz6xMO", "description": null}	\N	\N	2026-06-29 08:05:17.078
380	1	USER	HANDBOOK_UPDATED	handbooks	3	{"order": 3, "title": "Nhà đầu tư thông minh - Benjamin Graham", "status": "ACTIVE", "category": "TU_SACH_DAU_TU", "linkType": "link", "driveLink": "https://drive.google.com/file/d/16iaN3HsRli_0DQ_DlxM33Pg71PzTlQI0/view?usp=sharing", "description": null}	{"order": 1, "title": "Nhà đầu tư thông minh - Benjamin Graham", "status": "ACTIVE", "category": "TU_SACH_DAU_TU", "linkType": "link", "driveLink": "https://drive.google.com/file/d/16iaN3HsRli_0DQ_DlxM33Pg71PzTlQI0/view?usp=sharing", "description": null}	\N	\N	2026-06-29 08:05:34.778
381	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-29 09:07:10.389
382	1	USER	HANDBOOK_UPDATED	handbooks	3	{"order": 1, "title": "Nhà đầu tư thông minh - Benjamin Graham", "status": "ACTIVE", "category": "TU_SACH_DAU_TU", "linkType": "link", "driveLink": "https://drive.google.com/file/d/16iaN3HsRli_0DQ_DlxM33Pg71PzTlQI0/view?usp=sharing", "description": null}	{"order": 3, "title": "Nhà đầu tư thông minh - Benjamin Graham", "status": "ACTIVE", "category": "TU_SACH_DAU_TU", "linkType": "link", "driveLink": "https://drive.google.com/file/d/16iaN3HsRli_0DQ_DlxM33Pg71PzTlQI0/view?usp=sharing", "description": null}	\N	\N	2026-06-29 09:07:52.897
383	1	USER	HANDBOOK_UPDATED	handbooks	2	{"order": 1, "title": "Chết vì chứng khoán - Jesse Livermore", "status": "ACTIVE", "category": "TU_SACH_DAU_TU", "linkType": "link", "driveLink": "https://drive.google.com/file/d/16iaN3HsRli_0DQ_DlxM33Pg71PzTlQI0/view?usp=sharing", "description": null}	{"order": 3, "title": "Chết vì chứng khoán - Jesse Livermore", "status": "ACTIVE", "category": "TU_SACH_DAU_TU", "linkType": "link", "driveLink": "https://drive.google.com/file/d/16iaN3HsRli_0DQ_DlxM33Pg71PzTlQI0/view?usp=sharing", "description": null}	\N	\N	2026-06-29 09:08:04.931
384	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	62	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-29 09:21:14.758
385	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-30 01:57:17.379
386	1	USER	LOGOUT	user_sessions	63	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-30 01:57:41.787
387	6	USER	LOGIN_FAILED	users	N/A	{"email": "tuannv7105@gmail.com"}	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-30 01:57:59.649
388	6	USER	LOGIN_FAILED	users	N/A	{"email": "tuannv7105@gmail.com"}	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-30 01:58:03.105
389	6	USER	LOGIN_FAILED	users	N/A	{"email": "tuannv7105@gmail.com"}	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-30 01:58:07.471
390	6	USER	LOGIN_FAILED	users	N/A	{"email": "tuannv7105@gmail.com"}	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-30 01:58:07.954
391	6	USER	PASSWORD_RESET	users	6	null	null	\N	\N	2026-06-30 01:58:50.059
392	6	USER	LOGIN_SUCCESS	users	6	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-30 01:59:01.115
393	6	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	64	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-30 02:13:00.834
394	6	USER	LOGOUT	user_sessions	64	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-30 02:17:37.175
395	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-30 02:17:40.612
396	1	USER	LOGOUT	user_sessions	65	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-30 02:27:53.685
397	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-30 02:27:54.992
398	1	USER	LOGOUT	user_sessions	66	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-30 02:28:03.438
399	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-30 02:31:25.306
400	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-30 02:31:32.529
403	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-30 02:47:02.481
404	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	70	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-30 03:01:07.173
405	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	70	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-30 03:15:11.583
406	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	70	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-30 03:30:10.539
407	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-30 03:30:36.094
408	6	USER	LOGIN_SUCCESS	users	6	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-30 03:35:10.119
409	\N	CRON	SCHEDULED_CLEANUP	user_sessions	SYSTEM_BATCH_01	\N	{"status": "CLEANED_EXPIRED_SESSIONS"}	127.0.0.1	System Cron Service	2026-06-30 03:46:50.026
474	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	79	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-30 04:39:49.56
478	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	79	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-30 06:09:37.68
481	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-30 06:37:55.622
485	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	82	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-30 06:52:56.631
488	1	USER	USER_UPDATED	users	155	{"dob": "2005-10-07T00:00:00.000Z", "phone": "0985863045", "address": "Quốc Oai, Hà Nội", "fullName": "Nguyễn Văn Tuấn", "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"dob": "2005-10-07T00:00:00.000Z", "phone": "0985863045", "address": "Quốc Oai, Hà Nội", "fullName": "Nguyễn Văn Tuấn", "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	\N	\N	2026-06-30 07:03:30.855
490	1	USER	USER_UPDATED	users	155	{"dob": "2005-10-07T00:00:00.000Z", "phone": "0985863045", "address": "Quốc Oai, Hà Nội", "fullName": "Nguyễn Văn Tuấn", "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"dob": "2005-10-07T00:00:00.000Z", "phone": "0985863045", "address": "Quốc Oai, Hà Nội", "fullName": "Nguyễn Văn Tuấn", "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	\N	\N	2026-06-30 07:14:17.788
492	6	USER	LOGIN_SUCCESS	users	6	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-30 07:14:41.385
493	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-30 07:14:48.738
497	1	USER	ROLE_ASSIGNED	user_roles	155:1	null	{"userId": 155, "roleCode": "SUPER_ADMIN"}	\N	\N	2026-06-30 07:36:39.551
423	10	SYSTEM	ARTICLE_CREATED	blogs	89	null	null	\N	\N	2026-06-30 03:47:10.865
424	10	SYSTEM	ARTICLE_PENDING_REVIEW	blogs	89	null	null	\N	\N	2026-06-30 03:47:11.032
425	10	SYSTEM	ARTICLE_PUBLISHED	blogs	89	null	null	\N	\N	2026-06-30 03:47:11.039
426	12	SYSTEM	WATCHLIST_CREATED	watchlists	5	null	null	\N	\N	2026-06-30 03:47:22.204
427	12	SYSTEM	WATCHLIST_ITEM_ADDED	watchlist_items	5	null	null	\N	\N	2026-06-30 03:47:22.228
428	12	SYSTEM	ALERT_CREATED	price_alerts	5	null	null	\N	\N	2026-06-30 03:47:22.246
429	12	SYSTEM	ALERT_TRIGGERED	price_alerts	5	null	null	\N	\N	2026-06-30 03:47:22.268
430	\N	SYSTEM	REALTIME_SIGNAL_BROADCAST	vip_signals	UNKNOWN	null	null	\N	\N	2026-06-30 03:47:27.749
431	14	SYSTEM	SIGNAL_PUBLISHED	vip_signals	32	null	null	\N	\N	2026-06-30 03:47:31.386
432	\N	SYSTEM	REALTIME_SIGNAL_BROADCAST	vip_signals	32	null	null	\N	\N	2026-06-30 03:47:31.448
433	\N	SYSTEM	SIGNAL_REACHED_TARGET	vip_signals	32	null	null	\N	\N	2026-06-30 03:47:31.464
434	14	SYSTEM	PORTFOLIO_CREATED	recommended_portfolios	8	null	null	\N	\N	2026-06-30 03:47:31.477
435	\N	SYSTEM	HOLDING_ADDED	portfolio_holdings	24	null	null	\N	\N	2026-06-30 03:47:31.495
439	\N	CRON	SCHEDULED_CLEANUP	user_sessions	SYSTEM_BATCH_01	\N	{"status": "CLEANED_EXPIRED_SESSIONS"}	127.0.0.1	System Cron Service	2026-06-30 03:48:14.574
453	10	SYSTEM	ARTICLE_CREATED	blogs	90	null	null	\N	\N	2026-06-30 03:48:49.166
454	10	SYSTEM	ARTICLE_PENDING_REVIEW	blogs	90	null	null	\N	\N	2026-06-30 03:48:49.256
455	10	SYSTEM	ARTICLE_PUBLISHED	blogs	90	null	null	\N	\N	2026-06-30 03:48:49.266
456	12	SYSTEM	WATCHLIST_CREATED	watchlists	6	null	null	\N	\N	2026-06-30 03:49:01.278
457	12	SYSTEM	WATCHLIST_ITEM_ADDED	watchlist_items	6	null	null	\N	\N	2026-06-30 03:49:01.302
458	12	SYSTEM	ALERT_CREATED	price_alerts	6	null	null	\N	\N	2026-06-30 03:49:01.319
459	12	SYSTEM	ALERT_TRIGGERED	price_alerts	6	null	null	\N	\N	2026-06-30 03:49:01.338
460	\N	SYSTEM	REALTIME_SIGNAL_BROADCAST	vip_signals	UNKNOWN	null	null	\N	\N	2026-06-30 03:49:07.338
461	14	SYSTEM	SIGNAL_PUBLISHED	vip_signals	33	null	null	\N	\N	2026-06-30 03:49:11.379
462	\N	SYSTEM	REALTIME_SIGNAL_BROADCAST	vip_signals	33	null	null	\N	\N	2026-06-30 03:49:11.444
463	\N	SYSTEM	SIGNAL_REACHED_TARGET	vip_signals	33	null	null	\N	\N	2026-06-30 03:49:11.46
464	14	SYSTEM	PORTFOLIO_CREATED	recommended_portfolios	9	null	null	\N	\N	2026-06-30 03:49:11.473
465	\N	SYSTEM	HOLDING_ADDED	portfolio_holdings	25	null	null	\N	\N	2026-06-30 03:49:11.499
533	10	SYSTEM	ARTICLE_CREATED	blogs	130	null	null	\N	\N	2026-07-02 03:35:28.934
534	10	SYSTEM	ARTICLE_PENDING_REVIEW	blogs	130	null	null	\N	\N	2026-07-02 03:35:29.019
535	10	SYSTEM	ARTICLE_PUBLISHED	blogs	130	null	null	\N	\N	2026-07-02 03:35:29.027
536	12	SYSTEM	WATCHLIST_CREATED	watchlists	7	null	null	\N	\N	2026-07-02 03:35:40.87
537	12	SYSTEM	WATCHLIST_ITEM_ADDED	watchlist_items	7	null	null	\N	\N	2026-07-02 03:35:40.886
538	12	SYSTEM	ALERT_CREATED	price_alerts	7	null	null	\N	\N	2026-07-02 03:35:40.898
539	12	SYSTEM	ALERT_TRIGGERED	price_alerts	7	null	null	\N	\N	2026-07-02 03:35:40.912
540	\N	SYSTEM	REALTIME_SIGNAL_BROADCAST	vip_signals	UNKNOWN	null	null	\N	\N	2026-07-02 03:35:45.92
541	14	SYSTEM	SIGNAL_PUBLISHED	vip_signals	40	null	null	\N	\N	2026-07-02 03:35:49.527
542	\N	SYSTEM	REALTIME_SIGNAL_BROADCAST	vip_signals	40	null	null	\N	\N	2026-07-02 03:35:49.597
543	\N	SYSTEM	SIGNAL_REACHED_TARGET	vip_signals	40	null	null	\N	\N	2026-07-02 03:35:49.613
544	14	SYSTEM	PORTFOLIO_CREATED	recommended_portfolios	11	null	null	\N	\N	2026-07-02 03:35:49.629
545	\N	SYSTEM	HOLDING_ADDED	portfolio_holdings	31	null	null	\N	\N	2026-07-02 03:35:49.652
549	6	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	101	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-02 03:47:19.539
550	\N	CRON	SCHEDULED_CLEANUP	user_sessions	SYSTEM_BATCH_01	\N	{"status": "CLEANED_EXPIRED_SESSIONS"}	127.0.0.1	System Cron Service	2026-07-02 03:52:22.629
564	10	SYSTEM	ARTICLE_CREATED	blogs	131	null	null	\N	\N	2026-07-02 03:52:48.199
565	10	SYSTEM	ARTICLE_PENDING_REVIEW	blogs	131	null	null	\N	\N	2026-07-02 03:52:48.28
566	10	SYSTEM	ARTICLE_PUBLISHED	blogs	131	null	null	\N	\N	2026-07-02 03:52:48.29
567	12	SYSTEM	WATCHLIST_CREATED	watchlists	8	null	null	\N	\N	2026-07-02 03:52:59.876
568	12	SYSTEM	WATCHLIST_ITEM_ADDED	watchlist_items	8	null	null	\N	\N	2026-07-02 03:52:59.895
569	12	SYSTEM	ALERT_CREATED	price_alerts	8	null	null	\N	\N	2026-07-02 03:52:59.909
570	12	SYSTEM	ALERT_TRIGGERED	price_alerts	8	null	null	\N	\N	2026-07-02 03:52:59.925
571	\N	SYSTEM	REALTIME_SIGNAL_BROADCAST	vip_signals	UNKNOWN	null	null	\N	\N	2026-07-02 03:53:05.817
572	6	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	101	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-02 04:05:40.07
573	6	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	101	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-02 04:05:41.612
574	6	USER	LOGIN_SUCCESS	users	6	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-02 04:09:09.946
575	6	USER	LOGIN_SUCCESS	users	6	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-06 02:13:14.162
576	164	USER	USER_REGISTER	users	164	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-06 02:41:00.955
577	164	USER	EMAIL_VERIFIED	users	164	null	null	\N	\N	2026-07-06 02:41:34.247
578	\N	USER	LOGIN_FAILED	users	N/A	{"email": "linhkhanhtran1111@gmail.om"}	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-06 02:41:59.598
579	164	USER	LOGIN_FAILED	users	N/A	{"email": "linhkhanhtran1111@gmail.com"}	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-06 02:42:07.35
580	164	USER	LOGIN_FAILED	users	N/A	{"email": "linhkhanhtran1111@gmail.com"}	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-06 02:42:11.389
581	164	USER	LOGIN_SUCCESS	users	164	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-06 02:43:52.586
582	164	USER	PASSWORD_RESET	users	164	null	null	\N	\N	2026-07-06 02:45:34.481
583	164	USER	LOGIN_SUCCESS	users	164	null	null	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0	2026-07-06 02:45:59.641
584	164	USER	LOGIN_SUCCESS	users	164	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-06 02:46:17.697
585	164	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	109	null	null	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0	2026-07-06 03:00:01.353
586	164	USER	LOGIN_SUCCESS	users	164	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-06 03:00:10.208
587	164	USER	LOGIN_SUCCESS	users	164	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-06 03:01:15.835
588	164	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	109	null	null	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0	2026-07-06 03:14:02.969
589	6	USER	LOGIN_SUCCESS	users	6	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-06 03:21:30.218
590	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-06 03:21:50.605
591	164	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	109	null	null	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0	2026-07-06 03:28:04.04
592	6	USER	LOGIN_SUCCESS	users	6	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-06 03:30:05.618
593	6	USER	LOGIN_SUCCESS	users	6	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-06 03:38:14.37
594	164	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	109	null	null	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0	2026-07-06 03:42:05.917
595	164	USER	LOGIN_SUCCESS	users	164	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-06 03:46:25.794
596	6	USER	LOGIN_SUCCESS	users	6	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-06 03:49:49.344
597	164	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	109	null	null	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0	2026-07-06 03:56:07.345
598	6	USER	LOGIN_SUCCESS	users	6	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-06 04:00:10.646
599	164	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	109	null	null	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0	2026-07-06 04:10:09.214
600	6	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	119	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-06 04:14:14.271
601	164	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	109	null	null	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0	2026-07-06 04:24:11.484
602	6	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	119	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-06 04:28:33.368
603	164	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	109	null	null	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0	2026-07-06 04:38:14.717
604	164	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	109	null	null	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0	2026-07-06 04:52:17.386
605	164	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	109	null	null	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0	2026-07-06 05:06:20.3
606	6	USER	LOGIN_SUCCESS	users	6	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-06 06:07:40.606
607	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-06 06:08:12.779
608	1	USER	ROLE_ASSIGNED	user_roles	164:1	null	{"userId": 164, "roleCode": "SUPER_ADMIN"}	\N	\N	2026-07-06 06:08:45.243
609	164	USER	LOGIN_SUCCESS	users	164	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-06 06:08:56.008
610	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-07 02:24:29.012
611	1	SYSTEM	MOCK_DATA_SEED	system	0	\N	{"note": "Comprehensive mock data seed executed", "blogs": 23, "stocks": 20, "signals": 6}	127.0.0.1	CLI Mock Data Seeder	2026-07-07 02:33:04.527
612	\N	CRON	SCHEDULED_CLEANUP	user_sessions	SYSTEM_BATCH_01	\N	{"status": "CLEANED_EXPIRED_SESSIONS"}	127.0.0.1	System Cron Service	2026-07-07 02:36:19.888
626	10	SYSTEM	ARTICLE_CREATED	blogs	155	null	null	\N	\N	2026-07-07 02:36:52.335
627	10	SYSTEM	ARTICLE_PENDING_REVIEW	blogs	155	null	null	\N	\N	2026-07-07 02:36:52.509
628	10	SYSTEM	ARTICLE_PUBLISHED	blogs	155	null	null	\N	\N	2026-07-07 02:36:52.516
629	12	SYSTEM	WATCHLIST_CREATED	watchlists	9	null	null	\N	\N	2026-07-07 02:37:12.721
630	12	SYSTEM	WATCHLIST_ITEM_ADDED	watchlist_items	9	null	null	\N	\N	2026-07-07 02:37:12.771
631	12	SYSTEM	ALERT_CREATED	price_alerts	9	null	null	\N	\N	2026-07-07 02:37:12.796
632	12	SYSTEM	ALERT_TRIGGERED	price_alerts	9	null	null	\N	\N	2026-07-07 02:37:12.822
633	\N	SYSTEM	REALTIME_SIGNAL_BROADCAST	vip_signals	UNKNOWN	null	null	\N	\N	2026-07-07 02:37:19.086
634	14	SYSTEM	SIGNAL_PUBLISHED	vip_signals	47	null	null	\N	\N	2026-07-07 02:37:23.366
635	\N	SYSTEM	REALTIME_SIGNAL_BROADCAST	vip_signals	47	null	null	\N	\N	2026-07-07 02:37:23.432
636	\N	SYSTEM	SIGNAL_REACHED_TARGET	vip_signals	47	null	null	\N	\N	2026-07-07 02:37:23.447
637	14	SYSTEM	PORTFOLIO_CREATED	recommended_portfolios	13	null	null	\N	\N	2026-07-07 02:37:23.457
638	\N	SYSTEM	HOLDING_ADDED	portfolio_holdings	37	null	null	\N	\N	2026-07-07 02:37:23.477
642	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	123	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-07 02:38:32.164
643	1	SYSTEM	MOCK_DATA_SEED	system	0	\N	{"note": "Comprehensive mock data seed executed", "blogs": 23, "stocks": 20, "signals": 6}	127.0.0.1	CLI Mock Data Seeder	2026-07-07 02:38:42.902
644	\N	CRON	SCHEDULED_CLEANUP	user_sessions	SYSTEM_BATCH_01	\N	{"status": "CLEANED_EXPIRED_SESSIONS"}	127.0.0.1	System Cron Service	2026-07-07 02:39:19.034
658	10	SYSTEM	ARTICLE_CREATED	blogs	179	null	null	\N	\N	2026-07-07 02:39:45.656
659	10	SYSTEM	ARTICLE_PENDING_REVIEW	blogs	179	null	null	\N	\N	2026-07-07 02:39:45.72
660	10	SYSTEM	ARTICLE_PUBLISHED	blogs	179	null	null	\N	\N	2026-07-07 02:39:45.728
661	12	SYSTEM	WATCHLIST_CREATED	watchlists	10	null	null	\N	\N	2026-07-07 02:39:57.676
662	12	SYSTEM	WATCHLIST_ITEM_ADDED	watchlist_items	10	null	null	\N	\N	2026-07-07 02:39:57.691
663	12	SYSTEM	ALERT_CREATED	price_alerts	10	null	null	\N	\N	2026-07-07 02:39:57.704
664	12	SYSTEM	ALERT_TRIGGERED	price_alerts	10	null	null	\N	\N	2026-07-07 02:39:57.721
665	\N	SYSTEM	REALTIME_SIGNAL_BROADCAST	vip_signals	UNKNOWN	null	null	\N	\N	2026-07-07 02:40:02.776
666	14	SYSTEM	SIGNAL_PUBLISHED	vip_signals	54	null	null	\N	\N	2026-07-07 02:40:06.452
667	\N	SYSTEM	REALTIME_SIGNAL_BROADCAST	vip_signals	54	null	null	\N	\N	2026-07-07 02:40:06.54
668	\N	SYSTEM	SIGNAL_REACHED_TARGET	vip_signals	54	null	null	\N	\N	2026-07-07 02:40:06.563
669	14	SYSTEM	PORTFOLIO_CREATED	recommended_portfolios	15	null	null	\N	\N	2026-07-07 02:40:06.579
670	\N	SYSTEM	HOLDING_ADDED	portfolio_holdings	43	null	null	\N	\N	2026-07-07 02:40:06.608
674	1	USER	LOGIN_SUCCESS	users	1	null	null	::1	node	2026-07-07 02:44:41.967
675	1	SYSTEM	MOCK_DATA_SEED	system	0	\N	{"note": "Comprehensive mock data seed executed", "blogs": 23, "stocks": 20, "signals": 6}	127.0.0.1	CLI Mock Data Seeder	2026-07-07 02:46:02.401
676	1	USER	LOGIN_SUCCESS	users	1	null	null	::1	node	2026-07-07 02:46:07.051
677	1	SYSTEM	ARTICLE_UPDATED	blogs	201	null	null	\N	\N	2026-07-07 02:47:42.691
678	1	SYSTEM	ARTICLE_UPDATED	blogs	202	null	null	\N	\N	2026-07-07 02:48:56.385
679	1	SYSTEM	ARTICLE_UPDATED	blogs	198	null	null	\N	\N	2026-07-07 02:49:15.572
680	\N	CRON	SCHEDULED_CLEANUP	user_sessions	SYSTEM_BATCH_01	\N	{"status": "CLEANED_EXPIRED_SESSIONS"}	127.0.0.1	System Cron Service	2026-07-07 02:51:13.852
694	10	SYSTEM	ARTICLE_CREATED	blogs	203	null	null	\N	\N	2026-07-07 02:51:39.803
695	10	SYSTEM	ARTICLE_PENDING_REVIEW	blogs	203	null	null	\N	\N	2026-07-07 02:51:39.878
696	10	SYSTEM	ARTICLE_PUBLISHED	blogs	203	null	null	\N	\N	2026-07-07 02:51:39.887
697	12	SYSTEM	WATCHLIST_CREATED	watchlists	11	null	null	\N	\N	2026-07-07 02:51:52.611
698	12	SYSTEM	WATCHLIST_ITEM_ADDED	watchlist_items	11	null	null	\N	\N	2026-07-07 02:51:52.634
699	12	SYSTEM	ALERT_CREATED	price_alerts	11	null	null	\N	\N	2026-07-07 02:51:52.649
700	12	SYSTEM	ALERT_TRIGGERED	price_alerts	11	null	null	\N	\N	2026-07-07 02:51:52.666
701	\N	SYSTEM	REALTIME_SIGNAL_BROADCAST	vip_signals	UNKNOWN	null	null	\N	\N	2026-07-07 02:51:58.658
702	14	SYSTEM	SIGNAL_PUBLISHED	vip_signals	61	null	null	\N	\N	2026-07-07 02:52:03.409
703	\N	SYSTEM	REALTIME_SIGNAL_BROADCAST	vip_signals	61	null	null	\N	\N	2026-07-07 02:52:03.477
704	\N	SYSTEM	SIGNAL_REACHED_TARGET	vip_signals	61	null	null	\N	\N	2026-07-07 02:52:03.491
705	14	SYSTEM	PORTFOLIO_CREATED	recommended_portfolios	17	null	null	\N	\N	2026-07-07 02:52:03.504
706	\N	SYSTEM	HOLDING_ADDED	portfolio_holdings	49	null	null	\N	\N	2026-07-07 02:52:03.526
710	1	SYSTEM	MOCK_DATA_SEED	system	0	\N	{"note": "Comprehensive mock data seed executed", "blogs": 23, "stocks": 20, "signals": 6}	127.0.0.1	CLI Mock Data Seeder	2026-07-07 02:52:25.102
711	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	123	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-07 02:52:37.022
712	\N	CRON	SCHEDULED_CLEANUP	user_sessions	SYSTEM_BATCH_01	\N	{"status": "CLEANED_EXPIRED_SESSIONS"}	127.0.0.1	System Cron Service	2026-07-07 02:55:47.386
726	10	SYSTEM	ARTICLE_CREATED	blogs	227	null	null	\N	\N	2026-07-07 02:56:13.547
727	10	SYSTEM	ARTICLE_PENDING_REVIEW	blogs	227	null	null	\N	\N	2026-07-07 02:56:13.643
728	10	SYSTEM	ARTICLE_PUBLISHED	blogs	227	null	null	\N	\N	2026-07-07 02:56:13.65
729	12	SYSTEM	WATCHLIST_CREATED	watchlists	12	null	null	\N	\N	2026-07-07 02:56:25.005
730	12	SYSTEM	WATCHLIST_ITEM_ADDED	watchlist_items	12	null	null	\N	\N	2026-07-07 02:56:25.019
731	12	SYSTEM	ALERT_CREATED	price_alerts	12	null	null	\N	\N	2026-07-07 02:56:25.032
732	12	SYSTEM	ALERT_TRIGGERED	price_alerts	12	null	null	\N	\N	2026-07-07 02:56:25.048
733	\N	SYSTEM	REALTIME_SIGNAL_BROADCAST	vip_signals	UNKNOWN	null	null	\N	\N	2026-07-07 02:56:30.037
734	14	SYSTEM	SIGNAL_PUBLISHED	vip_signals	68	null	null	\N	\N	2026-07-07 02:56:33.596
735	\N	SYSTEM	REALTIME_SIGNAL_BROADCAST	vip_signals	68	null	null	\N	\N	2026-07-07 02:56:33.653
736	\N	SYSTEM	SIGNAL_REACHED_TARGET	vip_signals	68	null	null	\N	\N	2026-07-07 02:56:33.667
737	14	SYSTEM	PORTFOLIO_CREATED	recommended_portfolios	19	null	null	\N	\N	2026-07-07 02:56:33.682
738	\N	SYSTEM	HOLDING_ADDED	portfolio_holdings	55	null	null	\N	\N	2026-07-07 02:56:33.7
739	175	SYSTEM	INVOICE_CREATED	invoices	17	null	{"amount": "500000", "planId": 15, "status": "DRAFT"}	\N	\N	2026-07-07 02:56:37.487
740	175	SYSTEM	SUBSCRIPTION_ACTIVATED	user_subscriptions	13	\N	{"planId": 15, "endDate": "2026-08-06T02:56:37.505Z", "tierLevel": "GOLD"}	\N	\N	2026-07-07 02:56:37.512
741	175	CRON	SUBSCRIPTION_EXPIRED	user_subscriptions	13	null	null	\N	\N	2026-07-07 02:56:37.559
742	1	SYSTEM	MOCK_DATA_SEED	system	0	\N	{"note": "Comprehensive mock data seed executed", "blogs": 23, "stocks": 20, "signals": 6}	127.0.0.1	CLI Mock Data Seeder	2026-07-07 02:56:45.05
743	1	USER	LOGIN_SUCCESS	users	1	null	null	::1	node	2026-07-07 03:02:55.034
744	\N	CRON	SCHEDULED_CLEANUP	user_sessions	SYSTEM_BATCH_01	\N	{"status": "CLEANED_EXPIRED_SESSIONS"}	127.0.0.1	System Cron Service	2026-07-07 03:04:49.508
758	10	SYSTEM	ARTICLE_CREATED	blogs	251	null	null	\N	\N	2026-07-07 03:05:21.047
759	10	SYSTEM	ARTICLE_PENDING_REVIEW	blogs	251	null	null	\N	\N	2026-07-07 03:05:21.233
760	10	SYSTEM	ARTICLE_PUBLISHED	blogs	251	null	null	\N	\N	2026-07-07 03:05:21.243
761	12	SYSTEM	WATCHLIST_CREATED	watchlists	13	null	null	\N	\N	2026-07-07 03:05:36.213
762	12	SYSTEM	WATCHLIST_ITEM_ADDED	watchlist_items	13	null	null	\N	\N	2026-07-07 03:05:36.246
763	12	SYSTEM	ALERT_CREATED	price_alerts	13	null	null	\N	\N	2026-07-07 03:05:36.272
764	12	SYSTEM	ALERT_TRIGGERED	price_alerts	13	null	null	\N	\N	2026-07-07 03:05:36.306
765	\N	SYSTEM	REALTIME_SIGNAL_BROADCAST	vip_signals	UNKNOWN	null	null	\N	\N	2026-07-07 03:05:44.861
766	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	123	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-07 03:06:42.253
767	1	SYSTEM	MOCK_DATA_SEED	system	0	\N	{"note": "Comprehensive mock data seed executed", "blogs": 23, "stocks": 20, "signals": 6}	127.0.0.1	CLI Mock Data Seeder	2026-07-07 03:08:40.709
768	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	123	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-07 03:20:47.57
769	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	123	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-07 03:34:51.629
770	\N	CRON	SCHEDULED_CLEANUP	user_sessions	SYSTEM_BATCH_01	\N	{"status": "CLEANED_EXPIRED_SESSIONS"}	127.0.0.1	System Cron Service	2026-07-07 03:47:19.073
771	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	123	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-07 03:49:43.53
772	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	123	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-07 03:49:44.55
773	1	SYSTEM	INVOICE_CREATED	invoices	18	null	{"amount": "1500000", "planId": 102, "status": "DRAFT"}	\N	\N	2026-07-07 04:01:11.79
774	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	123	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-07 04:03:49.12
775	1	SYSTEM	INVOICE_CREATED	invoices	19	null	{"amount": "1500000", "planId": 102, "status": "DRAFT"}	\N	\N	2026-07-07 04:05:35.861
776	1	SYSTEM	MOCK_DATA_SEED	system	0	\N	{"note": "Comprehensive mock data seed executed", "blogs": 23, "stocks": 20, "signals": 6}	127.0.0.1	CLI Mock Data Seeder	2026-07-07 04:12:58.796
777	1	SYSTEM	INVOICE_CREATED	invoices	20	null	{"amount": "8000000", "planId": 18, "status": "DRAFT"}	\N	\N	2026-07-07 04:14:49.944
778	1	USER	INVOICE_APPROVED_MANUALLY	invoices	4	\N	{"planId": 102, "endDate": "2026-08-06T00:00:00.000Z", "isPermanent": false}	\N	\N	2026-07-07 04:15:09.385
779	1	USER	INVOICE_APPROVED_MANUALLY	invoices	20	\N	{"planId": 18, "endDate": "2027-07-07T00:00:00.000Z", "isPermanent": false}	\N	\N	2026-07-07 04:15:45.193
780	1	USER	INVOICE_APPROVED_MANUALLY	invoices	18	\N	{"planId": 102, "endDate": "2026-08-06T00:00:00.000Z", "isPermanent": false}	\N	\N	2026-07-07 04:16:03.358
781	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	123	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-07 04:17:53.785
782	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	123	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-07 05:01:54.681
783	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	123	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-07 06:09:49.28
784	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	123	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-07 06:09:50.364
785	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	123	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-07 06:23:54.493
786	164	USER	LOGIN_SUCCESS	users	164	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-07 06:36:30.691
787	164	USER	LOGIN_SUCCESS	users	164	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-07 07:05:04.151
788	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-07 07:12:06.985
789	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	139	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-07 07:26:11.107
790	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	139	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-07 07:40:16.545
791	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-07 08:17:05.09
792	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	140	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-07 08:35:02.58
793	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-07 08:35:09.503
794	164	USER	LOGIN_SUCCESS	users	164	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-07 08:47:01.321
795	164	SYSTEM	INVOICE_CREATED	invoices	21	null	{"amount": "8000000", "planId": 18, "status": "DRAFT"}	\N	\N	2026-07-07 08:47:29.435
796	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-07 08:47:41.247
797	1	USER	INVOICE_APPROVED_MANUALLY	invoices	21	\N	{"planId": 18, "endDate": "2027-07-07T00:00:00.000Z", "isPermanent": false}	\N	\N	2026-07-07 08:47:58.768
798	164	USER	LOGIN_SUCCESS	users	164	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-07 08:48:05.21
799	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-07 08:50:54.34
800	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-07 08:55:57.597
801	164	USER	LOGIN_SUCCESS	users	164	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-07 08:56:07.606
802	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-07 08:56:29.275
803	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-07 09:01:36.721
804	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-07 09:02:00.685
805	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 01:20:00.02
806	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 01:23:18.338
807	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	152	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 01:37:22.099
808	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	152	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 01:58:12.231
809	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 01:58:38.978
810	164	USER	LOGIN_SUCCESS	users	164	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 01:59:03.221
811	6	USER	LOGIN_SUCCESS	users	6	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 01:59:17.039
812	6	USER	ROLE_REMOVED	user_roles	164:1	{"userId": 164, "roleCode": "SUPER_ADMIN"}	null	\N	\N	2026-07-14 01:59:47.478
813	164	USER	LOGIN_SUCCESS	users	164	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 01:59:59.937
814	6	USER	LOGIN_SUCCESS	users	6	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 02:00:18.945
815	6	USER	USER_STATUS_undefined	users	164	{"status": "ACTIVE"}	{}	\N	\N	2026-07-14 02:01:01.288
816	164	USER	LOGIN_SUCCESS	users	164	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 02:01:14.466
817	164	USER	LOGIN_SUCCESS	users	164	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 02:12:15.665
818	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 02:12:28.387
819	1	USER	USER_STATUS_undefined	users	164	{"status": "ACTIVE"}	{}	\N	\N	2026-07-14 02:13:29.064
820	1	USER	USER_STATUS_undefined	users	164	{"status": "ACTIVE"}	{}	\N	\N	2026-07-14 02:13:41.586
821	164	USER	LOGIN_SUCCESS	users	164	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 02:38:25.753
822	164	USER	LOGIN_SUCCESS	users	164	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 02:44:10.074
823	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 02:44:34.937
824	164	USER	LOGIN_SUCCESS	users	164	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 02:47:34.513
825	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 02:47:55.769
826	6	USER	LOGIN_SUCCESS	users	6	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 02:48:15.484
827	6	USER	USER_STATUS_undefined	users	164	{"status": "ACTIVE"}	{}	\N	\N	2026-07-14 02:49:16.186
828	164	USER	LOGIN_SUCCESS	users	164	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 02:49:21.921
829	6	USER	LOGIN_SUCCESS	users	6	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 02:50:34.924
830	6	USER	USER_STATUS_undefined	users	164	{"status": "ACTIVE"}	{}	\N	\N	2026-07-14 02:50:56.61
831	164	USER	LOGIN_SUCCESS	users	164	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 02:51:01.95
832	6	USER	LOGIN_SUCCESS	users	6	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 02:51:43.94
833	\N	USER	LOGIN_FAILED	users	N/A	{"email": "ceo@fintop.vn"}	null	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-14 02:56:31.316
834	1	USER	LOGIN_SUCCESS	users	1	null	null	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-14 02:56:36.092
835	1	USER	LOGIN_SUCCESS	users	1	null	null	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-14 02:56:39.853
836	1	USER	LOGIN_SUCCESS	users	1	null	null	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-14 02:56:43.012
837	1	USER	LOGIN_SUCCESS	users	1	null	null	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-14 02:56:46.08
838	1	USER	USER_UPDATED	users	175	{"dob": null, "phone": null, "status": "ACTIVE", "address": null, "company": null, "brokerId": null, "fullName": "Test User Billing", "joinDate": null, "position": null, "avatarUrl": null, "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"tierLevel": "DIAMOND"}	\N	\N	2026-07-14 02:56:46.435
839	1	USER	LOGIN_SUCCESS	users	1	null	null	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-14 02:56:49.599
840	1	USER	LOGIN_SUCCESS	users	1	null	null	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-14 02:56:53.436
841	1	USER	USER_UPDATED	users	175	{"dob": null, "phone": null, "status": "ACTIVE", "address": null, "company": null, "brokerId": null, "fullName": "Test User Billing", "joinDate": null, "position": null, "avatarUrl": null, "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"brokerId": null, "tierLevel": "STANDARD"}	\N	\N	2026-07-14 02:56:53.46
842	1	USER	USER_UPDATED	users	175	{"dob": null, "phone": null, "status": "ACTIVE", "address": null, "company": null, "brokerId": null, "fullName": "Test User Billing", "joinDate": null, "position": null, "avatarUrl": null, "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"tierLevel": "GOLD"}	\N	\N	2026-07-14 02:56:53.481
843	1	USER	LOGIN_SUCCESS	users	1	null	null	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-14 02:56:56.823
844	1	USER	LOGIN_SUCCESS	users	1	null	null	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-14 02:57:00.595
845	1	USER	USER_UPDATED	users	175	{"dob": null, "phone": null, "status": "ACTIVE", "address": null, "company": null, "brokerId": null, "fullName": "Test User Billing", "joinDate": null, "position": null, "avatarUrl": null, "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"brokerId": 133, "tierLevel": "GOLD"}	\N	\N	2026-07-14 02:57:00.615
846	1	USER	LOGIN_SUCCESS	users	1	null	null	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-14 02:57:04.044
847	1	USER	USER_UPDATED	users	175	{"dob": null, "phone": null, "status": "ACTIVE", "address": null, "company": null, "brokerId": 133, "fullName": "Test User Billing", "joinDate": null, "position": null, "avatarUrl": null, "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"brokerId": 130, "tierLevel": "STANDARD"}	\N	\N	2026-07-14 02:57:04.069
848	6	USER	USER_UPDATED	users	164	{"dob": "2005-07-15T00:00:00.000Z", "phone": "+84865863045", "status": "ACTIVE", "address": "Hà Nội", "company": null, "brokerId": null, "fullName": "linh", "joinDate": null, "position": null, "avatarUrl": null, "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": "Linh hoạt kết hợp", "investmentDuration": "Trên 1 năm"}	{"brokerId": null, "tierLevel": "STANDARD"}	\N	\N	2026-07-14 02:57:24.006
849	164	USER	LOGIN_SUCCESS	users	164	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 02:57:33.477
850	164	SYSTEM	INVOICE_CREATED	invoices	22	null	{"amount": "8000000", "planId": 18, "status": "DRAFT"}	\N	\N	2026-07-14 02:58:07.48
851	6	USER	LOGIN_SUCCESS	users	6	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 02:58:20.761
852	6	USER	INVOICE_APPROVED_MANUALLY	invoices	22	\N	{"planId": 18, "endDate": "2027-07-14T00:00:00.000Z", "isPermanent": false}	\N	\N	2026-07-14 02:58:34.916
853	6	USER	USER_UPDATED	users	164	{"dob": "2005-07-15T00:00:00.000Z", "phone": "+84865863045", "status": "ACTIVE", "address": "Hà Nội", "company": null, "brokerId": null, "fullName": "linh", "joinDate": null, "position": null, "avatarUrl": null, "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": "Linh hoạt kết hợp", "investmentDuration": "Trên 1 năm"}	{"brokerId": null, "tierLevel": "STANDARD"}	\N	\N	2026-07-14 02:59:03.498
854	164	USER	LOGIN_SUCCESS	users	164	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 02:59:09.81
855	164	USER	LOGIN_SUCCESS	users	164	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 02:59:34.872
856	6	USER	LOGIN_SUCCESS	users	6	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 02:59:40.886
857	6	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	184	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 03:13:41.996
858	164	USER	LOGIN_SUCCESS	users	164	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 03:29:10.254
859	6	USER	LOGIN_SUCCESS	users	6	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 03:29:31.583
860	6	USER	USER_UPDATED	users	164	{"dob": "2005-07-15T00:00:00.000Z", "phone": "+84865863045", "status": "ACTIVE", "address": "Hà Nội", "company": null, "brokerId": null, "fullName": "linh", "joinDate": null, "position": null, "avatarUrl": null, "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": "Linh hoạt kết hợp", "investmentDuration": "Trên 1 năm"}	{"brokerId": null, "tierLevel": "DIAMOND"}	\N	\N	2026-07-14 03:29:44.631
861	164	USER	LOGIN_SUCCESS	users	164	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 03:29:53.364
862	6	USER	LOGIN_SUCCESS	users	6	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 03:30:09.963
863	6	USER	USER_UPDATED	users	164	{"dob": "2005-07-15T00:00:00.000Z", "phone": "+84865863045", "status": "ACTIVE", "address": "Hà Nội", "company": null, "brokerId": null, "fullName": "linh", "joinDate": null, "position": null, "avatarUrl": null, "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": "Linh hoạt kết hợp", "investmentDuration": "Trên 1 năm"}	{"brokerId": null, "tierLevel": "STANDARD"}	\N	\N	2026-07-14 03:30:20.677
864	164	USER	LOGIN_SUCCESS	users	164	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 03:30:27.736
865	6	USER	LOGIN_SUCCESS	users	6	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 03:35:51.061
866	1	USER	LOGIN_SUCCESS	users	1	null	null	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-14 03:42:26.925
867	1	USER	LOGIN_SUCCESS	users	1	null	null	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-14 03:42:31.843
868	1	USER	LOGIN_SUCCESS	users	1	null	null	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-14 03:45:04.982
869	6	USER	USER_UPDATED	users	167	{"dob": "2005-01-05T00:00:00.000Z", "phone": "0835955799", "status": "ACTIVE", "address": "Phường Từ Liêm", "company": null, "brokerId": null, "fullName": "Trung Thành Nguyễn", "joinDate": null, "position": null, "avatarUrl": null, "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"dob": "2005-01-05T00:00:00.000Z", "email": "nguyentrungthanh05012005@gmail.com", "phone": "0835955799", "status": "ACTIVE", "teamId": 72, "address": "Phường Từ Liêm", "company": "", "brokerId": null, "fullName": "Trung Thành Nguyễn", "joinDate": null, "position": "", "avatarUrl": "", "sortOrder": null, "departmentId": 2, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	\N	\N	2026-07-14 03:47:52.607
870	6	USER	USER_UPDATED	users	155	{"dob": "2005-10-07T00:00:00.000Z", "phone": "0985863045", "status": "ACTIVE", "address": "Quốc Oai, Hà Nội", "company": null, "brokerId": 110, "fullName": "Nguyễn Văn Tuấn", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"dob": "2005-10-07T00:00:00.000Z", "email": "tuanmv7105@gmail.com", "phone": "0985863045", "status": "ACTIVE", "teamId": 44, "address": "Quốc Oai, Hà Nội", "company": "", "brokerId": 110, "fullName": "Nguyễn Văn Tuấn", "joinDate": null, "position": "", "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "departmentId": 2, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	\N	\N	2026-07-14 03:48:36.827
871	6	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	190	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 03:49:52.395
872	1	USER	LOGIN_SUCCESS	users	1	null	null	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-14 03:53:31.187
873	1	USER	LOGIN_SUCCESS	users	1	null	null	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-14 03:53:35.842
874	1	USER	LOGIN_SUCCESS	users	1	null	null	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-14 03:53:50.928
875	1	USER	LOGIN_SUCCESS	users	1	null	null	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-14 03:53:54.055
876	1	USER	LOGIN_SUCCESS	users	1	null	null	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-14 03:54:48.391
877	1	USER	LOGIN_SUCCESS	users	1	null	null	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-14 04:02:55.165
878	1	USER	USER_UPDATED	users	167	{"dob": "2005-01-05T00:00:00.000Z", "phone": "0835955799", "status": "ACTIVE", "address": "Phường Từ Liêm", "company": "", "brokerId": null, "fullName": "Trung Thành Nguyễn", "joinDate": null, "position": "", "avatarUrl": "", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 72, "departmentId": 2}	\N	\N	2026-07-14 04:02:55.643
879	1	USER	USER_UPDATED	users	166	{"dob": "2005-10-09T00:00:00.000Z", "phone": "0977563620", "status": "ACTIVE", "address": "Quận Dương Kinh", "company": null, "brokerId": null, "fullName": "Lê Yến Nhi", "joinDate": null, "position": null, "avatarUrl": null, "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 33, "departmentId": 2}	\N	\N	2026-07-14 04:02:55.691
880	1	USER	USER_UPDATED	users	156	{"dob": "2004-01-13T00:00:00.000Z", "phone": "0886871437", "status": "ACTIVE", "address": "Hồ Chí Minh", "company": null, "brokerId": 110, "fullName": "Đoàn Nguyên Trí", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 74, "departmentId": 2}	\N	\N	2026-07-14 04:02:55.702
881	1	USER	USER_UPDATED	users	155	{"dob": "2005-10-07T00:00:00.000Z", "phone": "0985863045", "status": "ACTIVE", "address": "Quốc Oai, Hà Nội", "company": "", "brokerId": 110, "fullName": "Nguyễn Văn Tuấn", "joinDate": null, "position": "", "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 44, "departmentId": 2}	\N	\N	2026-07-14 04:02:55.715
882	1	USER	USER_UPDATED	users	154	{"dob": "2003-08-30T00:00:00.000Z", "phone": "0915985799", "status": "ACTIVE", "address": "Tân Hạnh, Đông Sơn, TP Thanh Hóa", "company": null, "brokerId": 113, "fullName": "Trần Tuấn Nam", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 73, "departmentId": 2}	\N	\N	2026-07-14 04:02:55.728
883	1	USER	USER_UPDATED	users	153	{"dob": "2005-01-05T00:00:00.000Z", "phone": "0835565799", "status": "ACTIVE", "address": "Phường Mỹ Lâm", "company": null, "brokerId": 113, "fullName": "Trịnh Thành Nguyễn", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 40, "departmentId": 2}	\N	\N	2026-07-14 04:02:55.743
884	1	USER	USER_UPDATED	users	152	{"dob": "1999-06-26T00:00:00.000Z", "phone": "0832888836", "status": "ACTIVE", "address": "Hà Nội", "company": null, "brokerId": 110, "fullName": "Phạm Thị Ngọc Thu", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 71, "departmentId": 2}	\N	\N	2026-07-14 04:02:55.755
885	1	USER	USER_UPDATED	users	151	{"dob": "2004-03-20T00:00:00.000Z", "phone": "0358035448", "status": "ACTIVE", "address": "Hồ Chí Minh", "company": null, "brokerId": 111, "fullName": "Trần Thị Phương Loan", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 38, "departmentId": 2}	\N	\N	2026-07-14 04:02:55.768
886	1	USER	USER_UPDATED	users	150	{"dob": "2004-10-21T00:00:00.000Z", "phone": "0337057530", "status": "ACTIVE", "address": "Hà Nội", "company": null, "brokerId": 111, "fullName": "Lê Hà Trang", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 37, "departmentId": 2}	\N	\N	2026-07-14 04:02:55.783
887	1	USER	USER_UPDATED	users	149	{"dob": "2004-11-26T00:00:00.000Z", "phone": "0704741767", "status": "ACTIVE", "address": "68/6 Lê Văn Linh phường xóm chiếu TP Hồ Chí Minh", "company": null, "brokerId": 116, "fullName": "Nguyễn Trường Giang", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 36, "departmentId": 2}	\N	\N	2026-07-14 04:02:55.798
888	1	USER	USER_UPDATED	users	148	{"dob": "2005-10-14T00:00:00.000Z", "phone": "0368266435", "status": "ACTIVE", "address": "Thôn Trường Xuân, xã Xuân Dương, huyện Thanh Oai, thành phố Hà Nội", "company": null, "brokerId": 111, "fullName": "Nguyễn Thị Liễu", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 35, "departmentId": 2}	\N	\N	2026-07-14 04:02:55.81
889	1	USER	USER_UPDATED	users	147	{"dob": "1997-07-12T00:00:00.000Z", "phone": "0707653497", "status": "ACTIVE", "address": "35 Lê Văn Lương, Thanh Xuân, Hà Nội, Việt Nam", "company": null, "brokerId": 116, "fullName": "Nguyên Minh Dương", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 34, "departmentId": 2}	\N	\N	2026-07-14 04:02:55.82
890	1	USER	USER_UPDATED	users	146	{"dob": "2005-10-09T00:00:00.000Z", "phone": "0977583620", "status": "ACTIVE", "address": "Quận Dương Kinh", "company": null, "brokerId": 111, "fullName": "Lã Yến Nhi", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 33, "departmentId": 2}	\N	\N	2026-07-14 04:02:55.829
891	1	USER	USER_UPDATED	users	145	{"dob": "2003-10-11T00:00:00.000Z", "phone": "0963802731", "status": "ACTIVE", "address": "Ninh Bình", "company": null, "brokerId": 113, "fullName": "Nguyễn Thị Phương Anh", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 10, "departmentId": 2}	\N	\N	2026-07-14 04:02:55.84
892	1	USER	USER_UPDATED	users	144	{"dob": "1999-10-23T00:00:00.000Z", "phone": "0981101355", "status": "ACTIVE", "address": "Hà nội", "company": null, "brokerId": 113, "fullName": "Dang Nhu Ngoc", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 10, "departmentId": 2}	\N	\N	2026-07-14 04:02:55.854
893	1	USER	USER_UPDATED	users	143	{"dob": "2004-08-13T00:00:00.000Z", "phone": "0898413118", "status": "ACTIVE", "address": "Thành Phố Hồ Chí Minh", "company": null, "brokerId": 116, "fullName": "Hồ Phú Thịnh", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 70, "departmentId": 2}	\N	\N	2026-07-14 04:02:55.869
894	1	USER	USER_UPDATED	users	142	{"dob": "2004-02-22T00:00:00.000Z", "phone": "0977735502", "status": "ACTIVE", "address": "Hà Nội", "company": null, "brokerId": 116, "fullName": "Vũ Thành Long", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 69, "departmentId": 2}	\N	\N	2026-07-14 04:02:55.885
895	1	USER	USER_UPDATED	users	141	{"dob": "2004-11-27T00:00:00.000Z", "phone": "0921446885", "status": "ACTIVE", "address": "Hà Nội", "company": null, "brokerId": 111, "fullName": "Nguyễn Thị Thùy Giang", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 68, "departmentId": 2}	\N	\N	2026-07-14 04:02:55.898
896	1	USER	USER_UPDATED	users	140	{"dob": "2004-03-20T00:00:00.000Z", "phone": "0392061651", "status": "ACTIVE", "address": "51/8 Bùi Ngọc Dương, Bạch Mai, Hà Nội", "company": null, "brokerId": 113, "fullName": "Ngô Sơn Tùng", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 75, "departmentId": 2}	\N	\N	2026-07-14 04:02:55.926
897	1	USER	USER_UPDATED	users	139	{"dob": "2004-06-03T00:00:00.000Z", "phone": "0943030604", "status": "ACTIVE", "address": "Hà Nội", "company": null, "brokerId": 113, "fullName": "Nguyễn Mai Thy", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 26, "departmentId": 2}	\N	\N	2026-07-14 04:02:55.938
898	1	USER	USER_UPDATED	users	138	{"dob": "1999-08-12T00:00:00.000Z", "phone": "0979342651", "status": "ACTIVE", "address": "Ngõ 12 Tôn Thất Tùng, Kim Liên, Hà Nội", "company": null, "brokerId": 113, "fullName": "Nguyễn Thị Ngọc", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 66, "departmentId": 2}	\N	\N	2026-07-14 04:02:55.951
899	1	USER	USER_UPDATED	users	137	{"dob": "2003-11-28T00:00:00.000Z", "phone": "0971120304", "status": "ACTIVE", "address": "No. 18, adjacent row 20C, Van Phu urban area", "company": null, "brokerId": 116, "fullName": "Nguyễn Lê Phương Mai", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 65, "departmentId": 2}	\N	\N	2026-07-14 04:02:55.964
900	1	USER	USER_UPDATED	users	136	{"dob": "2004-06-01T00:00:00.000Z", "phone": "0347268359", "status": "ACTIVE", "address": "157 Chùa Láng, Đống Đa, Hà Nội", "company": null, "brokerId": 113, "fullName": "Đoàn Phương Hạnh", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 64, "departmentId": 2}	\N	\N	2026-07-14 04:02:55.974
901	1	USER	USER_UPDATED	users	135	{"dob": "1993-09-07T00:00:00.000Z", "phone": "0972227823", "status": "ACTIVE", "address": "Tầng 18 tòa VTC Online, 18 Tam Trinh, Hà Nội, Việt Nam.", "company": null, "brokerId": 112, "fullName": "Hoài Thu Nguyễn", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 5, "departmentId": 2}	\N	\N	2026-07-14 04:02:55.986
902	1	USER	USER_UPDATED	users	134	{"dob": "2000-09-12T00:00:00.000Z", "phone": "0369879176", "status": "ACTIVE", "address": "Tòa S3 Vinhomes Skylake Phạm Hùng, Nam Từ Liêm", "company": null, "brokerId": 113, "fullName": "Nguyễn Thành Phúc", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 4, "departmentId": 2}	\N	\N	2026-07-14 04:02:55.998
903	1	USER	USER_UPDATED	users	133	{"dob": "2003-10-13T00:00:00.000Z", "phone": "0869391861", "status": "ACTIVE", "address": "Hà Nội", "company": null, "brokerId": 110, "fullName": "Trần Quốc Việt", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 9, "departmentId": 2}	\N	\N	2026-07-14 04:02:56.012
904	1	USER	USER_UPDATED	users	132	{"dob": "2004-11-28T00:00:00.000Z", "phone": "0336646836", "status": "ACTIVE", "address": "Hà Nội", "company": null, "brokerId": 110, "fullName": "nguyễn bách đạt", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 22, "departmentId": 2}	\N	\N	2026-07-14 04:02:56.024
905	1	USER	USER_UPDATED	users	131	{"dob": "2003-02-28T00:00:00.000Z", "phone": "0845205955", "status": "ACTIVE", "address": "Hà Nội", "company": null, "brokerId": 116, "fullName": "Phan Nữ Đan Nhi", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 21, "departmentId": 2}	\N	\N	2026-07-14 04:02:56.035
906	1	USER	USER_UPDATED	users	130	{"dob": "1995-02-07T00:00:00.000Z", "phone": "0357731889", "status": "ACTIVE", "address": "Hà Nội", "company": null, "brokerId": 110, "fullName": "Nguyễn Đình Hải", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 8, "departmentId": 2}	\N	\N	2026-07-14 04:02:56.049
907	1	USER	USER_UPDATED	users	129	{"dob": "2003-06-29T00:00:00.000Z", "phone": "0356479959", "status": "ACTIVE", "address": "Hồ Chí Minh", "company": null, "brokerId": 116, "fullName": "Nguyễn Thuận Khang", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 63, "departmentId": 2}	\N	\N	2026-07-14 04:02:56.063
908	1	USER	USER_UPDATED	users	128	{"dob": "2002-10-09T00:00:00.000Z", "phone": "0869870233", "status": "ACTIVE", "address": "Hà Nội", "company": null, "brokerId": 116, "fullName": "Lê Đình Đức", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 19, "departmentId": 2}	\N	\N	2026-07-14 04:02:56.075
909	1	USER	USER_UPDATED	users	127	{"dob": "2004-09-26T00:00:00.000Z", "phone": "0325414140", "status": "ACTIVE", "address": "Hà Nội", "company": null, "brokerId": 113, "fullName": "Vũ Hoàng Duy", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 62, "departmentId": 2}	\N	\N	2026-07-14 04:02:56.087
910	1	USER	USER_UPDATED	users	126	{"dob": "2005-09-27T00:00:00.000Z", "phone": "0796090848", "status": "ACTIVE", "address": "Hà Nội", "company": null, "brokerId": 113, "fullName": "Hoàng Thị Dịu", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 61, "departmentId": 2}	\N	\N	2026-07-14 04:02:56.099
911	1	USER	USER_UPDATED	users	125	{"dob": "2002-09-17T00:00:00.000Z", "phone": "0965990173", "status": "ACTIVE", "address": "Hà Nội", "company": null, "brokerId": 110, "fullName": "Nguyễn Duy An", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 60, "departmentId": 2}	\N	\N	2026-07-14 04:02:56.115
912	1	USER	USER_UPDATED	users	124	{"dob": "2002-10-16T00:00:00.000Z", "phone": "0362928667", "status": "ACTIVE", "address": "Thanh Hóa", "company": null, "brokerId": 110, "fullName": "Nguyễn Như Quỳnh", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 59, "departmentId": 2}	\N	\N	2026-07-14 04:02:56.132
913	1	USER	USER_UPDATED	users	123	{"dob": "1991-11-14T00:00:00.000Z", "phone": "0934650459", "status": "ACTIVE", "address": "Hà Nội", "company": null, "brokerId": 110, "fullName": "Nguyễn Minh Hạnh", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 14, "departmentId": 3}	\N	\N	2026-07-14 04:02:56.145
914	1	USER	USER_UPDATED	users	122	{"dob": "1999-01-10T00:00:00.000Z", "phone": "0971764531", "status": "ACTIVE", "address": "Hà Nội", "company": null, "brokerId": 113, "fullName": "Trần Khánh Linh", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 6, "departmentId": 2}	\N	\N	2026-07-14 04:02:56.16
915	1	USER	USER_UPDATED	users	121	{"dob": "2003-10-06T00:00:00.000Z", "phone": "0396727519", "status": "ACTIVE", "address": "Hà Đông - Hà Nội", "company": null, "brokerId": 110, "fullName": "Đào Thị Ngọc Anh", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 58, "departmentId": 2}	\N	\N	2026-07-14 04:02:56.177
916	1	USER	USER_UPDATED	users	120	{"dob": "2004-06-25T00:00:00.000Z", "phone": "0983582655", "status": "ACTIVE", "address": "Tx. Hoàng Mai", "company": null, "brokerId": 110, "fullName": "Trần Thị Thanh Thảo", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 12, "departmentId": 2}	\N	\N	2026-07-14 04:02:56.191
917	1	USER	USER_UPDATED	users	110	{"dob": "2024-03-17T00:00:00.000Z", "phone": "0386358007", "status": "ACTIVE", "address": "Hà Nội", "company": null, "brokerId": 110, "fullName": "FinTop_Admin", "joinDate": null, "position": null, "avatarUrl": "../../assets/images/LogoFinTop_notbg.jpg", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 3, "departmentId": 1}	\N	\N	2026-07-14 04:02:56.202
918	1	USER	USER_UPDATED	users	105	{"dob": "2001-09-21T00:00:00.000Z", "phone": "0386358006", "status": "ACTIVE", "address": "Hà Nội", "company": null, "brokerId": 110, "fullName": "Nguyễn Công Luật", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 11, "departmentId": 1}	\N	\N	2026-07-14 04:02:56.213
919	1	USER	USER_UPDATED	users	6	{"dob": "2005-10-07T00:00:00.000Z", "phone": "0865863045", "status": "ACTIVE", "address": "Quốc Oai, Hà Nội", "company": null, "brokerId": null, "fullName": "Nguyễn Văn Tuấn", "joinDate": null, "position": null, "avatarUrl": null, "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 6, "departmentId": 2}	\N	\N	2026-07-14 04:02:56.229
920	1	USER	LOGIN_SUCCESS	users	1	null	null	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-14 04:03:06.946
921	1	USER	LOGIN_SUCCESS	users	1	null	null	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-14 04:04:41.493
922	1	USER	USER_UPDATED	users	167	{"dob": "2005-01-05T00:00:00.000Z", "phone": "0835955799", "status": "ACTIVE", "address": "Phường Từ Liêm", "company": "", "brokerId": null, "fullName": "Trung Thành Nguyễn", "joinDate": null, "position": "", "avatarUrl": "", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 72, "staffCode": "BW4O", "departmentId": 2}	\N	\N	2026-07-14 04:04:41.751
923	1	USER	USER_UPDATED	users	166	{"dob": "2005-10-09T00:00:00.000Z", "phone": "0977563620", "status": "ACTIVE", "address": "Quận Dương Kinh", "company": null, "brokerId": null, "fullName": "Lê Yến Nhi", "joinDate": null, "position": null, "avatarUrl": null, "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 33, "staffCode": "BT4O", "departmentId": 2}	\N	\N	2026-07-14 04:04:41.766
924	1	USER	USER_UPDATED	users	156	{"dob": "2004-01-13T00:00:00.000Z", "phone": "0886871437", "status": "ACTIVE", "address": "Hồ Chí Minh", "company": null, "brokerId": 110, "fullName": "Đoàn Nguyên Trí", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 74, "staffCode": "BWF6", "departmentId": 2}	\N	\N	2026-07-14 04:04:41.776
925	1	USER	USER_UPDATED	users	155	{"dob": "2005-10-07T00:00:00.000Z", "phone": "0985863045", "status": "ACTIVE", "address": "Quốc Oai, Hà Nội", "company": "", "brokerId": 110, "fullName": "Nguyễn Văn Tuấn", "joinDate": null, "position": "", "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 44, "staffCode": "BW9B", "departmentId": 2}	\N	\N	2026-07-14 04:04:41.785
926	1	USER	USER_UPDATED	users	154	{"dob": "2003-08-30T00:00:00.000Z", "phone": "0915985799", "status": "ACTIVE", "address": "Tân Hạnh, Đông Sơn, TP Thanh Hóa", "company": null, "brokerId": 113, "fullName": "Trần Tuấn Nam", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 73, "staffCode": "F101", "departmentId": 2}	\N	\N	2026-07-14 04:04:41.795
927	1	USER	USER_UPDATED	users	153	{"dob": "2005-01-05T00:00:00.000Z", "phone": "0835565799", "status": "ACTIVE", "address": "Phường Mỹ Lâm", "company": null, "brokerId": 113, "fullName": "Trịnh Thành Nguyễn", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 40, "staffCode": "BW4D", "departmentId": 2}	\N	\N	2026-07-14 04:04:41.804
928	1	USER	USER_UPDATED	users	152	{"dob": "1999-06-26T00:00:00.000Z", "phone": "0832888836", "status": "ACTIVE", "address": "Hà Nội", "company": null, "brokerId": 110, "fullName": "Phạm Thị Ngọc Thu", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 71, "staffCode": "5777", "departmentId": 2}	\N	\N	2026-07-14 04:04:41.815
929	1	USER	USER_UPDATED	users	151	{"dob": "2004-03-20T00:00:00.000Z", "phone": "0358035448", "status": "ACTIVE", "address": "Hồ Chí Minh", "company": null, "brokerId": 111, "fullName": "Trần Thị Phương Loan", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 38, "staffCode": "BTRW", "departmentId": 2}	\N	\N	2026-07-14 04:04:41.824
930	1	USER	USER_UPDATED	users	150	{"dob": "2004-10-21T00:00:00.000Z", "phone": "0337057530", "status": "ACTIVE", "address": "Hà Nội", "company": null, "brokerId": 111, "fullName": "Lê Hà Trang", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 37, "staffCode": "BSZD", "departmentId": 2}	\N	\N	2026-07-14 04:04:41.832
931	1	USER	USER_UPDATED	users	149	{"dob": "2004-11-26T00:00:00.000Z", "phone": "0704741767", "status": "ACTIVE", "address": "68/6 Lê Văn Linh phường xóm chiếu TP Hồ Chí Minh", "company": null, "brokerId": 116, "fullName": "Nguyễn Trường Giang", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 36, "staffCode": "BTK7", "departmentId": 2}	\N	\N	2026-07-14 04:04:41.84
932	1	USER	USER_UPDATED	users	148	{"dob": "2005-10-14T00:00:00.000Z", "phone": "0368266435", "status": "ACTIVE", "address": "Thôn Trường Xuân, xã Xuân Dương, huyện Thanh Oai, thành phố Hà Nội", "company": null, "brokerId": 111, "fullName": "Nguyễn Thị Liễu", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 35, "staffCode": "BTRN", "departmentId": 2}	\N	\N	2026-07-14 04:04:41.849
933	1	USER	USER_UPDATED	users	147	{"dob": "1997-07-12T00:00:00.000Z", "phone": "0707653497", "status": "ACTIVE", "address": "35 Lê Văn Lương, Thanh Xuân, Hà Nội, Việt Nam", "company": null, "brokerId": 116, "fullName": "Nguyên Minh Dương", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 34, "staffCode": "BTLT", "departmentId": 2}	\N	\N	2026-07-14 04:04:41.859
934	1	USER	USER_UPDATED	users	146	{"dob": "2005-10-09T00:00:00.000Z", "phone": "0977583620", "status": "ACTIVE", "address": "Quận Dương Kinh", "company": null, "brokerId": 111, "fullName": "Lã Yến Nhi", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 33, "staffCode": "BT4O", "departmentId": 2}	\N	\N	2026-07-14 04:04:41.869
935	1	USER	USER_UPDATED	users	145	{"dob": "2003-10-11T00:00:00.000Z", "phone": "0963802731", "status": "ACTIVE", "address": "Ninh Bình", "company": null, "brokerId": 113, "fullName": "Nguyễn Thị Phương Anh", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 10, "staffCode": "BSVA", "departmentId": 2}	\N	\N	2026-07-14 04:04:41.878
936	1	USER	USER_UPDATED	users	144	{"dob": "1999-10-23T00:00:00.000Z", "phone": "0981101355", "status": "ACTIVE", "address": "Hà nội", "company": null, "brokerId": 113, "fullName": "Dang Nhu Ngoc", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 10, "staffCode": "BSVA", "departmentId": 2}	\N	\N	2026-07-14 04:04:41.889
937	1	USER	USER_UPDATED	users	143	{"dob": "2004-08-13T00:00:00.000Z", "phone": "0898413118", "status": "ACTIVE", "address": "Thành Phố Hồ Chí Minh", "company": null, "brokerId": 116, "fullName": "Hồ Phú Thịnh", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 70, "staffCode": "BTJJ", "departmentId": 2}	\N	\N	2026-07-14 04:04:41.905
938	1	USER	USER_UPDATED	users	142	{"dob": "2004-02-22T00:00:00.000Z", "phone": "0977735502", "status": "ACTIVE", "address": "Hà Nội", "company": null, "brokerId": 116, "fullName": "Vũ Thành Long", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 69, "staffCode": "BSPB", "departmentId": 2}	\N	\N	2026-07-14 04:04:41.915
939	1	USER	USER_UPDATED	users	141	{"dob": "2004-11-27T00:00:00.000Z", "phone": "0921446885", "status": "ACTIVE", "address": "Hà Nội", "company": null, "brokerId": 111, "fullName": "Nguyễn Thị Thùy Giang", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 68, "staffCode": "BN32", "departmentId": 2}	\N	\N	2026-07-14 04:04:41.924
940	1	USER	USER_UPDATED	users	140	{"dob": "2004-03-20T00:00:00.000Z", "phone": "0392061651", "status": "ACTIVE", "address": "51/8 Bùi Ngọc Dương, Bạch Mai, Hà Nội", "company": null, "brokerId": 113, "fullName": "Ngô Sơn Tùng", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 75, "staffCode": "S? di?n tho?i", "departmentId": 2}	\N	\N	2026-07-14 04:04:41.933
941	1	USER	USER_UPDATED	users	139	{"dob": "2004-06-03T00:00:00.000Z", "phone": "0943030604", "status": "ACTIVE", "address": "Hà Nội", "company": null, "brokerId": 113, "fullName": "Nguyễn Mai Thy", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 26, "staffCode": "BSQW", "departmentId": 2}	\N	\N	2026-07-14 04:04:41.943
942	1	USER	USER_UPDATED	users	138	{"dob": "1999-08-12T00:00:00.000Z", "phone": "0979342651", "status": "ACTIVE", "address": "Ngõ 12 Tôn Thất Tùng, Kim Liên, Hà Nội", "company": null, "brokerId": 113, "fullName": "Nguyễn Thị Ngọc", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 66, "staffCode": "BRN4", "departmentId": 2}	\N	\N	2026-07-14 04:04:41.952
943	1	USER	USER_UPDATED	users	137	{"dob": "2003-11-28T00:00:00.000Z", "phone": "0971120304", "status": "ACTIVE", "address": "No. 18, adjacent row 20C, Van Phu urban area", "company": null, "brokerId": 116, "fullName": "Nguyễn Lê Phương Mai", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 65, "staffCode": "BSPD", "departmentId": 2}	\N	\N	2026-07-14 04:04:41.961
944	1	USER	USER_UPDATED	users	136	{"dob": "2004-06-01T00:00:00.000Z", "phone": "0347268359", "status": "ACTIVE", "address": "157 Chùa Láng, Đống Đa, Hà Nội", "company": null, "brokerId": 113, "fullName": "Đoàn Phương Hạnh", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 64, "staffCode": "BRRU", "departmentId": 2}	\N	\N	2026-07-14 04:04:41.97
945	1	USER	USER_UPDATED	users	135	{"dob": "1993-09-07T00:00:00.000Z", "phone": "0972227823", "status": "ACTIVE", "address": "Tầng 18 tòa VTC Online, 18 Tam Trinh, Hà Nội, Việt Nam.", "company": null, "brokerId": 112, "fullName": "Hoài Thu Nguyễn", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 5, "staffCode": "5016", "departmentId": 2}	\N	\N	2026-07-14 04:04:41.978
946	1	USER	USER_UPDATED	users	134	{"dob": "2000-09-12T00:00:00.000Z", "phone": "0369879176", "status": "ACTIVE", "address": "Tòa S3 Vinhomes Skylake Phạm Hùng, Nam Từ Liêm", "company": null, "brokerId": 113, "fullName": "Nguyễn Thành Phúc", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 4, "staffCode": "BF14", "departmentId": 2}	\N	\N	2026-07-14 04:04:41.986
947	1	USER	USER_UPDATED	users	133	{"dob": "2003-10-13T00:00:00.000Z", "phone": "0869391861", "status": "ACTIVE", "address": "Hà Nội", "company": null, "brokerId": 110, "fullName": "Trần Quốc Việt", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 9, "staffCode": "BPJ4", "departmentId": 2}	\N	\N	2026-07-14 04:04:41.995
948	1	USER	USER_UPDATED	users	132	{"dob": "2004-11-28T00:00:00.000Z", "phone": "0336646836", "status": "ACTIVE", "address": "Hà Nội", "company": null, "brokerId": 110, "fullName": "nguyễn bách đạt", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 22, "staffCode": "F003", "departmentId": 2}	\N	\N	2026-07-14 04:04:42.003
949	1	USER	USER_UPDATED	users	131	{"dob": "2003-02-28T00:00:00.000Z", "phone": "0845205955", "status": "ACTIVE", "address": "Hà Nội", "company": null, "brokerId": 116, "fullName": "Phan Nữ Đan Nhi", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 21, "staffCode": "BNSZ", "departmentId": 2}	\N	\N	2026-07-14 04:04:42.011
950	1	USER	USER_UPDATED	users	130	{"dob": "1995-02-07T00:00:00.000Z", "phone": "0357731889", "status": "ACTIVE", "address": "Hà Nội", "company": null, "brokerId": 110, "fullName": "Nguyễn Đình Hải", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 8, "staffCode": "6061", "departmentId": 2}	\N	\N	2026-07-14 04:04:42.02
951	1	USER	USER_UPDATED	users	129	{"dob": "2003-06-29T00:00:00.000Z", "phone": "0356479959", "status": "ACTIVE", "address": "Hồ Chí Minh", "company": null, "brokerId": 116, "fullName": "Nguyễn Thuận Khang", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 63, "staffCode": "BJ2S", "departmentId": 2}	\N	\N	2026-07-14 04:04:42.027
952	1	USER	USER_UPDATED	users	128	{"dob": "2002-10-09T00:00:00.000Z", "phone": "0869870233", "status": "ACTIVE", "address": "Hà Nội", "company": null, "brokerId": 116, "fullName": "Lê Đình Đức", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 19, "staffCode": "BJYE", "departmentId": 2}	\N	\N	2026-07-14 04:04:42.058
953	1	USER	USER_UPDATED	users	127	{"dob": "2004-09-26T00:00:00.000Z", "phone": "0325414140", "status": "ACTIVE", "address": "Hà Nội", "company": null, "brokerId": 113, "fullName": "Vũ Hoàng Duy", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 62, "staffCode": "BLHG", "departmentId": 2}	\N	\N	2026-07-14 04:04:42.066
954	1	USER	USER_UPDATED	users	126	{"dob": "2005-09-27T00:00:00.000Z", "phone": "0796090848", "status": "ACTIVE", "address": "Hà Nội", "company": null, "brokerId": 113, "fullName": "Hoàng Thị Dịu", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 61, "staffCode": "BM35", "departmentId": 2}	\N	\N	2026-07-14 04:04:42.075
955	1	USER	USER_UPDATED	users	125	{"dob": "2002-09-17T00:00:00.000Z", "phone": "0965990173", "status": "ACTIVE", "address": "Hà Nội", "company": null, "brokerId": 110, "fullName": "Nguyễn Duy An", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 60, "staffCode": "BEW5", "departmentId": 2}	\N	\N	2026-07-14 04:04:42.083
956	1	USER	USER_UPDATED	users	124	{"dob": "2002-10-16T00:00:00.000Z", "phone": "0362928667", "status": "ACTIVE", "address": "Thanh Hóa", "company": null, "brokerId": 110, "fullName": "Nguyễn Như Quỳnh", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 59, "staffCode": "BJFS", "departmentId": 2}	\N	\N	2026-07-14 04:04:42.092
957	1	USER	USER_UPDATED	users	123	{"dob": "1991-11-14T00:00:00.000Z", "phone": "0934650459", "status": "ACTIVE", "address": "Hà Nội", "company": null, "brokerId": 110, "fullName": "Nguyễn Minh Hạnh", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 14, "staffCode": "5654", "departmentId": 3}	\N	\N	2026-07-14 04:04:42.101
958	1	USER	USER_UPDATED	users	122	{"dob": "1999-01-10T00:00:00.000Z", "phone": "0971764531", "status": "ACTIVE", "address": "Hà Nội", "company": null, "brokerId": 113, "fullName": "Trần Khánh Linh", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 6, "staffCode": "8043", "departmentId": 2}	\N	\N	2026-07-14 04:04:42.109
959	1	USER	USER_UPDATED	users	121	{"dob": "2003-10-06T00:00:00.000Z", "phone": "0396727519", "status": "ACTIVE", "address": "Hà Đông - Hà Nội", "company": null, "brokerId": 110, "fullName": "Đào Thị Ngọc Anh", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 58, "staffCode": "F861", "departmentId": 2}	\N	\N	2026-07-14 04:04:42.118
960	1	USER	USER_UPDATED	users	120	{"dob": "2004-06-25T00:00:00.000Z", "phone": "0983582655", "status": "ACTIVE", "address": "Tx. Hoàng Mai", "company": null, "brokerId": 110, "fullName": "Trần Thị Thanh Thảo", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 12, "staffCode": "BOCR", "departmentId": 2}	\N	\N	2026-07-14 04:04:42.126
961	1	USER	USER_UPDATED	users	110	{"dob": "2024-03-17T00:00:00.000Z", "phone": "0386358007", "status": "ACTIVE", "address": "Hà Nội", "company": null, "brokerId": 110, "fullName": "FinTop_Admin", "joinDate": null, "position": null, "avatarUrl": "../../assets/images/LogoFinTop_notbg.jpg", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 3, "staffCode": "BOJE", "departmentId": 1}	\N	\N	2026-07-14 04:04:42.134
962	1	USER	USER_UPDATED	users	105	{"dob": "2001-09-21T00:00:00.000Z", "phone": "0386358006", "status": "ACTIVE", "address": "Hà Nội", "company": null, "brokerId": 110, "fullName": "Nguyễn Công Luật", "joinDate": null, "position": null, "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 11, "staffCode": "F000", "departmentId": 1}	\N	\N	2026-07-14 04:04:42.143
963	1	USER	USER_UPDATED	users	6	{"dob": "2005-10-07T00:00:00.000Z", "phone": "0865863045", "status": "ACTIVE", "address": "Quốc Oai, Hà Nội", "company": null, "brokerId": null, "fullName": "Nguyễn Văn Tuấn", "joinDate": null, "position": null, "avatarUrl": null, "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 6, "staffCode": "8043", "departmentId": 2}	\N	\N	2026-07-14 04:04:42.155
964	1	USER	LOGIN_SUCCESS	users	1	null	null	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-14 04:04:54.216
965	1	USER	USER_UPDATED	users	6	{"dob": "2005-10-07T00:00:00.000Z", "phone": "0865863045", "status": "ACTIVE", "address": "Quốc Oai, Hà Nội", "company": null, "brokerId": null, "fullName": "Nguyễn Văn Tuấn", "joinDate": null, "position": null, "avatarUrl": null, "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 76, "staffCode": "TEST123", "departmentId": 2}	\N	\N	2026-07-14 04:04:54.243
966	1	USER	USER_UPDATED	users	6	{"dob": "2005-10-07T00:00:00.000Z", "phone": "0865863045", "status": "ACTIVE", "address": "Quốc Oai, Hà Nội", "company": null, "brokerId": null, "fullName": "Nguyễn Văn Tuấn", "joinDate": null, "position": null, "avatarUrl": null, "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 6, "staffCode": "8043", "departmentId": 2}	\N	\N	2026-07-14 04:04:54.277
967	6	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	190	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 04:05:32.844
968	6	USER	LOGIN_SUCCESS	users	6	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 04:05:36.776
969	6	USER	USER_UPDATED	users	155	{"dob": "2005-10-07T00:00:00.000Z", "phone": "0985863045", "status": "ACTIVE", "address": "Quốc Oai, Hà Nội", "company": "", "brokerId": 110, "fullName": "Nguyễn Văn Tuấn", "joinDate": null, "position": "", "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"dob": "2005-10-07T00:00:00.000Z", "email": "tuanmv7105@gmail.com", "phone": "0985863045", "status": "ACTIVE", "teamId": 44, "address": "Quốc Oai, Hà Nội", "company": "", "brokerId": 110, "fullName": "Nguyễn Văn Tuấn", "joinDate": null, "position": "", "avatarUrl": "/file-image/avatar/avatar_default.png", "sortOrder": null, "staffCode": "BW9B", "departmentId": 2, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	\N	\N	2026-07-14 04:05:55.449
970	1	USER	LOGIN_SUCCESS	users	1	null	null	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-14 04:11:35.668
971	1	USER	USER_UPDATED	users	6	{"dob": "2005-10-07T00:00:00.000Z", "phone": "0865863045", "status": "ACTIVE", "address": "Quốc Oai, Hà Nội", "company": null, "brokerId": null, "fullName": "Nguyễn Văn Tuấn", "joinDate": null, "position": null, "avatarUrl": null, "sortOrder": null, "stockAccount": null, "stockCompany": null, "investmentStyle": null, "investmentDuration": null}	{"teamId": 44, "staffCode": "BW9B", "departmentId": 2}	\N	\N	2026-07-14 04:11:35.811
972	1	USER	LOGIN_SUCCESS	users	1	null	null	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-14 04:20:44.105
973	1	USER	LOGIN_SUCCESS	users	1	null	null	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-14 04:20:49.797
974	1	USER	LOGIN_SUCCESS	users	1	null	null	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-14 04:22:42.323
975	1	USER	LOGIN_SUCCESS	users	1	null	null	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-14 04:29:49.403
976	1	USER	LOGIN_SUCCESS	users	1	null	null	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-14 04:30:06.94
977	6	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	203	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 05:08:11.93
978	6	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	203	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 05:08:13.118
979	6	USER	LOGIN_SUCCESS	users	6	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 05:08:20.24
980	1	USER	LOGIN_SUCCESS	users	1	null	null	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-14 05:15:15.787
981	6	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	210	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 05:22:23.106
982	164	USER	LOGIN_SUCCESS	users	164	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 05:27:55.528
983	164	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	212	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 05:42:00.236
984	164	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	212	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 06:26:33.431
985	6	USER	LOGIN_SUCCESS	users	6	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 06:52:58.489
986	6	USER	PLAN_UPDATED	subscription_plans	16	{"name": "PRO1", "price": 2500000, "status": "ACTIVE", "currency": "VND", "features": "Bộ lọc cổ phiếu chuyên nghiệp;Pro Research;Pro Data", "tierLevel": "SILVER", "description": "Gói PRO 3 tháng - Bộ lọc chuyên nghiệp, PRO Data & Research", "durationDays": 90}	{"name": "PRO1", "price": 1500000, "status": "ACTIVE", "currency": "VND", "features": "Bộ lọc cổ phiếu chuyên nghiệp;Pro Research;Pro Data", "tierLevel": "SILVER", "description": "Gói PRO 3 tháng - Bộ lọc chuyên nghiệp, PRO Data & Research", "durationDays": 90}	\N	\N	2026-07-14 06:53:23.153
987	6	USER	PLAN_UPDATED	subscription_plans	17	{"name": "PRO2", "price": 4500000, "status": "ACTIVE", "currency": "VND", "features": "Bộ lọc cổ phiếu chuyên nghiệp;Pro Research;Pro Data", "tierLevel": "SILVER", "description": "Gói PRO 6 tháng - Bộ lọc chuyên nghiệp, PRO Data & Research", "durationDays": 180}	{"name": "PRO2", "price": 2500000, "status": "ACTIVE", "currency": "VND", "features": "Bộ lọc cổ phiếu chuyên nghiệp;Pro Research;Pro Data", "tierLevel": "SILVER", "description": "Gói PRO 6 tháng - Bộ lọc chuyên nghiệp, PRO Data & Research", "durationDays": 180}	\N	\N	2026-07-14 06:53:47.313
988	6	USER	PLAN_UPDATED	subscription_plans	18	{"name": "PRO3", "price": 8000000, "status": "ACTIVE", "currency": "VND", "features": "Bộ lọc cổ phiếu chuyên nghiệp;Pro Research;Pro Data", "tierLevel": "SILVER", "description": "Gói PRO 12 tháng - Bộ lọc chuyên nghiệp, PRO Data & Research", "durationDays": 365}	{"name": "PRO3", "price": 4500000, "status": "ACTIVE", "currency": "VND", "features": "Bộ lọc cổ phiếu chuyên nghiệp;Pro Research;Pro Data", "tierLevel": "SILVER", "description": "Gói PRO 12 tháng - Bộ lọc chuyên nghiệp, PRO Data & Research", "durationDays": 365}	\N	\N	2026-07-14 06:54:07.699
989	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 06:54:26.13
990	1	USER	PLAN_UPDATED	subscription_plans	17	{"name": "PRO2", "price": 2500000, "status": "ACTIVE", "currency": "VND", "features": "Bộ lọc cổ phiếu chuyên nghiệp;Pro Research;Pro Data", "tierLevel": "SILVER", "description": "Gói PRO 6 tháng - Bộ lọc chuyên nghiệp, PRO Data & Research", "durationDays": 180}	{"name": "PRO2", "price": 45500000, "status": "ACTIVE", "currency": "VND", "features": "Bộ lọc cổ phiếu chuyên nghiệp;Pro Research;Pro Data", "tierLevel": "SILVER", "description": "Gói PRO 6 tháng - Bộ lọc chuyên nghiệp, PRO Data & Research", "durationDays": 180}	\N	\N	2026-07-14 06:54:41.608
991	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	214	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 07:13:43.092
992	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 07:22:49.428
993	1	USER	PLAN_UPDATED	subscription_plans	17	{"name": "PRO2", "price": 45500000, "status": "ACTIVE", "currency": "VND", "features": "Bộ lọc cổ phiếu chuyên nghiệp;Pro Research;Pro Data", "tierLevel": "SILVER", "description": "Gói PRO 6 tháng - Bộ lọc chuyên nghiệp, PRO Data & Research", "durationDays": 180}	{"name": "PRO2", "price": 2500000, "status": "ACTIVE", "currency": "VND", "features": "Bộ lọc cổ phiếu chuyên nghiệp;Pro Research;Pro Data", "tierLevel": "SILVER", "description": "Gói PRO 6 tháng - Bộ lọc chuyên nghiệp, PRO Data & Research", "durationDays": 180}	\N	\N	2026-07-14 07:23:11.813
994	1	USER	PLAN_UPDATED	subscription_plans	18	{"name": "PRO3", "price": 4500000, "status": "ACTIVE", "currency": "VND", "features": "Bộ lọc cổ phiếu chuyên nghiệp;Pro Research;Pro Data", "tierLevel": "SILVER", "description": "Gói PRO 12 tháng - Bộ lọc chuyên nghiệp, PRO Data & Research", "durationDays": 365}	{"name": "PRO3", "price": 4500000, "status": "ACTIVE", "currency": "VND", "features": "Bộ lọc cổ phiếu chuyên nghiệp;Pro Research;Pro Data", "tierLevel": "SILVER", "description": "Gói PRO 12 tháng - Bộ lọc chuyên nghiệp, PRO Data & Research", "durationDays": 365}	\N	\N	2026-07-14 07:23:31.97
995	164	USER	LOGIN_SUCCESS	users	164	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 07:24:19.709
996	164	USER	LOGIN_SUCCESS	users	164	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 07:24:37.607
997	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 07:27:49.702
998	164	USER	LOGIN_SUCCESS	users	164	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 07:29:27.895
999	1	USER	LOGIN_SUCCESS	users	1	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 07:29:53.07
1000	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	220	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 09:13:00.73
1001	1	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	220	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 09:13:01.594
1002	6	USER	LOGIN_SUCCESS	users	6	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 09:14:43.377
1003	6	USER	PLAN_UPDATED	subscription_plans	3	{"name": "V.I.P", "price": 5000000, "status": "ACTIVE", "currency": "VND", "features": "Đặc quyền PRO;Kết nối Chuyên gia;Phân tích Chuyên gia", "tierLevel": "GOLD", "description": "Gói V.I.P - Full PRO + Copy Trade Chuyên gia + Kết nối Chuyên gia", "durationDays": 180}	{"name": "V.I.P", "price": 50000000, "status": "ACTIVE", "currency": "VND", "features": "Đặc quyền PRO;Kết nối Chuyên gia;Phân tích Chuyên gia", "tierLevel": "GOLD", "description": "Gói V.I.P - Full PRO + Copy Trade Chuyên gia + Kết nối Chuyên gia", "durationDays": 181}	\N	\N	2026-07-14 09:15:04.002
1004	6	USER	PLAN_UPDATED	subscription_plans	4	{"name": "Diamond", "price": 15000000, "status": "ACTIVE", "currency": "VND", "features": "Đặc quyền V.I.P;Đặc quyền PRO;Cố vấn 1-1 Chuyên gia", "tierLevel": "DIAMOND", "description": "Gói Diamond - Full V.I.P + Cố vấn 1-1 Chuyên gia", "durationDays": 365}	{"name": "Diamond", "price": 500000000, "status": "ACTIVE", "currency": "VND", "features": "Đặc quyền V.I.P;Đặc quyền PRO;Cố vấn 1-1 Chuyên gia", "tierLevel": "DIAMOND", "description": "Gói Diamond - Full V.I.P + Cố vấn 1-1 Chuyên gia", "durationDays": 366}	\N	\N	2026-07-14 09:15:10.238
1005	6	USER	PLAN_UPDATED	subscription_plans	3	{"name": "V.I.P", "price": 50000000, "status": "ACTIVE", "currency": "VND", "features": "Đặc quyền PRO;Kết nối Chuyên gia;Phân tích Chuyên gia", "tierLevel": "GOLD", "description": "Gói V.I.P - Full PRO + Copy Trade Chuyên gia + Kết nối Chuyên gia", "durationDays": 181}	{"name": "V.I.P", "price": 5000000, "status": "ACTIVE", "currency": "VND", "features": "Đặc quyền PRO;Kết nối Chuyên gia;Phân tích Chuyên gia", "tierLevel": "GOLD", "description": "Gói V.I.P - Full PRO + Copy Trade Chuyên gia + Kết nối Chuyên gia", "durationDays": 180}	\N	\N	2026-07-14 09:15:18.972
1006	6	USER	PLAN_UPDATED	subscription_plans	4	{"name": "Diamond", "price": 500000000, "status": "ACTIVE", "currency": "VND", "features": "Đặc quyền V.I.P;Đặc quyền PRO;Cố vấn 1-1 Chuyên gia", "tierLevel": "DIAMOND", "description": "Gói Diamond - Full V.I.P + Cố vấn 1-1 Chuyên gia", "durationDays": 366}	{"name": "Diamond", "price": 50000000, "status": "ACTIVE", "currency": "VND", "features": "Đặc quyền V.I.P;Đặc quyền PRO;Cố vấn 1-1 Chuyên gia", "tierLevel": "DIAMOND", "description": "Gói Diamond - Full V.I.P + Cố vấn 1-1 Chuyên gia", "durationDays": 365}	\N	\N	2026-07-14 09:15:25.285
1007	6	USER	PLAN_UPDATED	subscription_plans	4	{"name": "Diamond", "price": 50000000, "status": "ACTIVE", "currency": "VND", "features": "Đặc quyền V.I.P;Đặc quyền PRO;Cố vấn 1-1 Chuyên gia", "tierLevel": "DIAMOND", "description": "Gói Diamond - Full V.I.P + Cố vấn 1-1 Chuyên gia", "durationDays": 365}	{"name": "Diamond", "price": 5000000, "status": "ACTIVE", "currency": "VND", "features": "Đặc quyền V.I.P;Đặc quyền PRO;Cố vấn 1-1 Chuyên gia", "tierLevel": "DIAMOND", "description": "Gói Diamond - Full V.I.P + Cố vấn 1-1 Chuyên gia", "durationDays": 365}	\N	\N	2026-07-14 09:15:35.941
1008	6	USER	PLAN_UPDATED	subscription_plans	4	{"name": "Diamond", "price": 5000000, "status": "ACTIVE", "currency": "VND", "features": "Đặc quyền V.I.P;Đặc quyền PRO;Cố vấn 1-1 Chuyên gia", "tierLevel": "DIAMOND", "description": "Gói Diamond - Full V.I.P + Cố vấn 1-1 Chuyên gia", "durationDays": 365}	{"name": "Diamond", "price": 8000000, "status": "ACTIVE", "currency": "VND", "features": "Đặc quyền V.I.P;Đặc quyền PRO;Cố vấn 1-1 Chuyên gia", "tierLevel": "DIAMOND", "description": "Gói Diamond - Full V.I.P + Cố vấn 1-1 Chuyên gia", "durationDays": 365}	\N	\N	2026-07-14 09:15:44.261
1009	6	SYSTEM	REFRESH_TOKEN_ROTATED	user_sessions	221	null	null	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 09:51:04.423
\.


--
-- Data for Name: blog_tags; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.blog_tags ("blogId", "tagId") FROM stdin;
\.


--
-- Data for Name: blogs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.blogs (id, "authorId", "categoryId", slug, title, excerpt, content, status, visibility, "minTierAccess", "publishedAt", "createdAt", "updatedAt", "deletedAt", views) FROM stdin;
251	10	104	fpt-earnings-q3-2026	FPT Q3 2026 Earnings Explode	A huge quarter for FPT...	<p>Full details inside.</p>	PUBLISHED	PREMIUM	GOLD	2026-07-07 03:05:21.239	2026-07-07 03:05:21.008	2026-07-14 03:42:31.854	\N	2
252	1	105	vnindex-phan-tich-q2-2026	VN-Index phân tích xu hướng Q2/2026 — Vùng tích lũy 1.250-1.320	Thị trường đang trong giai đoạn tích lũy sau nhịp hồi phục mạnh từ vùng 1.150. Dòng tiền ngoại quay trở lại, VN30 dẫn dắt nhóm cổ phiếu vốn hóa lớn.	VN-Index đang giao dịch trong biên độ hẹp 1.250-1.320 điểm, phản ánh tâm lý thận trọng của nhà đầu tư trước mùa báo cáo KQKD Q2/2026.\n\nDòng tiền thông minh đang luân chuyển mạnh vào nhóm Ngân hàng (VCB, TCB, MBB) và Công nghệ (FPT). Khối ngoại mua ròng liên tục 5 phiên gần nhất với tổng giá trị hơn 2.100 tỷ đồng.\n\nKịch bản tích cực: VN-Index vượt kháng cự 1.320 sẽ mở đường lên vùng 1.380-1.400.\nKịch bản tiêu cực: Mất hỗ trợ 1.250, rủi ro quay lại test vùng 1.200.	PUBLISHED	PUBLIC	STANDARD	2026-06-27 02:13:01.389	2026-07-07 03:08:40.502	2026-07-07 03:08:40.502	\N	0
253	1	105	dong-tien-tuan-2306-2706	Phân tích dòng tiền tuần 23/06 - 27/06: Tập trung vào nhóm Ngân Hàng & Công Nghệ	Dòng tiền thông minh chảy mạnh vào nhóm Blue-chip Ngân hàng. FPT breakout mạnh, SSI và VND hưởng lợi từ thanh khoản tăng đột biến.	Tuần giao dịch 23-27/06/2026, thanh khoản thị trường cải thiện rõ rệt với giá trị khớp lệnh bình quân đạt 18.500 tỷ/phiên trên HOSE.\n\nNhóm Ngân hàng: VCB tăng 3.2%, TCB +2.8%, MBB +4.1%. Dòng tiền lớn đổ vào mạnh, volume tăng gấp 1.5x so với trung bình 20 phiên.\n\nNhóm Công nghệ: FPT breakout khỏi vùng 130.000, xác lập uptrend mới. SSI và VND hưởng lợi khi thanh khoản tăng cao.	PUBLISHED	PUBLIC	STANDARD	2026-07-03 01:13:58.783	2026-07-07 03:08:40.51	2026-07-07 03:08:40.51	\N	0
254	1	105	chien-luoc-dau-tu-thang-7-2026	Chiến lược đầu tư tháng 7/2026: Cơ hội phân bổ danh mục cân bằng	Khuyến nghị phân bổ 40% Ngân hàng, 25% Công nghệ, 20% Bất động sản KCN, 15% tiền mặt. Mục tiêu lợi nhuận 8-12% trong quý.	Tổng quan: Thị trường bước vào giai đoạn thuận lợi khi lãi suất tiếp tục giảm, tín dụng tăng trưởng tốt.\n\nPhân bổ khuyến nghị:\n- 40% Ngân hàng (VCB, MBB, TCB): P/B hấp dẫn, NIM cải thiện\n- 25% Công nghệ (FPT): Động lực từ AI và chuyển đổi số\n- 20% BĐS KCN: Hưởng lợi FDI tăng mạnh\n- 15% Tiền mặt: Chờ cơ hội khi thị trường điều chỉnh	PUBLISHED	PUBLIC	STANDARD	2026-06-23 23:17:08.232	2026-07-07 03:08:40.514	2026-07-07 03:08:40.514	\N	0
255	1	105	canh-bao-rui-ro-bien-dong-ty-gia	Cảnh báo: Biến động tỷ giá USD/VND và tác động đến nhóm xuất khẩu	Tỷ giá USD/VND tăng 2% trong tháng 6, tạo áp lực lên nhóm nhập khẩu nhưng lại hỗ trợ nhóm xuất khẩu thủy sản, dệt may.	Biến động tỷ giá gần đây tạo phân hóa rõ rệt giữa các nhóm ngành. Phân tích tác động chi tiết cho từng nhóm cổ phiếu.	PUBLISHED	PUBLIC	STANDARD	2026-07-07 00:47:52.859	2026-07-07 03:08:40.519	2026-07-07 03:08:40.519	\N	0
256	1	106	pro-fpt-target-160k	PRO Analysis | FPT — Mục tiêu 160.000, Upside 22%	FPT đang ở giai đoạn tăng trưởng mạnh nhất với AI và Cloud. EPS dự phóng 2026 đạt 7.800đ (+28% YoY). Khuyến nghị MUA với mục tiêu 160.000đ.	FPT Corporation (FPT) — Deep Dive Analysis\n\nKết luận: KHUYẾN NGHỊ MUA, Mục tiêu giá 160.000đ (+22% upside)\n\nĐộng lực tăng trưởng:\n1. Mảng AI & Cloud tăng 45% YoY\n2. Ký hợp đồng mới đạt $1.2B trong 5 tháng đầu 2026\n3. P/E forward 18x - thấp hơn trung vị ngành Công nghệ Đông Nam Á\n\nRủi ro: Biên lợi nhuận mảng viễn thông giảm, cạnh tranh từ các công ty Ấn Độ.	PUBLISHED	PUBLIC	GOLD	2026-06-26 18:36:13.928	2026-07-07 03:08:40.524	2026-07-07 03:08:40.524	\N	0
257	1	106	pro-vcb-target-105k	PRO Analysis | VCB — Ngôi sao ngân hàng, mục tiêu 105.000	Vietcombank tiếp tục dẫn đầu ngành Ngân hàng với ROE 24%, NIM cải thiện lên 3.8%. P/B 2.5x — cao nhưng xứng đáng với chất lượng tài sản hàng đầu.	Vietcombank (VCB) — Premium Banking Analysis\n\nKhuyến nghị: MUA DÀI HẠN, Mục tiêu giá 105.000đ\n\nĐiểm nhấn:\n- ROE duy trì >24% - cao nhất ngành\n- Tỷ lệ nợ xấu thấp nhất: 0.68%\n- Tín dụng tăng trưởng 15% room được cấp bổ sung\n- CASA ratio 38% - chi phí vốn thấp nhất hệ thống	PUBLISHED	PUBLIC	GOLD	2026-06-25 15:32:53.421	2026-07-07 03:08:40.528	2026-07-07 03:08:40.528	\N	0
258	1	106	pro-hpg-steel-cycle	PRO Analysis | HPG — Chu kỳ thép phục hồi, mục tiêu 34.000	Hòa Phát bước vào giai đoạn phục hồi biên lợi nhuận khi giá thép HRC tăng 15% từ đáy. Dự án Dung Quất 2 sẽ bổ sung 20% công suất.	Hòa Phát Group (HPG) — Steel Cycle Analysis\n\nKhuyến nghị: MUA, Mục tiêu giá 34.000đ (+16% upside)\n\nĐộng lực:\n1. Giá thép HRC tăng 15% từ đáy Q1/2026\n2. Dung Quất giai đoạn 2 vận hành Q4/2026\n3. EPS dự phóng 2.800đ/cp (+35% YoY)	PUBLISHED	PUBLIC	GOLD	2026-07-06 02:00:37.748	2026-07-07 03:08:40.532	2026-07-07 03:08:40.532	\N	0
259	1	107	phan-tich-msn-q2-2026	MSN | Masan Group — Phân tích KQKD Q2/2026 sơ bộ	Masan kỳ vọng doanh thu thuần đạt 22.500 tỷ (+18% YoY) nhờ WinMart tăng trưởng same-store 8% và Masan MEATLife cải thiện biên lợi nhuận.	Masan Group (MSN) — Q2/2026 Preview\n\nDoanh thu thuần ước đạt 22.500 tỷ đồng, tăng 18% YoY\nWinCommerce (WinMart): SSSG +8%, lỗ thu hẹp đáng kể\nMasan Consumer: Biên EBITDA cải thiện lên 26%\nTechcombank: Đóng góp lợi nhuận ổn định	PUBLISHED	PUBLIC	STANDARD	2026-06-26 04:20:16.855	2026-07-07 03:08:40.534	2026-07-07 03:08:40.534	\N	0
260	1	107	phan-tich-mwg-q2-2026	MWG | Thế Giới Di Động — Bật tăng mạnh nhờ chiến lược đa kênh	Thế Giới Di Động ghi nhận doanh thu phục hồi mạnh mẽ. Chuỗi Bách Hóa Xanh lần đầu có lãi trong Q2/2026.	Thế Giới Di Động (MWG) — Recovery Analysis\n\nDoanh thu phục hồi mạnh: +22% YoY\nBách Hóa Xanh: Lần đầu EBITDA dương, 1.800 cửa hàng\nĐiện Máy Xanh + TGDĐ: Biên lợi nhuận gộp 22%\nErablue Indonesia: Mở rộng lên 100 cửa hàng	PUBLISHED	PUBLIC	STANDARD	2026-06-27 02:57:29.513	2026-07-07 03:08:40.538	2026-07-07 03:08:40.538	\N	0
261	1	107	phan-tich-pnj-q2-2026	PNJ | Vàng bạc Đá quý Phú Nhuận — Tăng trưởng vượt kỳ vọng	PNJ ghi nhận lợi nhuận ròng Q2 ước đạt 580 tỷ (+25% YoY). Giá vàng tăng mạnh hỗ trợ biên lợi nhuận.	PNJ Corporation — Q2/2026 Performance\n\nLợi nhuận ròng Q2: 580 tỷ đồng (+25% YoY)\nDoanh thu vàng miếng tăng 40% do giá vàng lập đỉnh\nMảng trang sức: Biên lợi nhuận gộp ổn định 19%\nKế hoạch mở mới 25 cửa hàng trong nửa cuối 2026	PUBLISHED	PUBLIC	STANDARD	2026-07-01 04:03:27.137	2026-07-07 03:08:40.542	2026-07-07 03:08:40.542	\N	0
262	1	108	nganh-ngan-hang-q2-2026	Ngành Ngân hàng Q2/2026: NIM phục hồi, tín dụng tăng mạnh	Ngành Ngân hàng bước vào giai đoạn thuận lợi nhất kể từ 2023. NIM tăng trung bình 20bps, tín dụng tăng trưởng 8% so với đầu năm.	Banking Sector Overview Q2/2026\n\nNIM trung bình ngành: 3.5% (+20bps QoQ)\nTín dụng tăng trưởng: 8% YTD (mục tiêu cả năm 14-15%)\nTỷ lệ nợ xấu ngành: 1.4% (giảm từ 1.7%)\n\nTop picks: VCB (Premium), MBB (Growth), TCB (Digital leader)	PUBLISHED	PUBLIC	STANDARD	2026-06-27 02:31:22.403	2026-07-07 03:08:40.545	2026-07-07 03:08:40.545	\N	0
263	1	108	nganh-cong-nghe-ai-boom	Ngành Công nghệ Việt Nam: Cơ hội lớn từ AI & Cloud Computing	Thị trường AI tại Việt Nam ước đạt $1.5B trong 2026. FPT chiếm 60% thị phần dịch vụ AI enterprise, tiếp theo là CMC và Viettel Solutions.	Vietnam Tech Sector — AI Revolution\n\nQuy mô thị trường AI Việt Nam: $1.5B (2026E)\nFPT: 60% thị phần AI enterprise\nĐầu tư AI/Cloud của DN Việt: Tăng 45% YoY\nViettel, VNPT đẩy mạnh hạ tầng Cloud quốc gia\n\nTop picks: FPT (Leader), CMG (Value)	PUBLISHED	PUBLIC	STANDARD	2026-06-30 12:42:40.122	2026-07-07 03:08:40.548	2026-07-07 03:08:40.548	\N	0
264	1	108	nganh-bds-kcn-fdi	Ngành BĐS KCN: Bùng nổ nhờ FDI và chiến lược Trung Quốc+1	Dòng vốn FDI đăng ký 5T/2026 đạt $18.2B (+28% YoY). BĐS KCN hưởng lợi lớn nhất khi tỷ lệ lấp đầy trung bình đạt 85%.	Industrial Real Estate — FDI Boom Analysis\n\nFDI 5 tháng đầu 2026: $18.2B (+28% YoY)\nTỷ lệ lấp đầy KCN: 85% (cao kỷ lục)\nGiá thuê đất KCN: $130/m²/lease (+12% YoY)\n\nTop picks: VHM (KCN mới), NLG, KBC	PUBLISHED	PUBLIC	STANDARD	2026-07-04 23:27:30.475	2026-07-07 03:08:40.553	2026-07-07 03:08:40.553	\N	0
265	1	105	vi-mo-toan-cau-va-lai-suat-fed-2026	Phân tích Vĩ mô: Xu hướng lãi suất FED và ảnh hưởng tới tỷ giá USD/VND	FED dự kiến hạ lãi suất thêm 0.25% trong kỳ họp tới. Tỷ giá USD/VND hạ nhiệt dần về quanh mốc 25.100đ, giảm áp lực lên chính sách tiền tệ.	Bối cảnh kinh tế vĩ mô toàn cầu đang ghi nhận những chuyển dịch tích cực. CPI Mỹ hạ nhiệt nhanh hơn dự kiến hỗ trợ FED có thêm dư địa nới lỏng tiền tệ.\n\nTrong nước, Ngân hàng Nhà nước duy trì chính sách linh hoạt. Lãi suất liên ngân hàng hạ nhiệt giúp thanh khoản hệ thống dồi dào. Tỷ giá USD/VND được dự báo sẽ duy trì ổn định trong khoảng 24.800 - 25.200 trong nửa cuối năm 2026.	PUBLISHED	PUBLIC	STANDARD	2026-06-28 06:29:00.493	2026-07-07 03:08:40.557	2026-07-07 03:08:40.557	\N	0
266	1	105	chien-luoc-danh-muc-fintop-q2-2026	Chiến lược phân bổ danh mục FinTop Q2/2026: Đón đầu sóng nâng hạng	Khuyến nghị tập trung vào nhóm cổ phiếu đáp ứng tiêu chuẩn FTSE nâng hạng như FPT, HPG, VCB và SSI. Cơ cấu tỷ trọng danh mục tối ưu.	Việc nâng hạng lên thị trường mới nổi sẽ thu hút hàng tỷ USD dòng vốn ngoại từ các quỹ ETF thụ động.\n\nChúng tôi khuyến nghị chiến lược phân bổ danh mục tập trung:\n1. Công nghệ & AI: FPT (tỷ trọng 25%)\n2. Ngân hàng hàng đầu: VCB (tỷ trọng 20%), TCB (tỷ trọng 15%)\n3. Chu kỳ sản xuất: HPG (tỷ trọng 20%)\n4. Dịch vụ tài chính: SSI (tỷ trọng 20%)\n\nMức dừng lỗ kỷ luật ở mức 7-10% cho từng cổ phiếu.	PUBLISHED	PUBLIC	STANDARD	2026-06-25 15:38:01.902	2026-07-07 03:08:40.56	2026-07-07 03:08:40.56	\N	0
267	1	105	dong-tien-thang-7-2026-nhom-chung-khoan	Phân tích dòng tiền tháng 7/2026: Dòng tiền thông minh luân chuyển vào nhóm Chứng khoán	Dòng tiền thông minh bắt đầu đổ mạnh vào nhóm cổ phiếu chứng khoán nhờ kỳ vọng thanh khoản hồi phục và tiến độ nâng hạng thị trường.	Báo cáo Dòng tiền tháng 7/2026 ghi nhận khối lượng giao dịch đột biến ở nhóm cổ phiếu Dịch vụ tài chính (Chứng khoán). Các cổ phiếu dẫn dắt như SSI, VND, VCI, HCM đều bứt phá mạnh khỏi vùng nền tích lũy dài hạn. Thanh khoản bình quân toàn thị trường tăng 22% so với tháng trước, củng cố xu hướng tăng của nhóm ngành nhạy bén với thị trường này.	PUBLISHED	PUBLIC	STANDARD	2026-07-04 17:37:47.517	2026-07-07 03:08:40.564	2026-07-07 03:08:40.564	\N	0
268	1	105	bao-cao-vi-mo-q3-2026-chinh-sach-tien-te	Báo cáo chiến lược vĩ mô Q3/2026: Điều hành tỷ giá và xu hướng lãi suất nội địa	Dự báo về tăng trưởng GDP và các kịch bản chính sách tỷ giá của Ngân hàng Nhà nước trong nửa cuối năm 2026.	Xuuyên suốt Q3/2026, Ngân hàng Nhà nước duy trì chính sách linh hoạt. Lãi suất liên ngân hàng hạ nhiệt giúp thanh khoản hệ thống dồi dào. Tỷ giá USD/VND được dự báo sẽ duy trì ổn định trong khoảng 24.800 - 25.200 trong nửa cuối năm 2026.	PUBLISHED	PUBLIC	STANDARD	2026-07-01 13:33:11.38	2026-07-07 03:08:40.567	2026-07-07 03:08:40.567	\N	0
269	1	106	pro-hpg-dung-quat-2-pe-phong	PRO Analysis | HPG — Dung Quất 2 bệ phóng tăng trưởng dài hạn	Dự án đại siêu dự án Dung Quất 2 dự kiến hoàn thành giai đoạn 1 vào cuối năm 2026, nâng công suất HRC của HPG lên 8.6 triệu tấn/năm.	HPG tiếp tục khẳng định vị thế dẫn đầu ngành thép khu vực Đông Nam Á. Đại dự án Dung Quất 2 sẽ giải quyết nút thắt về năng lực sản xuất HRC chất lượng cao, giúp HPG gia tăng biên lợi nhuận gộp đáng kể nhờ tối ưu hóa chi phí sản xuất theo quy mô. Khuyến nghị: MUA DÀI HẠN với giá mục tiêu 36.500đ.	PUBLISHED	PUBLIC	GOLD	2026-07-01 03:58:55.349	2026-07-07 03:08:40.57	2026-07-07 03:08:40.57	\N	0
270	1	106	pro-tcb-mo-hinh-so-dan-dau	PRO Analysis | TCB — Mô hình ngân hàng số dẫn đầu hiệu quả, mục tiêu 32.000	Techcombank duy trì tỷ lệ CASA hàng đầu hệ thống và thúc đẩy nguồn thu phi tín dụng từ số hóa toàn diện quy trình.	Techcombank (TCB) tiếp tục đạt hiệu quả hoạt động vượt trội nhờ chi phí vốn thấp và mô hình ngân hàng số tiện ích cao. Chất lượng tài sản vững chắc với tỷ lệ bao phủ nợ xấu cao và trích lập dự phòng đầy đủ giúp TCB giảm thiểu rủi ro tín dụng. Khuyến nghị: MUA, Mục tiêu giá 32.000đ.	PUBLISHED	PUBLIC	GOLD	2026-07-02 07:25:42.303	2026-07-07 03:08:40.574	2026-07-07 03:08:40.574	\N	0
271	1	107	vhm-cap-nhat-tien-do-du-an-2026	VHM | Vinhomes — Cập nhật tiến độ dự án và kế hoạch mở bán nửa cuối 2026	Vinhomes chuẩn bị mở bán phân khu mới tại các dự án đại đô thị trọng điểm. Dự báo dòng tiền và lợi nhuận ròng của doanh nghiệp.	Vinhomes (VHM) tiếp tục duy trì quỹ đất sạch lớn nhất Việt Nam cùng năng lực triển khai dự án vượt trội. Kế hoạch mở bán phân khu mới tại Ocean Park và các dự án đại đô thị vùng ven sẽ mang lại dòng tiền dồi dào, hỗ trợ giảm tỷ lệ đòn bẩy tài chính và gia tăng giá trị cho cổ đông trong chu kỳ 2026 - 2028.	PUBLISHED	PUBLIC	STANDARD	2026-06-27 06:44:40.781	2026-07-07 03:08:40.579	2026-07-07 03:08:40.579	\N	0
273	1	108	nganh-ban-le-phuc-hoi-suc-mua-noi-dia	Ngành Bán lẻ: Phục hồi mạnh mẽ nhờ sức mua nội địa cải thiện	Ngành bán lẻ hồi phục tích cực nhờ chính sách hỗ trợ kinh tế và các chương trình kích cầu tiêu dùng nội địa trong năm 2026.	Sau giai đoạn tái cơ cấu quyết liệt, các chuỗi bán lẻ lớn tại Việt Nam bắt đầu gặt hái thành quả. Doanh thu toàn ngành dự báo tăng trưởng 12% trong năm 2026. Bách Hóa Xanh (MWG) và Long Châu (FRT) là những điểm sáng lớn nhất nhờ mở rộng quy mô hiệu quả và tối ưu hóa chuỗi cung ứng.	PUBLISHED	PUBLIC	STANDARD	2026-06-23 11:02:05.905	2026-07-07 03:08:40.584	2026-07-07 03:08:40.584	\N	0
274	1	108	nganh-nang-luong-tai-tao-dien-viii	Ngành Năng lượng: Quy hoạch điện VIII và xu hướng phát triển nguồn điện sạch	Các chính sách khuyến khích năng lượng xanh mở ra cơ hội tăng trưởng lớn cho các doanh nghiệp xây lắp và vận hành nguồn điện sạch.	Quy hoạch điện VIII tạo hành lang pháp lý vững chắc cho việc chuyển dịch năng lượng tại Việt Nam. Các dự án điện gió ngoài khơi và điện mặt trời mái nhà tự sản tự tiêu được ưu tiên phát triển. Các doanh nghiệp có năng lực quản lý dự án tốt và cấu trúc vốn lành mạnh như GEX, PC1 sẽ đi đầu đón sóng đầu tư hạ tầng điện.	PUBLISHED	PUBLIC	STANDARD	2026-06-24 22:49:07.645	2026-07-07 03:08:40.588	2026-07-07 03:08:40.588	\N	0
272	1	107	nlg-nam-long-nha-o-vua-tui-tien	NLG | Nam Long — Điểm sáng từ các phân khúc nhà ở vừa túi tiền (Affordable Housing)	Nam Long ghi nhận tỷ lệ hấp thụ tốt tại các dự án Mizuki Park và Waterpoint nhờ dòng sản phẩm đáp ứng nhu cầu thực của thị trường.	Chiến lược tập trung vào phân khúc nhà ở vừa túi tiền và trung cấp giúp Nam Long (NLG) duy trì doanh số bán hàng ổn định bất chấp biến động thị trường. Hợp tác chiến lược với các đối tác Nhật Bản giúp NLG đảm bảo nguồn vốn rẻ và tiến độ xây dựng chất lượng cao. Khuyến nghị tích lũy vùng giá hấp dẫn.	PUBLISHED	PUBLIC	STANDARD	2026-07-05 22:18:34.636	2026-07-07 03:08:40.582	2026-07-14 03:42:55.712	\N	2
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, slug, name, description, "createdAt", "updatedAt") FROM stdin;
104	market-news	Market News	\N	2026-07-07 03:05:20.991	2026-07-07 03:05:20.991
105	thi-truong	Thị trường	\N	2026-07-07 03:08:40.455	2026-07-07 03:08:40.455
106	pro-research	PRO Research	\N	2026-07-07 03:08:40.462	2026-07-07 03:08:40.462
107	doanh-nghiep	Doanh nghiệp	\N	2026-07-07 03:08:40.465	2026-07-07 03:08:40.465
108	ncpt-nganh	NCPT Ngành	\N	2026-07-07 03:08:40.469	2026-07-07 03:08:40.469
109	vi-mo	Vĩ mô & Tiền tệ	\N	2026-07-07 03:08:40.473	2026-07-07 03:08:40.473
110	kien-thuc	Kiến thức đầu tư	\N	2026-07-07 03:08:40.477	2026-07-07 03:08:40.477
111	phan-tich-ky-thuat	Phân tích kỹ thuật	\N	2026-07-07 03:08:40.482	2026-07-07 03:08:40.482
112	tin-tuc	Tin tức & Sự kiện	\N	2026-07-07 03:08:40.484	2026-07-07 03:08:40.484
113	nhat-ky-giao-dich	Nhật ký giao dịch	\N	2026-07-07 03:08:40.488	2026-07-07 03:08:40.488
\.


--
-- Data for Name: content_revisions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.content_revisions (id, "blogId", "editorId", action, "snapshotData", reason, "createdAt") FROM stdin;
81	251	10	CREATED	{"title": "FPT Q3 2026 Earnings Explode", "content": "<p>Full details inside.</p>", "excerpt": "A huge quarter for FPT..."}	Initial Draft	2026-07-07 03:05:21.037
82	251	10	STATUS_CHANGED	{"status": "PENDING_REVIEW"}	Status changed to PENDING_REVIEW	2026-07-07 03:05:21.231
83	251	10	STATUS_CHANGED	{"status": "PUBLISHED"}	Status changed to PUBLISHED	2026-07-07 03:05:21.242
\.


--
-- Data for Name: copy_trade_copiers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.copy_trade_copiers (id, name, "masterId", capital, multiplier, profit, status, "createdAt", "updatedAt") FROM stdin;
1	Phạm Minh Hoàng	1	250000000.0000	1.00	45200000.0000	ACTIVE	2026-06-16 07:25:39.176	2026-06-16 07:25:39.176
2	Trần Thị Thanh	2	500000000.0000	2.00	61000000.0000	ACTIVE	2026-06-16 07:25:39.176	2026-06-16 07:25:39.176
3	Vũ Đức An	1	150000000.0000	0.50	-5400000.0000	INACTIVE	2026-06-16 07:25:39.176	2026-06-16 07:25:39.176
4	Nguyễn Bích Ngọc	3	300000000.0000	1.00	26100000.0000	ACTIVE	2026-06-16 07:25:39.176	2026-06-16 07:25:39.176
\.


--
-- Data for Name: copy_trade_masters; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.copy_trade_masters (id, name, strategy, aum, followers, profit, "winRate", status, "createdAt", "updatedAt") FROM stdin;
1	Nguyễn Hoàng Nam	Quant Trend-Following	6800000000.0000	2	18.40	78.00	ACTIVE	2026-06-16 07:25:39.164	2026-06-16 07:25:39.164
2	Trần Việt Bách	Sóng ngành VIP	4500000000.0000	1	12.20	72.00	ACTIVE	2026-06-16 07:25:39.167	2026-06-16 07:25:39.167
3	Lê Minh Trang	Giá trị & Tăng trưởng	4100000000.0000	1	8.70	71.00	ACTIVE	2026-06-16 07:25:39.169	2026-06-16 07:25:39.169
\.


--
-- Data for Name: copy_trade_orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.copy_trade_orders (id, "time", "masterId", symbol, action, price, quantity, accounts, status, "successRate", "createdAt") FROM stdin;
1	2026-06-09 09:15:00	1	FPT	MUA	132400.0000	10000	42	SUCCESS	100.00	2026-06-16 07:25:39.183
2	2026-06-09 09:20:00	2	HPG	MUA	29150.0000	50000	38	SUCCESS	100.00	2026-06-16 07:25:39.183
3	2026-06-08 14:10:00	1	VCB	BÁN	91200.0000	15000	42	SUCCESS	100.00	2026-06-16 07:25:39.183
4	2026-06-08 11:05:00	1	SSI	MUA	35400.0000	20000	42	SUCCESS	100.00	2026-06-16 07:25:39.183
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.departments (id, name, code, description, status, "createdAt", "updatedAt", "deletedAt") FROM stdin;
1	Ban Điều Hành (Executive)	EXEC	Ban điều hành cấp cao	ACTIVE	2026-06-16 07:25:15.604	2026-06-16 07:25:15.604	\N
2	Khối Kinh doanh & Môi giới	SALES	Khối tư vấn và chăm sóc khách hàng	ACTIVE	2026-06-16 07:25:15.621	2026-06-16 07:25:15.621	\N
3	Khối Biên tập & Phân tích	EDITORIAL	Khối sản xuất nội dung và tín hiệu	ACTIVE	2026-06-16 07:25:15.625	2026-06-16 07:25:15.625	\N
\.


--
-- Data for Name: email_verification_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.email_verification_tokens (id, "userId", code, "expiresAt", "usedAt", attempts, "createdAt") FROM stdin;
1	1	884872	2026-06-16 08:12:59.232	\N	1	2026-06-16 08:02:59.255
2	5	926689	2026-06-23 02:54:34.869	\N	0	2026-06-23 02:44:34.871
3	6	988487	2026-06-23 02:57:38.945	\N	0	2026-06-23 02:47:38.949
4	6	844659	2026-06-23 03:02:06.251	\N	0	2026-06-23 02:52:06.268
5	16	917994	2026-06-23 03:13:20.114	\N	0	2026-06-23 03:03:20.115
6	16	557580	2026-06-23 03:16:04.668	\N	0	2026-06-23 03:06:04.674
7	16	292009	2026-06-23 03:18:22.456	\N	0	2026-06-23 03:08:22.463
8	16	675005	2026-06-23 03:41:55.721	\N	0	2026-06-23 03:31:55.727
9	108	315634	2026-06-28 04:37:04.154	\N	0	2026-06-28 04:27:04.161
11	164	607964	2026-07-06 02:51:00.233	2026-07-06 02:41:34.118	1	2026-07-06 02:41:00.246
\.


--
-- Data for Name: featured_contents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.featured_contents (id, "blogId", "position", "featuredAt") FROM stdin;
\.


--
-- Data for Name: financial_indicators; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.financial_indicators (id, "stockId", period, date, "peRatio", "pbRatio", eps, "marketCap", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: foreign_flow_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.foreign_flow_history (id, trade_date, ticker, sector_code, sector_name, foreign_buy_value, foreign_sell_value, foreign_net_value, foreign_buy_volume, foreign_sell_volume, foreign_net_volume, created_at) FROM stdin;
\.


--
-- Data for Name: handbooks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.handbooks (id, title, "driveLink", category, status, "createdAt", "updatedAt", description, "linkType", "order") FROM stdin;
4	Quy tắc số 1 - Phil Town	https://drive.google.com/open?id=163rYqU10ePFvDPAKf96l7sbOwzIaUYPr	TU_SACH_DAU_TU	ACTIVE	2026-06-29 14:33:21.649	2026-06-29 14:33:21.649	\N	link	4
5	Cổ phiếu thường, Lợi nhuận phi thường	https://drive.google.com/open?id=1nsE2F1Km290vB0JUjL3rAiOMolvVPerf	TU_SACH_DAU_TU	ACTIVE	2026-06-29 14:33:21.65	2026-06-29 14:33:21.65	\N	link	5
6	Phương pháp đầu tư của Warren Buffett	https://drive.google.com/open?id=1OrBu0mf7NFTtvGY8FSSykmnkjfW_HP62	TU_SACH_DAU_TU	ACTIVE	2026-06-29 14:33:21.652	2026-06-29 14:33:21.652	\N	link	6
7	Bí quyết đầu tư của tỷ phủ Warren Buffett	https://drive.google.com/open?id=1ft9qOXv9Sz8ZxzWr_l-2gU-y4CNCgmfx	TU_SACH_DAU_TU	ACTIVE	2026-06-29 14:33:21.652	2026-06-29 14:33:21.652	\N	link	7
8	Báo cáo tài chính dưới góc nhìn Warren Buffett	https://drive.google.com/open?id=1GXwADBj20LzSBd5B3iT-UxIW61SZ35Qy	TU_SACH_DAU_TU	ACTIVE	2026-06-29 14:33:21.653	2026-06-29 14:33:21.653	\N	link	8
9	Phong cách đầu tư Warren Buffet	https://drive.google.com/open?id=11S5Vkf_xdSzIy94IZCEszPRhroUpcWj_	TU_SACH_DAU_TU	ACTIVE	2026-06-29 14:33:21.654	2026-06-29 14:33:21.654	\N	link	9
10	Ngay cả Warren Buffett cũng không hoàn hảo	https://drive.google.com/open?id=1twzdNMhIDEAdbmZPfPG8cQE9mvfvGsjw	TU_SACH_DAU_TU	ACTIVE	2026-06-29 14:33:21.656	2026-06-29 14:33:21.656	\N	link	10
11	Sách lược đầu tư của Warren Buffett	https://drive.google.com/open?id=1U7kPfxiXOshBe57anu6LMRKmFCIbFTdP	TU_SACH_DAU_TU	ACTIVE	2026-06-29 14:33:21.658	2026-06-29 14:33:21.658	\N	link	11
12	Đạo của Warren Buffett	https://drive.google.com/open?id=1yJZv8GruQe30FZfD5SaXYsX6mLnGtQsb	TU_SACH_DAU_TU	ACTIVE	2026-06-29 14:33:21.659	2026-06-29 14:33:21.659	\N	link	12
13	Lý thuyết hộp Darvas - Nicolas Darvas	https://drive.google.com/open?id=1GeWw9eEMOAWSndBl-Z_q_OjSLTN7_Q8u	TU_SACH_DAU_TU	ACTIVE	2026-06-29 14:33:21.661	2026-06-29 14:33:21.661	\N	link	13
14	Một Las Vegas khác - Nicolas Darvas	https://drive.google.com/open?id=1Yu9qTOtnQDUuqITBtVbbK5qvAF94LzS5	TU_SACH_DAU_TU	ACTIVE	2026-06-29 14:33:21.662	2026-06-29 14:33:21.662	\N	link	14
15	24 Bài học sống còn trong đầu tư chứng khoán	https://drive.google.com/open?id=1pX6pAcqNYORNM8J69dNk9gnU1LAIpa8A	TU_SACH_DAU_TU	ACTIVE	2026-06-29 14:33:21.663	2026-06-29 14:33:21.663	\N	link	15
16	Tâm lý thị trường chứng khoán - George Selden	https://drive.google.com/open?id=1grQ6tmLoeevzSDfqTo5e9uQ7W_bNAl28	TU_SACH_DAU_TU	ACTIVE	2026-06-29 14:33:21.663	2026-06-29 14:33:21.663	\N	link	16
17	Cách mua chứng khoán	https://drive.google.com/open?id=11CUMSItcm66OGCNsLvxcZ8hnWeerbV8o	TU_SACH_DAU_TU	ACTIVE	2026-06-29 14:33:21.665	2026-06-29 14:33:21.665	\N	link	17
18	Chiến lược đầu tư chứng khoán - David Brown	https://drive.google.com/open?id=1DNOPtjeXlho0Q0bmnYHXAW5l_1lQnp3i	TU_SACH_DAU_TU	ACTIVE	2026-06-29 14:33:21.665	2026-06-29 14:33:21.665	\N	link	18
19	Công thức vận may trong đầu tư chứng khoán	https://drive.google.com/open?id=11x_-ahQLA0RpEG8TU25QPa5X42oT_Utf	TU_SACH_DAU_TU	ACTIVE	2026-06-29 14:33:21.667	2026-06-29 14:33:21.667	\N	link	19
20	Công thức kỳ diệu chinh phục thị trường Chứng khoán	https://drive.google.com/open?id=1dIE0_GAWSUJC-6hi1j_96SmtVEv03ira	TU_SACH_DAU_TU	ACTIVE	2026-06-29 14:33:21.668	2026-06-29 14:33:21.668	\N	link	20
21	Bí quyết tay trắng thành triệu phú	https://drive.google.com/open?id=1wJiO1qvqJD0-dMQdEx2Uuo33o8-XFJoK	TU_SACH_DAU_TU	ACTIVE	2026-06-29 14:33:21.669	2026-06-29 14:33:21.669	\N	link	21
22	Hồi ức của một thiên tài đầu tư - Edwin Lefevre	https://drive.google.com/open?id=1KXIKO_X5MtfAnHJinIE3clP2BIge7bF1https://drive.google.com/open?id=1KXIKO_X5MtfAnHJinIE3clP2BIge7bF1	TU_SACH_DAU_TU	ACTIVE	2026-06-29 14:33:21.669	2026-06-29 14:33:21.669	\N	link	22
23	Kiếm tiền bằng đầu tư chứng khoán	https://drive.google.com/open?id=1rXP7HH6-ob-1Ig9RvkM2ZyEBTTKxK7cp	TU_SACH_DAU_TU	ACTIVE	2026-06-29 14:33:21.67	2026-06-29 14:33:21.67	\N	link	23
24	Làm giàu qua chứng khoán	https://drive.google.com/open?id=11BGWsQwmjA2ZrYhlHOECG1kfV9XFPZcd	TU_SACH_DAU_TU	ACTIVE	2026-06-29 14:33:21.671	2026-06-29 14:33:21.671	\N	link	24
25	Trở thành thiên tài chứng khoán - Joel Greenblatt	https://drive.google.com/open?id=12WZ_pCzNSKnJzhD-P0uDD3t2j60QbV5J	TU_SACH_DAU_TU	ACTIVE	2026-06-29 14:33:21.672	2026-06-29 14:33:21.672	\N	link	25
26	Những công cụ thiết yếu trong PTKT thị trường tài chính	https://drive.google.com/open?id=1JnKTpD9G-eSGmmxQsYmu5LONwzl2mrb1	TU_SACH_DAU_TU	ACTIVE	2026-06-29 14:33:21.673	2026-06-29 14:33:21.673	\N	link	26
27	Phân tích kỹ thuật - John Murphy	https://drive.google.com/open?id=1MfiMZTk9FChnmq_8WOQ7mDXDbrcpab0p	TU_SACH_DAU_TU	ACTIVE	2026-06-29 14:33:21.673	2026-06-29 14:33:21.673	\N	link	27
28	Đồ thị hình nến Nhật Bản - Phần I	https://drive.google.com/open?id=1XgwPJteH5Ipkfa021A8N11zR7Ns3TPbI	TU_SACH_DAU_TU	ACTIVE	2026-06-29 14:33:21.674	2026-06-29 14:33:21.674	\N	link	28
29	Đồ thị hình nến Nhật Bản - Phần II	https://drive.google.com/open?id=1CjHVpV0nY7osxAmnRjluF0DRP9_KIv3H	TU_SACH_DAU_TU	ACTIVE	2026-06-29 14:33:21.675	2026-06-29 14:33:21.675	\N	link	29
30	Bước đi ngẫu nhiên trên phố Wall	https://drive.google.com/open?id=1h5Xb9sKJPr7ikDH3q75Giyy5EZgprHZ4	TU_SACH_DAU_TU	ACTIVE	2026-06-29 14:33:21.675	2026-06-29 14:33:21.675	\N	link	30
31	Cuộc nổi dậy ở phố Wall	https://drive.google.com/open?id=12BCuTFdVN5wt7HAoCEABJgxXth9niwNW	TU_SACH_DAU_TU	ACTIVE	2026-06-29 14:33:21.676	2026-06-29 14:33:21.676	\N	link	31
32	Trên đỉnh phố Wall Peter Lynch	https://drive.google.com/open?id=1tPjCxA3x9mfWLg4g4tQgTgHQVPbyBC_Q	TU_SACH_DAU_TU	ACTIVE	2026-06-29 14:33:21.676	2026-06-29 14:33:21.676	\N	link	32
33	Trò bịp trên phố Wall	https://drive.google.com/open?id=1mS86PfhqOtAD-A2Y8GF-k8r_EpbOoR1H	TU_SACH_DAU_TU	ACTIVE	2026-06-29 14:33:21.677	2026-06-29 14:33:21.677	\N	link	33
34	TA1: Hướng dẫn đọc đồ thị nến Candelstick*	\N	KT_TA	ACTIVE	2026-06-29 14:33:21.679	2026-06-29 14:33:21.679	\N	link	1
35	TA2: 10 mẫu nến cơ bản sử dụng trong dự đoán giá tăng giảm*	\N	KT_TA	ACTIVE	2026-06-29 14:33:21.68	2026-06-29 14:33:21.68	\N	link	2
36	TA3: 11 mô hình nến đảo chiều P1*	\N	KT_TA	ACTIVE	2026-06-29 14:33:21.68	2026-06-29 14:33:21.68	\N	link	3
37	TA4: 11 mô hình nến đảo chiều P2*	\N	KT_TA	ACTIVE	2026-06-29 14:33:21.681	2026-06-29 14:33:21.681	\N	link	4
38	TA5: Hướng dẫn sử dụng BB (BollingerBand) trong PTKT*	\N	KT_TA	ACTIVE	2026-06-29 14:33:21.681	2026-06-29 14:33:21.681	\N	link	5
39	TA6: Hướng dẫn sử dụng MA trong phân tích kỹ thuật (PTKT)*	\N	KT_TA	ACTIVE	2026-06-29 14:33:21.682	2026-06-29 14:33:21.682	\N	link	6
40	TA7: Phân tích kỹ thuật P7 | Sử dụng đường trung bình EMA làm mức hỗ trợ và kháng cự	\N	KT_TA	ACTIVE	2026-06-29 14:33:21.682	2026-06-29 14:33:21.682	\N	link	7
3	Nhà đầu tư thông minh - Benjamin Graham	https://drive.google.com/file/d/16iaN3HsRli_0DQ_DlxM33Pg71PzTlQI0/view?usp=sharing	TU_SACH_DAU_TU	ACTIVE	2026-06-29 14:33:21.648	2026-06-29 09:08:04.927	\N	link	2
2	Chết vì chứng khoán - Jesse Livermore	https://drive.google.com/file/d/16iaN3HsRli_0DQ_DlxM33Pg71PzTlQI0/view?usp=sharing	TU_SACH_DAU_TU	ACTIVE	2026-06-29 14:33:21.647	2026-06-29 09:08:04.929	\N	link	3
41	TA8: Hướng dẫn sử dụng RSI trong xu hướng giá*	\N	KT_TA	ACTIVE	2026-06-29 14:33:21.682	2026-06-29 14:33:21.682	\N	link	8
42	TA9: Phương pháp DCA trung bình giá	\N	KT_TA	ACTIVE	2026-06-29 14:33:21.685	2026-06-29 14:33:21.685	\N	link	9
43	TA10: Hướng dẫn sử dụng MACD	\N	KT_TA	ACTIVE	2026-06-29 14:33:21.686	2026-06-29 14:33:21.686	\N	link	10
44	TA11: Hướng dẫn sử dụng Finbonaci	\N	KT_TA	ACTIVE	2026-06-29 14:33:21.686	2026-06-29 14:33:21.686	\N	link	11
45	TA12: Hướng dẫn sử dụng Mây Ichimoku	\N	KT_TA	ACTIVE	2026-06-29 14:33:21.688	2026-06-29 14:33:21.688	\N	link	12
46	TA13: Lý thuyết Supply Demand | Cách vẽ kháng cự hỗ trợ và Trendline	\N	KT_TA	ACTIVE	2026-06-29 14:33:21.688	2026-06-29 14:33:21.688	\N	link	13
47	TA14: Mô hình giá Vai - Đầu - Vai thuận và ngược	\N	KT_TA	ACTIVE	2026-06-29 14:33:21.689	2026-06-29 14:33:21.689	\N	link	14
48	TA16: Mô hình giá 3 đỉnh 3 đáy và 2 đỉnh 2 đáy	\N	KT_TA	ACTIVE	2026-06-29 14:33:21.69	2026-06-29 14:33:21.69	\N	link	15
49	TA16: Điểm Break-out là gì? Phân biệt điểm phá ngưỡng thật giả?	\N	KT_TA	ACTIVE	2026-06-29 14:33:21.691	2026-06-29 14:33:21.691	\N	link	16
50	TA nâng cao P1 | Phân tích đa khung thời gian 1.1 | Trader phải biết	\N	KT_TA	ACTIVE	2026-06-29 14:33:21.692	2026-06-29 14:33:21.692	\N	link	17
51	TA nâng cao P2 | Phân tích đa khung thời gian 1.2 | Thực hành Trade	\N	KT_TA	ACTIVE	2026-06-29 14:33:21.693	2026-06-29 14:33:21.693	\N	link	18
52	TA nâng cao P3 | Elliott nâng cao | Đặc điểm và chiến thuật trade trong mỗi con sóng	\N	KT_TA	ACTIVE	2026-06-29 14:33:21.694	2026-06-29 14:33:21.694	\N	link	19
53	Tìm hiểu cơ hội đầu tư khi đọc Báo cáo tài chính	\N	KT_FA	ACTIVE	2026-06-29 14:33:21.696	2026-06-29 14:33:21.696	\N	link	1
54	Chiến lược đầu tư nắm giữ cổ phiếu tốt	\N	KT_FA	ACTIVE	2026-06-29 14:33:21.697	2026-06-29 14:33:21.697	\N	link	2
55	Phương pháp chiết khấu dòng tiền	\N	KT_FA	ACTIVE	2026-06-29 14:33:21.697	2026-06-29 14:33:21.697	\N	link	3
56	Phương pháp phân tích dòng tiền đơn giản	\N	KT_FA	ACTIVE	2026-06-29 14:33:21.698	2026-06-29 14:33:21.698	\N	link	4
57	Mở tài khoản chứng khoán VPS*	\N	KT_TTCK	ACTIVE	2026-06-29 14:33:21.7	2026-06-29 14:33:21.7	\N	link	1
58	Hướng dẫn đọc bảng giá chứng khoán*	\N	KT_TTCK	ACTIVE	2026-06-29 14:33:21.701	2026-06-29 14:33:21.701	\N	link	2
59	CafeF - Báo thông tin điện tử tổng hợp	\N	KT_TTCK	ACTIVE	2026-06-29 14:33:21.701	2026-06-29 14:33:21.701	\N	link	3
60	Hướng dẫn sử dụng FireAnt Web Platform, công cụ phân tích biểu đồ kỹ thuật*	\N	KT_TTCK	ACTIVE	2026-06-29 14:33:21.702	2026-06-29 14:33:21.702	\N	link	4
61	Hướng dẫn cài đặt và cập nhật dữ liệu Amibroker	\N	KT_TTCK	ACTIVE	2026-06-29 14:33:21.702	2026-06-29 14:33:21.702	\N	link	5
62	Thị trường chứng khoán phái sinh là gì ?	\N	KT_TTCK	ACTIVE	2026-06-29 14:33:21.703	2026-06-29 14:33:21.703	\N	link	6
63	Chứng khoán phái sinh hấp dẫn ở điểm gì ?	\N	KT_TTCK	ACTIVE	2026-06-29 14:33:21.703	2026-06-29 14:33:21.703	\N	link	7
64	Các câu hỏi thường gặp trên Thị trường CK Phái sinh	\N	KT_TTCK	ACTIVE	2026-06-29 14:33:21.704	2026-06-29 14:33:21.704	\N	link	8
65	Thao túng trên thị trường chứng khoán phái sinh	\N	KT_TTCK	ACTIVE	2026-06-29 14:33:21.704	2026-06-29 14:33:21.704	\N	link	9
66	Chứng quyền là gì? Hướng dẫn đầu tư chứng quyền hiệu quả	\N	KT_TTCK	ACTIVE	2026-06-29 14:33:21.705	2026-06-29 14:33:21.705	\N	link	10
67	Ký quỹ (Margin) là gì? Khi nào nên sử dụng giao dịch ký quỹ?	\N	KT_TTCK	ACTIVE	2026-06-29 14:33:21.705	2026-06-29 14:33:21.705	\N	link	11
1	Nhà đầu tư thành công - Wiliam ONeil	https://drive.google.com/open?id=1pnbZmsYUncrvDR-T0mFTsmuIBtQz6xMO	TU_SACH_DAU_TU	ACTIVE	2026-06-29 14:33:21.633	2026-06-29 08:05:17.076	\N	link	5
\.


--
-- Data for Name: industries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.industries (id, "sectorId", name, code, description, status, "createdAt", "updatedAt", "deletedAt") FROM stdin;
1	1	Ngân Hàng	NG_N_H_NG	\N	ACTIVE	2026-06-16 07:25:31.928	2026-06-16 07:25:31.928	\N
2	1	Chứng khoán	CH_NG_KHO_N	\N	ACTIVE	2026-06-16 07:25:31.935	2026-06-16 07:25:31.935	\N
3	1	Bảo hiểm	B_O_HI_M	\N	ACTIVE	2026-06-16 07:25:31.938	2026-06-16 07:25:31.938	\N
6	3	Bất động sản	B_T___NG_S_N	\N	ACTIVE	2026-06-16 07:25:31.95	2026-06-16 07:25:31.95	\N
7	3	BĐS - KCN	B_S___KCN	\N	ACTIVE	2026-06-16 07:25:31.954	2026-06-16 07:25:31.954	\N
8	4	Thép - Vật liệu	TH_P___V_T_LI_U	\N	ACTIVE	2026-06-16 07:25:31.959	2026-06-16 07:25:31.959	\N
9	4	Xây dựng	X_Y_D_NG	\N	ACTIVE	2026-06-16 07:25:31.963	2026-06-16 07:25:31.963	\N
10	4	Dầu khí	D_U_KH_	\N	ACTIVE	2026-06-16 07:25:31.967	2026-06-16 07:25:31.967	\N
11	5	Thực phẩm	TH_C_PH_M	\N	ACTIVE	2026-06-16 07:25:31.975	2026-06-16 07:25:31.975	\N
12	5	Bán lẻ	B_N_L_	\N	ACTIVE	2026-06-16 07:25:31.978	2026-06-16 07:25:31.978	\N
13	5	Dệt may	D_T_MAY	\N	ACTIVE	2026-06-16 07:25:31.981	2026-06-16 07:25:31.981	\N
14	6	Năng lượng/Điện/Nước	N_NG_L__NG__I_N_N__C	\N	ACTIVE	2026-06-16 07:25:31.986	2026-06-16 07:25:31.986	\N
15	7	Hàng không	H_NG_KH_NG	\N	ACTIVE	2026-06-16 07:25:31.991	2026-06-16 07:25:31.991	\N
16	7	Vận tải biển	V_N_T_I_BI_N	\N	ACTIVE	2026-06-16 07:25:31.993	2026-06-16 07:25:31.993	\N
17	8	Dược phẩm - Y tế	D__C_PH_M___Y_T_	\N	ACTIVE	2026-06-16 07:25:31.998	2026-06-16 07:25:31.998	\N
18	9	Bán buôn, bán lẻ	B_N_BU_N__B_N_L_	\N	ACTIVE	2026-06-16 07:25:39.098	2026-06-16 07:25:39.098	\N
49	22	Software	SOFT	\N	ACTIVE	2026-07-07 03:05:26.119	2026-07-07 03:05:26.119	\N
50	22	Công nghệ thông tin	C_NG_NGH__TH_NG_TIN	\N	ACTIVE	2026-07-07 03:08:40.275	2026-07-07 03:08:40.275	\N
51	22	Viễn thông	VI_N_TH_NG	\N	ACTIVE	2026-07-07 03:08:40.297	2026-07-07 03:08:40.297	\N
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.invoices (id, "userId", "subscriptionId", amount, currency, status, "dueDate", "createdAt", "updatedAt", "deletedAt") FROM stdin;
6	4	\N	9500000.0000	VND	PAID	2026-06-26 08:05:59.533	2026-06-16 08:05:59.55	2026-06-23 04:11:54.864	\N
10	1	\N	1500000.0000	VND	PAID	2026-06-26 06:51:28.638	2026-06-23 06:51:28.71	2026-06-23 07:12:01.431	\N
5	3	\N	3500000.0000	VND	PAID	2026-06-21 08:05:59.533	2026-06-16 08:05:59.544	2026-06-25 06:54:13.934	\N
17	175	\N	500000.0000	VND	PAID	2026-07-10 02:56:37.482	2026-07-07 02:56:37.484	2026-07-07 02:56:37.502	\N
19	1	\N	1500000.0000	VND	DRAFT	2026-07-10 04:05:35.797	2026-07-07 04:05:35.825	2026-07-07 04:05:35.825	\N
4	2	14	1500000.0000	VND	PAID	2026-06-23 08:05:59.533	2026-06-16 08:05:59.535	2026-07-07 04:15:09.374	\N
20	1	15	8000000.0000	VND	PAID	2026-07-10 04:14:49.89	2026-07-07 04:14:49.896	2026-07-07 04:15:45.19	\N
18	1	16	1500000.0000	VND	PAID	2026-07-10 04:01:11.767	2026-07-07 04:01:11.773	2026-07-07 04:16:03.357	\N
21	164	17	8000000.0000	VND	PAID	2026-07-10 08:47:29.418	2026-07-07 08:47:29.425	2026-07-07 08:47:58.756	\N
22	164	18	8000000.0000	VND	PAID	2026-07-17 02:58:07.457	2026-07-14 02:58:07.468	2026-07-14 02:58:34.91	\N
\.


--
-- Data for Name: market_breadth_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.market_breadth_history (id, trade_date, exchange, advancing_count, declining_count, unchanged_count, total_count, advance_decline_ratio, new_high_count, new_low_count, above_ma20_count, above_ma50_count, above_ma200_count, created_at) FROM stdin;
\.


--
-- Data for Name: market_data_sync_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.market_data_sync_logs (id, source, "syncType", status, "recordsUpserted", "recordsFailed", "errorMessage", "startedAt", "completedAt") FROM stdin;
37	VNDIRECT_API	DAILY_OHLCV	SUCCESS	1	0	\N	2026-07-07 03:05:26.131	2026-07-07 03:05:26.151
38	MOCK_PROVIDER	DAILY_OHLCV	SUCCESS	1	0	\N	2026-07-07 03:05:26.158	2026-07-07 03:05:26.166
39	VNDIRECT_API	DAILY_OHLCV	SUCCESS	1	0	\N	2026-07-07 03:05:26.169	2026-07-07 03:05:26.175
\.


--
-- Data for Name: market_regime_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.market_regime_history (id, trade_date, index_code, close, ema20, ema50, ema200, atr, adx, regime, risk_score, explanation, created_at) FROM stdin;
\.


--
-- Data for Name: money_flow_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.money_flow_history (id, trade_date, ticker, sector_code, sector_name, market_cap_group, buy_value, sell_value, net_value, total_value, net_value_ratio, created_at) FROM stdin;
\.


--
-- Data for Name: notification_delivery_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notification_delivery_logs (id, "notificationId", channel, "isSuccess", "errorMessage", "sentAt") FROM stdin;
18	18	SYSTEM	t	\N	2026-07-07 03:05:36.532
19	19	SYSTEM	t	\N	2026-07-07 04:15:09.399
20	20	SYSTEM	t	\N	2026-07-07 04:15:45.197
21	21	SYSTEM	t	\N	2026-07-07 04:16:03.362
22	22	SYSTEM	t	\N	2026-07-07 08:47:58.788
23	23	SYSTEM	t	\N	2026-07-14 02:58:34.923
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, "userId", title, content, priority, status, "createdAt", "updatedAt") FROM stdin;
18	12	FPT Alert Triggered	The price for FPT reached 141000. Condition: PRICE_ABOVE 140000.	NORMAL	READ	2026-07-07 03:05:36.444	2026-07-07 03:05:36.865
19	2	Nâng cấp tài khoản	Tài khoản của bạn đã được quản trị viên duyệt nâng cấp lên gói SILVER (Có thời hạn).	NORMAL	UNREAD	2026-07-07 04:15:09.393	2026-07-07 04:15:09.393
20	1	Nâng cấp tài khoản	Tài khoản của bạn đã được quản trị viên duyệt nâng cấp lên gói SILVER (Có thời hạn).	NORMAL	READ	2026-07-07 04:15:45.196	2026-07-07 08:51:30.843
22	164	Nâng cấp tài khoản	Tài khoản của bạn đã được quản trị viên duyệt nâng cấp lên gói SILVER (Có thời hạn).	NORMAL	READ	2026-07-07 08:47:58.78	2026-07-07 08:56:12.908
21	1	Nâng cấp tài khoản	Tài khoản của bạn đã được quản trị viên duyệt nâng cấp lên gói SILVER (Có thời hạn).	NORMAL	READ	2026-07-07 04:16:03.361	2026-07-07 09:11:46.042
23	164	Nâng cấp tài khoản	Tài khoản của bạn đã được quản trị viên duyệt nâng cấp lên gói PRO3 (Có thời hạn).	NORMAL	READ	2026-07-14 02:58:34.92	2026-07-14 02:59:14.548
\.


--
-- Data for Name: outbox_events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.outbox_events (id, "eventType", payload, status, "errorReason", "retryCount", "createdAt", "updatedAt") FROM stdin;
34	SUBSCRIPTION_ACTIVATED	{"userId": 175, "tierLevel": "GOLD", "subscriptionId": "13"}	PENDING	\N	0	2026-07-07 02:56:37.514	2026-07-07 02:56:37.514
35	INVOICE_PAID	{"amount": 500000, "provider": "VIETQR", "invoiceId": "17"}	PENDING	\N	0	2026-07-07 02:56:37.515	2026-07-07 02:56:37.515
36	SUBSCRIPTION_EXPIRED	{"userId": 175, "subscriptionId": "13"}	PENDING	\N	0	2026-07-07 02:56:37.561	2026-07-07 02:56:37.561
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.password_reset_tokens (id, "userId", token, "expiresAt", "usedAt", "createdAt") FROM stdin;
1	1	$2b$12$591BaIqN0o4Bxx9zhqqG7eIZnP/NLjWlQFcwHpkZr3RRriOwraZya	2026-06-16 08:08:38.673	\N	2026-06-16 07:38:38.684
3	5	$2b$12$LoaxrDjPVF013.ilTh18z.Io7DcsFVboPSqFocHZzcgH2JPeMF3Z2	2026-06-28 04:06:02.412	2026-06-28 03:36:36.666	2026-06-28 03:36:02.414
4	5	$2b$12$iZUQCwDDFi8pPFUlNKEyeu.HXej0IE5ZVc9GNKeeKznaXFLxbjDx2	2026-06-28 04:20:03.996	\N	2026-06-28 03:50:03.999
5	5	$2b$12$CXxeOgVKaSk0paKrJVHoROhnnCicGKBQj369gn6Wm35M3X1v42u0e	2026-06-28 04:21:06.162	\N	2026-06-28 03:51:06.164
6	6	$2b$12$Q3oajA86hmlspTTkKzktHuBmD0mjNvql/nYLo5GRnaRXdC4KHj28.	2026-06-28 04:23:02.538	\N	2026-06-28 03:53:02.543
7	6	$2b$12$isKxpRwHxXRaCqCG4EjPj.oX9DfPWHEfTw4UIaihc66zw59v2si1e	2026-06-28 04:25:53.525	\N	2026-06-28 03:55:53.537
8	6	$2b$12$UgE0pTk1VqC8syws9zr2kuZrK5NVIaa74Canlcev/VjySVqHA94tG	2026-06-28 04:53:42.901	\N	2026-06-28 04:23:42.902
9	105	$2b$12$HzhhyvfeNsX9ZhVPD9TG8.t.nESPZErCmSyohq6wDRKgpR8gQdrsi	2026-06-28 05:09:46.234	\N	2026-06-28 04:39:46.313
10	105	$2b$12$qPMqKUjxEoN5..xYPYs7heDgjm8FqLYkaKC5Zp43guyRkB3n0o9tO	2026-06-28 05:25:53.848	\N	2026-06-28 04:55:53.849
11	6	$2b$12$bWYmA2ZPLOOuw8x8nkhTLOmdEYi4XUsp4WEpHVaSRYn8C.gdQwTpa	2026-06-30 02:28:12.552	2026-06-30 01:58:50.031	2026-06-30 01:58:12.554
16	6	$2b$12$KxyaNsKTECLSTKP1djblyu5wm1sD.yDaMKiSfbDmLqOFm44W3rkeu	2026-07-06 02:44:10.892	\N	2026-07-06 02:14:10.902
17	164	$2b$12$XyKjo/y4YnzJ8dzzbZ7HseWSPIt1/vupPZPrNBvGHkqHUzqQutrtm	2026-07-06 03:14:57.843	2026-07-06 02:45:34.426	2026-07-06 02:44:57.859
\.


--
-- Data for Name: payment_webhook_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payment_webhook_logs (id, provider, payload, status, "errorReason", "idempotencyKey", "createdAt") FROM stdin;
13	VIETQR	{"amount": 500000, "invoiceId": "17", "providerId": "BANK_TXN_123"}	PROCESSED	\N	test_webhook_1783392997489	2026-07-07 02:56:37.494
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.permissions (id, module, action, code, description, status, "createdAt", "updatedAt", "deletedAt") FROM stdin;
1	AUTH	CREATE	AUTH:CREATE	Tạo tài khoản	ACTIVE	2026-06-16 07:25:15.712	2026-06-16 07:25:15.712	\N
2	USER	READ	USER:READ	Xem danh sách người dùng	ACTIVE	2026-06-16 07:25:15.722	2026-06-16 07:25:15.722	\N
3	USER	UPDATE	USER:UPDATE	Sửa thông tin người dùng	ACTIVE	2026-06-16 07:25:15.728	2026-06-16 07:25:15.728	\N
4	USER	DELETE	USER:DELETE	Khóa/Xóa người dùng	ACTIVE	2026-06-16 07:25:15.733	2026-06-16 07:25:15.733	\N
5	ROLE	READ	ROLE:READ	Xem vai trò phân quyền	ACTIVE	2026-06-16 07:25:15.739	2026-06-16 07:25:15.739	\N
6	ROLE	UPDATE	ROLE:UPDATE	Cấp/Đổi quyền vai trò	ACTIVE	2026-06-16 07:25:15.744	2026-06-16 07:25:15.744	\N
7	SYSTEM	READ	SYSTEM:READ	Xem nhật ký hệ thống	ACTIVE	2026-06-16 07:25:15.749	2026-06-16 07:25:15.749	\N
8	VIP_SIGNALS	CREATE	VIP_SIGNALS:CREATE	Tạo tín hiệu VIP	ACTIVE	2026-06-16 07:25:15.753	2026-06-16 07:25:15.753	\N
9	VIP_SIGNALS	READ	VIP_SIGNALS:READ	Xem tín hiệu VIP	ACTIVE	2026-06-16 07:25:15.757	2026-06-16 07:25:15.757	\N
10	VIP_SIGNALS	UPDATE	VIP_SIGNALS:UPDATE	Cập nhật tín hiệu VIP	ACTIVE	2026-06-16 07:25:15.762	2026-06-16 07:25:15.762	\N
11	BLOG	CREATE	BLOG:CREATE	Tạo bài viết CMS	ACTIVE	2026-06-16 07:25:15.766	2026-06-16 07:25:15.766	\N
12	BLOG	READ	BLOG:READ	Xem bài viết CMS	ACTIVE	2026-06-16 07:25:15.77	2026-06-16 07:25:15.77	\N
13	BLOG	UPDATE	BLOG:UPDATE	Cập nhật bài viết CMS	ACTIVE	2026-06-16 07:25:15.774	2026-06-16 07:25:15.774	\N
14	REPORT	READ	REPORT:READ	Xem báo cáo chiến lược	ACTIVE	2026-06-16 07:25:15.778	2026-06-16 07:25:15.778	\N
\.


--
-- Data for Name: portfolio_holdings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.portfolio_holdings (id, "portfolioId", "stockId", quantity, "avgEntryPrice", "currentPrice", "createdAt", "updatedAt") FROM stdin;
56	20	38	3000	89500.0000	91200.0000	2026-07-07 02:56:45.043	2026-07-07 02:56:45.043
58	20	42	5000	24200.0000	25800.0000	2026-07-07 02:56:45.047	2026-07-07 02:56:45.047
59	20	37	4000	27800.0000	29150.0000	2026-07-07 02:56:45.048	2026-07-07 02:56:45.048
60	20	45	3000	32000.0000	36500.0000	2026-07-07 02:56:45.048	2026-07-07 02:56:45.048
\.


--
-- Data for Name: portfolio_nav_snapshots; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.portfolio_nav_snapshots (id, "portfolioId", date, nav, "cashBalance", "createdAt") FROM stdin;
10	19	2026-07-06	1005000000.0000	870000000.0000	2026-07-07 02:56:33.716
\.


--
-- Data for Name: price_alerts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.price_alerts (id, "userId", "stockId", condition, "targetValue", notes, status, "lastTriggeredAt", "cooldownMinutes", "createdAt", "updatedAt") FROM stdin;
13	12	60	PRICE_ABOVE	140000.0000	\N	ACTIVE	2026-07-07 03:05:36.284	60	2026-07-07 03:05:36.266	2026-07-07 03:05:36.295
\.


--
-- Data for Name: recommended_portfolios; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.recommended_portfolios (id, name, description, "managerId", status, "minTierAccess", "initialCapital", "currentNav", "cashBalance", "createdAt", "updatedAt", "deletedAt") FROM stdin;
19	Q3 High Growth Portfolio	\N	14	ACTIVE	GOLD	1000000000.0000	1005000000.0000	870000000.0000	2026-07-07 02:56:33.678	2026-07-07 02:56:33.714	\N
20	FinTop Model Portfolio Q2/2026	Danh mục mẫu FinTop — Chiến lược cân bằng tăng trưởng Q2/2026. Tập trung Ngân hàng, Công nghệ, BĐS KCN.	1	ACTIVE	GOLD	1000000000.0000	1085000000.0000	150000000.0000	2026-07-07 02:56:45.039	2026-07-07 02:56:45.039	\N
\.


--
-- Data for Name: report_files; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.report_files (id, "uploaderId", title, "reportType", "fileUrl", "fileSize", status, "minTierAccess", "publishedAt", "createdAt", "updatedAt", "deletedAt") FROM stdin;
1	1	[QA] Báo cáo Tổng quan Thị trường Q2/2026	MARKET_SUMMARY	/assets/reports/qa-market-summary-q2-2026.pdf	245760	PUBLISHED	STANDARD	2026-06-16 07:25:57.6	2026-06-16 07:25:57.601	2026-06-16 07:25:57.601	\N
2	1	[QA] Phân tích Vĩ mô & Chiến lược Danh mục VIP	MACRO_ANALYSIS	/assets/reports/qa-macro-analysis-vip-2026.pdf	512000	PUBLISHED	GOLD	2026-06-16 07:25:57.606	2026-06-16 07:25:57.607	2026-06-16 07:25:57.607	\N
\.


--
-- Data for Name: research_reports; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.research_reports (id, report_type, subject, language, format, title, content, generated_at, metadata_json) FROM stdin;
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.role_permissions ("roleId", "permissionId", "assignedAt", "assignedById") FROM stdin;
1	1	2026-06-23 08:15:29.227	\N
1	2	2026-06-23 08:15:29.249	\N
1	3	2026-06-23 08:15:29.252	\N
1	4	2026-06-23 08:15:29.255	\N
1	5	2026-06-23 08:15:29.259	\N
1	6	2026-06-23 08:15:29.262	\N
1	7	2026-06-23 08:15:29.265	\N
1	8	2026-06-23 08:15:29.267	\N
1	9	2026-06-23 08:15:29.27	\N
1	10	2026-06-23 08:15:29.272	\N
1	11	2026-06-23 08:15:29.277	\N
1	12	2026-06-23 08:15:29.282	\N
1	13	2026-06-23 08:15:29.284	\N
1	14	2026-06-23 08:15:29.287	\N
2	1	2026-06-23 08:15:29.289	\N
2	2	2026-06-23 08:15:29.29	\N
2	3	2026-06-23 08:15:29.292	\N
2	4	2026-06-23 08:15:29.294	\N
2	5	2026-06-23 08:15:29.296	\N
2	6	2026-06-23 08:15:29.298	\N
2	7	2026-06-23 08:15:29.3	\N
2	8	2026-06-23 08:15:29.302	\N
2	9	2026-06-23 08:15:29.304	\N
2	10	2026-06-23 08:15:29.305	\N
2	11	2026-06-23 08:15:29.308	\N
2	12	2026-06-23 08:15:29.31	\N
2	13	2026-06-23 08:15:29.312	\N
2	14	2026-06-23 08:15:29.314	\N
3	2	2026-06-23 08:15:29.316	\N
3	3	2026-06-23 08:15:29.318	\N
3	5	2026-06-23 08:15:29.319	\N
3	9	2026-06-23 08:15:29.323	\N
3	12	2026-06-23 08:15:29.325	\N
3	14	2026-06-23 08:15:29.328	\N
3	7	2026-06-23 08:15:29.33	\N
4	11	2026-06-23 08:15:29.331	\N
4	12	2026-06-23 08:15:29.333	\N
4	13	2026-06-23 08:15:29.335	\N
4	14	2026-06-23 08:15:29.336	\N
4	9	2026-06-23 08:15:29.338	\N
5	11	2026-06-23 08:15:29.339	\N
5	12	2026-06-23 08:15:29.341	\N
5	13	2026-06-23 08:15:29.342	\N
6	11	2026-06-23 08:15:29.344	\N
6	12	2026-06-23 08:15:29.345	\N
7	2	2026-06-23 08:15:29.347	\N
7	9	2026-06-23 08:15:29.349	\N
7	14	2026-06-23 08:15:29.35	\N
8	2	2026-06-23 08:15:29.352	\N
8	9	2026-06-23 08:15:29.353	\N
9	8	2026-06-23 08:15:29.355	\N
9	9	2026-06-23 08:15:29.357	\N
9	10	2026-06-23 08:15:29.36	\N
9	14	2026-06-23 08:15:29.362	\N
10	9	2026-06-23 08:15:29.364	\N
10	14	2026-06-23 08:15:29.366	\N
10	12	2026-06-23 08:15:29.368	\N
11	12	2026-06-23 08:15:29.37	\N
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.roles (id, name, code, description, "isSystem", status, "createdAt", "updatedAt", "deletedAt") FROM stdin;
1	Quản trị viên Cấp cao (Super Admin)	SUPER_ADMIN	\N	t	ACTIVE	2026-06-16 07:25:15.655	2026-06-16 07:25:15.655	\N
2	Tổng Giám Đốc (CEO)	CEO	\N	t	ACTIVE	2026-06-16 07:25:15.661	2026-06-16 07:25:15.661	\N
3	Trợ lý CEO	ASSISTANT_CEO	\N	f	ACTIVE	2026-06-16 07:25:15.665	2026-06-16 07:25:15.665	\N
4	Trưởng phòng Biên tập	EDITOR_ADMIN	\N	f	ACTIVE	2026-06-16 07:25:15.67	2026-06-16 07:25:15.67	\N
5	Biên tập viên Chuyên nghiệp	EDITOR_PRO	\N	f	ACTIVE	2026-06-16 07:25:15.675	2026-06-16 07:25:15.675	\N
6	Biên tập viên	EDITOR	\N	f	ACTIVE	2026-06-16 07:25:15.679	2026-06-16 07:25:15.679	\N
7	Trưởng khối Môi giới	SALE_ADMIN	\N	f	ACTIVE	2026-06-16 07:25:15.683	2026-06-16 07:25:15.683	\N
8	Chuyên viên Môi giới	SALE	\N	f	ACTIVE	2026-06-16 07:25:15.688	2026-06-16 07:25:15.688	\N
9	Chuyên gia Cố vấn	EXPERT	\N	f	ACTIVE	2026-06-16 07:25:15.693	2026-06-16 07:25:15.693	\N
10	Khách hàng VIP	CLIENT_VIP	\N	f	ACTIVE	2026-06-16 07:25:15.698	2026-06-16 07:25:15.698	\N
11	Khách hàng Tiêu chuẩn	CLIENT	\N	f	ACTIVE	2026-06-16 07:25:15.703	2026-06-16 07:25:15.703	\N
\.


--
-- Data for Name: sector_rotation_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sector_rotation_history (id, trade_date, sector_code, sector_name, return_1d, return_1w, return_1m, return_3m, return_6m, return_ytd, relative_strength, rank_1m, rank_3m, created_at) FROM stdin;
\.


--
-- Data for Name: sectors; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sectors (id, name, code, description, status, "createdAt", "updatedAt", "deletedAt") FROM stdin;
1	Tài chính	FINANCE	\N	ACTIVE	2026-06-16 07:25:31.917	2026-06-16 07:25:31.917	\N
3	Bất động sản	REALESTATE	\N	ACTIVE	2026-06-16 07:25:31.948	2026-06-16 07:25:31.948	\N
4	Công nghiệp	INDUSTRIAL	\N	ACTIVE	2026-06-16 07:25:31.957	2026-06-16 07:25:31.957	\N
5	Tiêu dùng	CONSUMER	\N	ACTIVE	2026-06-16 07:25:31.972	2026-06-16 07:25:31.972	\N
6	Năng lượng	ENERGY	\N	ACTIVE	2026-06-16 07:25:31.983	2026-06-16 07:25:31.983	\N
7	Vận tải	TRANSPORT	\N	ACTIVE	2026-06-16 07:25:31.988	2026-06-16 07:25:31.988	\N
8	Y tế	HEALTHCARE	\N	ACTIVE	2026-06-16 07:25:31.996	2026-06-16 07:25:31.996	\N
9	Đa ngành	DEFAULT	\N	ACTIVE	2026-06-16 07:25:39.09	2026-06-16 07:25:39.09	\N
22	Technology	TECH	\N	ACTIVE	2026-07-07 03:05:26.11	2026-07-07 03:05:26.11	\N
\.


--
-- Data for Name: signal_execution_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.signal_execution_logs (id, "signalId", "fromStatus", "toStatus", "triggerPrice", reason, "executedAt") FROM stdin;
\.


--
-- Data for Name: signal_targets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.signal_targets (id, "signalId", price, "targetIndex", "isHit", "hitAt") FROM stdin;
75	75	155000.0000	1	f	\N
70	70	105000.0000	1	f	\N
71	71	34000.0000	1	f	\N
72	72	30000.0000	1	f	\N
73	73	38000.0000	1	t	2026-07-07 02:56:45.027
74	74	28000.0000	1	f	\N
\.


--
-- Data for Name: stock_exchanges; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stock_exchanges (id, code, name, status, "createdAt", "updatedAt") FROM stdin;
1	HOSE	Sở Giao dịch Chứng khoán TP.HCM	ACTIVE	2026-06-16 07:25:31.892	2026-06-16 07:25:31.892
2	HNX	Sở Giao dịch Chứng khoán Hà Nội	ACTIVE	2026-06-16 07:25:31.906	2026-06-16 07:25:31.906
3	UPCOM	Thị trường UPCoM	ACTIVE	2026-06-16 07:25:31.91	2026-06-16 07:25:31.91
\.


--
-- Data for Name: stock_prices_daily; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stock_prices_daily (id, "stockId", date, open, high, low, close, volume, "adjClose", "createdAt") FROM stdin;
37	60	2026-07-07	130000.0000	132000.0000	129000.0000	131500.0000	1500000	\N	2026-07-07 03:05:26.144
\.


--
-- Data for Name: stocks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stocks (id, symbol, "companyName", "exchangeId", "industryId", status, isin, description, "createdAt", "updatedAt", "deletedAt", act, analyst, identify_trend, "order", resistance_range, rsi_mfi, support_range, top_status, trading_price_range) FROM stdin;
21	VEA	VEA	3	18	ACTIVE	\N	\N	2026-06-16 07:25:39.107	2026-07-07 03:32:37.385	\N	RẤT TÍCH CỰC	Đình Hải	Mẫu nến đi ngang tăng nhẹ.	16	38 - 42	TĂNG MẠNH	33	1	34 - 34.5
22	DST	DST	2	18	ACTIVE	\N	\N	2026-06-16 07:25:39.115	2026-07-07 03:32:37.387	\N	TÍCH CỰC	Đình Hải	Mẫu nến suy giảm chạm hỗ trợ MA200.	17	9.9 - 10.2 - 10.7	TĂNG	21	1	9.3 - 9.5
23	DGW	DGW	1	18	ACTIVE	\N	\N	2026-06-16 07:25:39.122	2026-07-07 03:32:37.388	\N	KHẢ QUAN	Đình Hải	Mẫu nến đi ngang trên hỗ trợ MA50.	18	48 - 50 - 52	TĂNG DẦN	18	1	45.5 - 46.5
8	MWG	CTCP Đầu tư Thế Giới Di Động	1	12	ACTIVE	\N	\N	2026-06-16 07:25:32.03	2026-07-07 03:32:37.389	\N	TRUNG LẬP	Đình Hải	Mẫu nến suy giảm.	19	—	GIẢM DẦN	—	1	85 - 86
19	PNJ	CTCP Vàng bạc Đá quý Phú Nhuận	1	12	ACTIVE	\N	\N	2026-06-16 07:25:32.054	2026-07-07 03:32:37.39	\N	KO TÍCH CỰC	Đình Hải	Mẫu hình 2 đỉnh, nếu suy giảm.	20	—	GIẢM	—	1	114 - 117
26	SHS	FRT	2	2	ACTIVE	\N	\N	2026-06-16 07:25:39.135	2026-07-07 03:32:37.391	\N	TIÊU CỰC	Đình Hải	Mẫu suy giảm.	22	—	—	—	1	158 - 160
7	MSN	CTCP Tập đoàn Masan	1	12	ACTIVE	\N	\N	2026-06-16 07:25:32.028	2026-07-07 03:32:37.391	\N	TRUNG LẬP	Đình Hải	Kênh xu hướng giảm.	23	—	—	—	1	75 - 76
16	PLX	Tập đoàn Xăng Dầu Việt Nam	1	12	ACTIVE	\N	\N	2026-06-16 07:25:32.048	2026-07-07 03:32:37.391	\N	TRUNG LẬP	Đình Hải	Mẫu nến giảm ngắn, chạm hỗ trợ MA5.	24	—	—	—	1	64 - 65.5
47	GAS	Tổng CTCP Khí Việt Nam	1	10	ACTIVE	\N	\N	2026-06-23 06:31:26.735	2026-07-07 03:32:37.38	\N	TRUNG LẬP	\N		7	36750	SIDEWAY	33250	0	34300 - 35350
46	VND	CTCP Chứng khoán VNDirect	1	2	ACTIVE	\N	\N	2026-06-23 06:31:26.73	2026-07-07 03:32:37.381	\N	TRUNG LẬP	\N		8	36750	SIDEWAY	33250	0	34300 - 35350
60	FPT	FPT Corporation	1	49	ACTIVE	\N	\N	2026-07-07 03:05:26.125	2026-07-07 03:32:37.382	\N	\N	\N	\N	9	\N	\N	\N	0	\N
40	VIC	Tập đoàn Vingroup	1	6	ACTIVE	\N	\N	2026-06-23 06:31:26.698	2026-07-07 03:32:37.382	\N	TRUNG LẬP	\N		10	36750	SIDEWAY	33250	0	34300 - 35350
39	VHM	CTCP Vinhomes	1	6	ACTIVE	\N	\N	2026-06-23 06:31:26.696	2026-07-07 03:32:37.383	\N	TRUNG LẬP	\N		11	36750	SIDEWAY	33250	0	34300 - 35350
41	TCB	NH TMCP Kỹ Thương Việt Nam	1	1	ACTIVE	\N	\N	2026-06-23 06:31:26.708	2026-07-07 03:32:37.383	\N	TRUNG LẬP	\N		12	36750	SIDEWAY	33250	0	34300 - 35350
42	MBB	NH TMCP Quân Đội	1	1	ACTIVE	\N	\N	2026-06-23 06:31:26.713	2026-07-07 03:32:37.384	\N	TRUNG LẬP	\N		13	36750	SIDEWAY	33250	0	34300 - 35350
43	VPB	NH TMCP Việt Nam Thịnh Vượng	1	1	ACTIVE	\N	\N	2026-06-23 06:31:26.718	2026-07-07 03:32:37.384	\N	TRUNG LẬP	\N		14	36750	SIDEWAY	33250	0	34300 - 35350
44	ACB	NH TMCP Á Châu	1	1	ACTIVE	\N	\N	2026-06-23 06:31:26.722	2026-07-07 03:32:37.384	\N	TRUNG LẬP	\N		15	36750	SIDEWAY	33250	0	34300 - 35350
38	VCB	NH TMCP Ngoại thương Việt Nam	1	1	ACTIVE	\N	\N	2026-06-23 06:31:26.692	2026-07-07 03:32:37.39	\N	TRUNG LẬP	\N		21	95760	SIDEWAY	86640	0	89376 - 92112
29	PET	PET	1	12	ACTIVE	\N	\N	2026-06-16 07:25:39.145	2026-07-07 03:32:37.392	\N	TRUNG LẬP	Đình Hải	Mẫu nến đi ngang tích lũy, kênh xu hướng tăng.	25	—	—	—	1	39 - 40
30	BVH	BVH	1	3	ACTIVE	\N	\N	2026-06-16 07:25:39.148	2026-07-07 03:32:37.393	\N	TRUNG LẬP	Đình Hải	Mẫu nến giảm, thủng hỗ trợ MA20.	26	—	—	—	1	75.5 - 76.5
31	BIC	BIC	1	3	ACTIVE	\N	\N	2026-06-16 07:25:39.152	2026-07-07 03:32:37.394	\N	TRUNG LẬP	Đình Hải	Mẫu nến đi ngang.	27	—	—	—	1	23 - 24.5
48	VJC	CTCP Hàng không VietJet	1	15	ACTIVE	\N	\N	2026-06-23 06:31:26.743	2026-07-07 03:32:37.372	\N	TRUNG LẬP	\N		2	36750	SIDEWAY	33250	0	34300 - 35350
36	VNM	CTCP Sữa Việt Nam (Vinamilk)	1	11	ACTIVE	\N	\N	2026-06-23 06:31:26.681	2026-07-07 03:32:37.374	\N	TRUNG LẬP	\N		3	36750	SIDEWAY	33250	0	34300 - 35350
49	HVN	Tổng CTCP Hàng không Việt Nam	1	15	ACTIVE	\N	\N	2026-06-23 06:31:26.746	2026-07-07 03:32:37.375	\N	TRUNG LẬP	\N		4	36750	SIDEWAY	33250	0	34300 - 35350
37	HPG	CTCP Tập đoàn Hòa Phát	1	8	ACTIVE	\N	\N	2026-06-23 06:31:26.686	2026-07-07 03:32:37.376	\N	KHẢ QUAN	FinTop DATA		5	30608	UPTREND	27693	0	28567 - 29442
45	SSI	CTCP Chứng khoán SSI	1	2	ACTIVE	\N	\N	2026-06-23 06:31:26.727	2026-07-07 03:32:37.376	\N	TRUNG LẬP	\N		6	36750	SIDEWAY	33250	0	34300 - 35350
50	DHG	CTCP Dược Hậu Giang	1	17	ACTIVE	\N	\N	2026-06-23 06:31:26.754	2026-07-07 06:22:46.655	\N		\N		1	36750	SIDEWAY	33250	0	34300 - 35350
\.


--
-- Data for Name: subscription_plans; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.subscription_plans (id, name, description, "tierLevel", price, currency, "durationDays", status, "createdAt", "updatedAt", "deletedAt", features) FROM stdin;
3	V.I.P	Gói V.I.P - Full PRO + Copy Trade Chuyên gia + Kết nối Chuyên gia	GOLD	5000000.0000	VND	180	ACTIVE	2026-06-16 07:25:32.206	2026-07-14 09:15:18.969	\N	Đặc quyền PRO;Kết nối Chuyên gia;Phân tích Chuyên gia
4	Diamond	Gói Diamond - Full V.I.P + Cố vấn 1-1 Chuyên gia	DIAMOND	8000000.0000	VND	365	ACTIVE	2026-06-16 07:25:32.21	2026-07-14 09:15:44.257	\N	Đặc quyền V.I.P;Đặc quyền PRO;Cố vấn 1-1 Chuyên gia
1	Standard	Gói Standard - Truy cập tra cứu cổ phiếu và dữ liệu nền	STANDARD	0.0000	VND	365	ACTIVE	2026-06-16 07:25:32.14	2026-07-07 09:00:11.463	\N	Tra cứu cổ phiếu;Phân tích cơ bản;Tool & dữ liệu cơ bản
16	PRO1	Gói PRO 3 tháng - Bộ lọc chuyên nghiệp, PRO Data & Research	SILVER	1500000.0000	VND	90	ACTIVE	2026-07-07 04:12:58.693	2026-07-14 06:53:23.147	\N	Bộ lọc cổ phiếu chuyên nghiệp;Pro Research;Pro Data
17	PRO2	Gói PRO 6 tháng - Bộ lọc chuyên nghiệp, PRO Data & Research	SILVER	2500000.0000	VND	180	ACTIVE	2026-07-07 04:12:58.763	2026-07-14 07:23:11.803	\N	Bộ lọc cổ phiếu chuyên nghiệp;Pro Research;Pro Data
18	PRO3	Gói PRO 12 tháng - Bộ lọc chuyên nghiệp, PRO Data & Research	SILVER	4500000.0000	VND	365	ACTIVE	2026-07-07 04:12:58.766	2026-07-14 07:23:31.951	\N	Bộ lọc cổ phiếu chuyên nghiệp;Pro Research;Pro Data
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tags (id, slug, name, "createdAt") FROM stdin;
\.


--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.teams (id, name, code, "departmentId", "leaderId", description, status, "createdAt", "updatedAt", "deletedAt") FROM stdin;
1	Team Kinh doanh Alpha	SALE_ALPHA	2	\N	Team khách hàng VIP	ACTIVE	2026-06-16 07:25:15.639	2026-06-16 07:25:15.639	\N
2	Team Kinh doanh Beta	SALE_BETA	2	\N	Team khách hàng đại chúng	ACTIVE	2026-06-16 07:25:15.646	2026-06-16 07:25:15.646	\N
3	Team BOJE	BOJE	1	\N	\N	ACTIVE	2026-06-29 10:14:20.223	2026-06-29 10:14:20.223	\N
4	Team BF14	BF14	2	\N	\N	ACTIVE	2026-06-29 10:14:20.261	2026-06-29 10:14:20.261	\N
5	Team 5016	5016	2	\N	\N	ACTIVE	2026-06-29 10:14:20.263	2026-06-29 10:14:20.263	\N
6	Team 8043	8043	2	\N	\N	ACTIVE	2026-06-29 10:14:20.264	2026-06-29 10:14:20.264	\N
7	Team BSPE	BSPE	2	\N	\N	ACTIVE	2026-06-29 10:14:20.266	2026-06-29 10:14:20.266	\N
8	Team 6061	6061	2	\N	\N	ACTIVE	2026-06-29 10:14:20.268	2026-06-29 10:14:20.268	\N
9	Team BPJ4	BPJ4	2	\N	\N	ACTIVE	2026-06-29 10:14:20.27	2026-06-29 10:14:20.27	\N
10	Team BSVA	BSVA	2	\N	\N	ACTIVE	2026-06-29 10:14:20.272	2026-06-29 10:14:20.272	\N
11	Team F000	F000	1	\N	\N	ACTIVE	2026-06-29 10:20:59.699	2026-06-29 10:20:59.699	\N
12	Team BOCR	BOCR	2	\N	\N	ACTIVE	2026-06-29 10:20:59.741	2026-06-29 10:20:59.741	\N
13	Team Đào Thị Ngọc Anh	FBE1	1	\N	\N	ACTIVE	2026-06-29 10:53:08.487	2026-06-29 10:53:08.487	\N
14	Team Nguyễn Minh Hạnh	5654	3	\N	\N	ACTIVE	2026-06-29 10:53:08.501	2026-06-29 10:53:08.501	\N
15	Team Nguyễn Như Quỳnh	BJF5	2	\N	\N	ACTIVE	2026-06-29 10:53:08.502	2026-06-29 10:53:08.502	\N
16	Team Nguyễn Duy An	B8W5	2	\N	\N	ACTIVE	2026-06-29 10:53:08.503	2026-06-29 10:53:08.503	\N
17	Team Hoàng Thị Dịu	BM85	2	\N	\N	ACTIVE	2026-06-29 10:53:08.504	2026-06-29 10:53:08.504	\N
18	Team Vũ Hoàng Duy	BLH5	2	\N	\N	ACTIVE	2026-06-29 10:53:08.505	2026-06-29 10:53:08.505	\N
19	Team Lê Đình Đức	BJYE	2	\N	\N	ACTIVE	2026-06-29 10:53:08.506	2026-06-29 10:53:08.506	\N
20	Team Nguyễn Thuận Khang	BJZ5	2	\N	\N	ACTIVE	2026-06-29 10:53:08.508	2026-06-29 10:53:08.508	\N
21	Team Phan Nữ Đan Nhi	BNSZ	2	\N	\N	ACTIVE	2026-06-29 10:53:08.509	2026-06-29 10:53:08.509	\N
22	Team nguyen bach dat	F003	2	\N	\N	ACTIVE	2026-06-29 10:53:08.51	2026-06-29 10:53:08.51	\N
23	Team Đoàn Phương Hạnh	BR9J	2	\N	\N	ACTIVE	2026-06-29 10:53:08.513	2026-06-29 10:53:08.513	\N
24	Team Nguyễn Lê Phương Mai	BSFD	2	\N	\N	ACTIVE	2026-06-29 10:53:08.514	2026-06-29 10:53:08.514	\N
25	Team Nguyễn Thị Ngọc	BKW4	2	\N	\N	ACTIVE	2026-06-29 10:53:08.515	2026-06-29 10:53:08.515	\N
26	Team Nguyễn Mai Thy	BSQW	2	\N	\N	ACTIVE	2026-06-29 10:53:08.516	2026-06-29 10:53:08.516	\N
27	Team Ngô Sơn Tùng	BST8	2	\N	\N	ACTIVE	2026-06-29 10:53:08.517	2026-06-29 10:53:08.517	\N
28	Team Nguyễn Thị Thùy Giang	BN72	2	\N	\N	ACTIVE	2026-06-29 10:53:08.518	2026-06-29 10:53:08.518	\N
29	Team Vũ Thành Long	BSFB	2	\N	\N	ACTIVE	2026-06-29 10:53:08.519	2026-06-29 10:53:08.519	\N
30	Team Hồ Phú Thịnh	FTJ	2	\N	\N	ACTIVE	2026-06-29 10:53:08.52	2026-06-29 10:53:08.52	\N
31	Team Dương Như Ngọc	BSYA	2	\N	\N	ACTIVE	2026-06-29 10:53:08.521	2026-06-29 10:53:08.521	\N
32	Team Nguyễn Thị Phương Anh	BSXA	2	\N	\N	ACTIVE	2026-06-29 10:53:08.523	2026-06-29 10:53:08.523	\N
33	Team Lã Yến Nhi	BT4O	2	\N	\N	ACTIVE	2026-06-29 10:53:08.524	2026-06-29 10:53:08.524	\N
34	Team Nguyễn Minh Dương	BTLT	2	\N	\N	ACTIVE	2026-06-29 10:53:08.525	2026-06-29 10:53:08.525	\N
35	Team Nguyễn Thị Liễu	BTRN	2	\N	\N	ACTIVE	2026-06-29 10:53:08.526	2026-06-29 10:53:08.526	\N
36	Team Nguyễn Trường Giang	BTK7	2	\N	\N	ACTIVE	2026-06-29 10:53:08.527	2026-06-29 10:53:08.527	\N
37	Team Lê Hà Trang	BSZD	2	\N	\N	ACTIVE	2026-06-29 10:53:08.528	2026-06-29 10:53:08.528	\N
38	Team Trần Thị Phương Loan	BTRW	2	\N	\N	ACTIVE	2026-06-29 10:53:08.53	2026-06-29 10:53:08.53	\N
39	Team Phạm Thị Ngọc Thu	ST77	2	\N	\N	ACTIVE	2026-06-29 10:53:08.53	2026-06-29 10:53:08.53	\N
40	Team Trịnh Thành Nguyễn	BW4D	2	\N	\N	ACTIVE	2026-06-29 10:53:08.532	2026-06-29 10:53:08.532	\N
41	Team Trần Tuấn Nam	FNH1	2	\N	\N	ACTIVE	2026-06-29 10:53:08.533	2026-06-29 10:53:08.533	\N
42	Team Nguyễn Văn Tuấn	6043	1	\N	\N	ACTIVE	2026-06-29 10:53:08.534	2026-06-29 10:53:08.534	\N
43	Team Đoàn Nguyễn Trí	BWP5	1	\N	\N	ACTIVE	2026-06-29 10:53:08.535	2026-06-29 10:53:08.535	\N
44	Team BW9B	BW9B	2	\N	\N	ACTIVE	2026-07-02 09:39:38.815	2026-07-02 09:39:38.815	\N
58	Team Đào Thị Ngọc Anh	F861	2	\N	\N	ACTIVE	2026-07-06 11:26:27.416	2026-07-06 11:26:27.416	\N
59	Team Nguyễn Như Quỳnh	BJFS	2	\N	\N	ACTIVE	2026-07-06 11:26:27.416	2026-07-06 11:26:27.416	\N
60	Team Nguyễn Duy An	BEW5	2	\N	\N	ACTIVE	2026-07-06 11:26:27.416	2026-07-06 11:26:27.416	\N
61	Team Hoàng Thị Dịu	BM35	2	\N	\N	ACTIVE	2026-07-06 11:26:27.416	2026-07-06 11:26:27.416	\N
62	Team Vũ Hoàng Duy	BLHG	2	\N	\N	ACTIVE	2026-07-06 11:26:27.416	2026-07-06 11:26:27.416	\N
63	Team Nguyễn Thuận Khang	BJ2S	2	\N	\N	ACTIVE	2026-07-06 11:26:27.416	2026-07-06 11:26:27.416	\N
64	Team Đoàn Phương Hạnh	BRRU	2	\N	\N	ACTIVE	2026-07-06 11:26:27.416	2026-07-06 11:26:27.416	\N
65	Team Nguyễn Lê Phương Mai	BSPD	2	\N	\N	ACTIVE	2026-07-06 11:26:27.416	2026-07-06 11:26:27.416	\N
66	Team Nguyễn Thị Ngọc	BRN4	2	\N	\N	ACTIVE	2026-07-06 11:26:27.416	2026-07-06 11:26:27.416	\N
67	Team Ngô Sơn Tùng	Số điện thoại	2	\N	\N	ACTIVE	2026-07-06 11:26:27.416	2026-07-06 11:26:27.416	\N
68	Team Nguyễn Thị Thùy Giang	BN32	2	\N	\N	ACTIVE	2026-07-06 11:26:27.416	2026-07-06 11:26:27.416	\N
69	Team Vũ Thành Long	BSPB	2	\N	\N	ACTIVE	2026-07-06 11:26:27.416	2026-07-06 11:26:27.416	\N
70	Team Hồ Phú Thịnh	BTJJ	2	\N	\N	ACTIVE	2026-07-06 11:26:27.416	2026-07-06 11:26:27.416	\N
71	Team Phạm Thị Ngọc Thu	5777	2	\N	\N	ACTIVE	2026-07-06 11:26:27.416	2026-07-06 11:26:27.416	\N
72	Team Trung Thành Nguyễn	BW4O	2	\N	\N	ACTIVE	2026-07-06 11:26:27.416	2026-07-06 11:26:27.416	\N
73	Team Trần Tuấn Nam	F101	2	\N	\N	ACTIVE	2026-07-06 11:26:27.416	2026-07-06 11:26:27.416	\N
74	Team Đoàn Nguyên Trí	BWF6	2	\N	\N	ACTIVE	2026-07-06 11:26:27.416	2026-07-06 11:26:27.416	\N
75	Team S? di?n tho?i	S? di?n tho?i	2	\N	\N	ACTIVE	2026-07-14 04:02:55.92	2026-07-14 04:02:55.92	\N
76	Team TEST123	TEST123	2	\N	\N	ACTIVE	2026-07-14 04:04:54.239	2026-07-14 04:04:54.239	\N
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.transactions (id, "invoiceId", provider, "providerId", amount, currency, status, "errorMessage", "createdAt", "updatedAt") FROM stdin;
2	6	MANUAL	manual_sim_tx_1782187914828	9500000.0000	VND	SUCCESS	\N	2026-06-23 04:11:54.859	2026-06-23 04:11:54.859
5	10	MANUAL	manual_sim_tx_1782198719740	1500000.0000	VND	SUCCESS	\N	2026-06-23 07:12:01.412	2026-06-23 07:12:01.412
6	5	MANUAL	manual_sim_tx_1782370453913	3500000.0000	VND	SUCCESS	\N	2026-06-25 06:54:13.931	2026-06-25 06:54:13.931
13	17	VIETQR	BANK_TXN_123	500000.0000	VND	SUCCESS	\N	2026-07-07 02:56:37.498	2026-07-07 02:56:37.498
14	4	MANUAL	manual_admin_1_1783397709343	1500000.0000	VND	SUCCESS	\N	2026-07-07 04:15:09.353	2026-07-07 04:15:09.353
15	20	MANUAL	manual_admin_1_1783397745187	8000000.0000	VND	SUCCESS	\N	2026-07-07 04:15:45.187	2026-07-07 04:15:45.187
16	18	MANUAL	manual_admin_1_1783397763354	1500000.0000	VND	SUCCESS	\N	2026-07-07 04:16:03.355	2026-07-07 04:16:03.355
17	21	MANUAL	manual_admin_1_1783414078728	8000000.0000	VND	SUCCESS	\N	2026-07-07 08:47:58.731	2026-07-07 08:47:58.731
18	22	MANUAL	manual_admin_6_1783997914902	8000000.0000	VND	SUCCESS	\N	2026-07-14 02:58:34.903	2026-07-14 02:58:34.903
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_roles ("userId", "roleId", "assignedAt", "assignedById") FROM stdin;
1	1	2026-06-16 07:25:15.89	1
5	11	2026-06-23 02:44:34.849	5
16	11	2026-06-23 03:03:20.1	16
21	2	2026-06-23 08:15:29.508	\N
22	3	2026-06-23 08:15:29.521	\N
23	4	2026-06-23 08:15:29.531	\N
24	5	2026-06-23 08:15:29.54	\N
10	6	2026-06-23 08:15:29.552	\N
26	7	2026-06-23 08:15:29.562	\N
27	8	2026-06-23 08:15:29.631	\N
14	9	2026-06-23 08:15:29.64	\N
30	11	2026-06-25 02:55:47.124	1
6	1	2026-07-01 00:35:45.434	6
37	10	2026-06-25 02:56:42.311	1
121	2	2026-07-06 11:26:27.416	121
122	2	2026-07-06 11:26:27.416	122
40	10	2026-06-25 02:56:42.322	1
166	8	2026-07-06 11:26:27.416	166
6	2	2026-07-06 11:26:27.416	6
156	2	2026-07-06 11:26:27.416	156
47	10	2026-06-25 02:56:42.352	1
175	11	2026-07-14 02:57:04.062	1
52	10	2026-06-25 02:56:42.377	1
164	11	2026-07-14 03:30:20.667	6
54	10	2026-06-25 02:56:42.386	1
167	8	2026-07-14 03:47:52.562	6
155	1	2026-07-14 04:05:55.441	6
59	10	2026-06-25 02:56:42.408	1
75	10	2026-06-25 02:56:42.483	1
76	10	2026-06-25 02:56:42.487	1
86	10	2026-06-25 02:56:42.522	1
93	10	2026-06-25 02:56:42.546	1
97	10	2026-06-25 02:56:42.559	1
99	10	2026-06-25 02:56:42.566	1
108	11	2026-06-28 04:27:04.14	108
111	7	2026-06-29 10:14:20.42	\N
112	8	2026-06-29 10:14:20.423	\N
113	7	2026-06-29 10:14:20.428	\N
114	1	2026-06-29 10:14:20.432	\N
116	8	2026-06-29 10:14:20.44	\N
117	8	2026-06-29 10:14:20.442	\N
110	2	2026-06-29 10:53:08.557	\N
110	1	2026-06-29 10:53:08.558	\N
105	2	2026-06-29 10:53:08.56	\N
120	8	2026-06-29 10:53:08.563	\N
121	3	2026-06-29 10:53:08.568	\N
122	3	2026-06-29 10:53:08.571	\N
123	5	2026-06-29 10:53:08.573	\N
123	8	2026-06-29 10:53:08.574	\N
124	8	2026-06-29 10:53:08.576	\N
125	8	2026-06-29 10:53:08.578	\N
126	8	2026-06-29 10:53:08.58	\N
127	8	2026-06-29 10:53:08.581	\N
128	8	2026-06-29 10:53:08.583	\N
129	8	2026-06-29 10:53:08.584	\N
130	7	2026-06-29 10:53:08.586	\N
131	8	2026-06-29 10:53:08.588	\N
132	8	2026-06-29 10:53:08.589	\N
133	8	2026-06-29 10:53:08.591	\N
134	5	2026-06-29 10:53:08.592	\N
134	7	2026-06-29 10:53:08.593	\N
135	8	2026-06-29 10:53:08.594	\N
136	8	2026-06-29 10:53:08.598	\N
137	8	2026-06-29 10:53:08.6	\N
138	8	2026-06-29 10:53:08.601	\N
139	8	2026-06-29 10:53:08.603	\N
140	8	2026-06-29 10:53:08.604	\N
141	8	2026-06-29 10:53:08.606	\N
142	8	2026-06-29 10:53:08.608	\N
143	8	2026-06-29 10:53:08.61	\N
144	8	2026-06-29 10:53:08.611	\N
145	8	2026-06-29 10:53:08.614	\N
146	8	2026-06-29 10:53:08.616	\N
147	8	2026-06-29 10:53:08.618	\N
148	8	2026-06-29 10:53:08.62	\N
149	8	2026-06-29 10:53:08.622	\N
150	8	2026-06-29 10:53:08.624	\N
151	8	2026-06-29 10:53:08.625	\N
152	8	2026-06-29 10:53:08.627	\N
153	8	2026-06-29 10:53:08.628	\N
154	8	2026-06-29 10:53:08.629	\N
156	3	2026-06-29 10:53:08.631	\N
31	11	2026-06-29 13:20:25.005	\N
32	11	2026-06-29 13:20:25.014	\N
33	11	2026-06-29 13:20:25.019	\N
34	11	2026-06-29 13:20:25.024	\N
35	11	2026-06-29 13:20:25.028	\N
36	11	2026-06-29 13:20:25.032	\N
37	11	2026-06-29 13:20:25.046	\N
38	11	2026-06-29 13:20:25.05	\N
39	11	2026-06-29 13:20:25.054	\N
40	11	2026-06-29 13:20:25.059	\N
41	11	2026-06-29 13:20:25.064	\N
42	11	2026-06-29 13:20:25.07	\N
43	11	2026-06-29 13:20:25.074	\N
44	11	2026-06-29 13:20:25.079	\N
45	11	2026-06-29 13:20:25.083	\N
46	11	2026-06-29 13:20:25.087	\N
47	11	2026-06-29 13:20:25.091	\N
48	11	2026-06-29 13:20:25.094	\N
49	11	2026-06-29 13:20:25.098	\N
50	11	2026-06-29 13:20:25.1	\N
51	11	2026-06-29 13:20:25.103	\N
52	11	2026-06-29 13:20:25.107	\N
53	11	2026-06-29 13:20:25.11	\N
54	11	2026-06-29 13:20:25.114	\N
55	11	2026-06-29 13:20:25.117	\N
56	11	2026-06-29 13:20:25.121	\N
57	11	2026-06-29 13:20:25.124	\N
58	11	2026-06-29 13:20:25.128	\N
59	11	2026-06-29 13:20:25.132	\N
60	11	2026-06-29 13:20:25.135	\N
61	11	2026-06-29 13:20:25.137	\N
62	11	2026-06-29 13:20:25.141	\N
63	11	2026-06-29 13:20:25.144	\N
64	11	2026-06-29 13:20:25.148	\N
65	11	2026-06-29 13:20:25.153	\N
66	11	2026-06-29 13:20:25.158	\N
67	11	2026-06-29 13:20:25.164	\N
68	11	2026-06-29 13:20:25.169	\N
69	11	2026-06-29 13:20:25.174	\N
70	11	2026-06-29 13:20:25.179	\N
71	11	2026-06-29 13:20:25.186	\N
72	11	2026-06-29 13:20:25.19	\N
73	11	2026-06-29 13:20:25.192	\N
74	11	2026-06-29 13:20:25.196	\N
75	11	2026-06-29 13:20:25.199	\N
76	11	2026-06-29 13:20:25.204	\N
77	11	2026-06-29 13:20:25.207	\N
78	11	2026-06-29 13:20:25.21	\N
79	11	2026-06-29 13:20:25.214	\N
80	11	2026-06-29 13:20:25.218	\N
81	11	2026-06-29 13:20:25.223	\N
82	11	2026-06-29 13:20:25.227	\N
83	11	2026-06-29 13:20:25.231	\N
84	11	2026-06-29 13:20:25.234	\N
85	11	2026-06-29 13:20:25.239	\N
86	11	2026-06-29 13:20:25.241	\N
87	11	2026-06-29 13:20:25.246	\N
88	11	2026-06-29 13:20:25.25	\N
89	11	2026-06-29 13:20:25.255	\N
90	11	2026-06-29 13:20:25.261	\N
91	11	2026-06-29 13:20:25.268	\N
92	11	2026-06-29 13:20:25.273	\N
93	11	2026-06-29 13:20:25.276	\N
94	11	2026-06-29 13:20:25.28	\N
95	11	2026-06-29 13:20:25.282	\N
96	11	2026-06-29 13:20:25.286	\N
97	11	2026-06-29 13:20:25.289	\N
98	11	2026-06-29 13:20:25.294	\N
99	11	2026-06-29 13:20:25.298	\N
100	11	2026-06-29 13:20:25.301	\N
101	11	2026-06-29 13:20:25.304	\N
102	11	2026-06-29 13:20:25.309	\N
103	11	2026-06-29 13:20:25.313	\N
\.


--
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_sessions (id, "userId", "refreshToken", "ipAddress", "userAgent", "expiresAt", "isRevoked", "createdAt") FROM stdin;
1	1	$2b$12$fLEK07RcyeNCf8.2C.aDFe6QUCF3vcQUyEQazVYWQClDIKO/ZSxoi	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-23 08:21:18.154	f	2026-06-16 08:21:18.382
2	1	$2b$12$N4WrbO.TmJCsU2X1ARYEFu8VDOcGbmpJcSMAqdiBaKmX964Fw6Ly.	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36	2026-06-23 08:21:49.525	f	2026-06-16 08:21:49.746
3	1	$2b$12$9TUcYxmfJgw9RzuYQwxP7.9yzlnah4nKWhdO.ANJwUw54qzSYalyi	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36	2026-06-23 08:21:55.739	f	2026-06-16 08:21:55.943
83	6	$2b$12$7tPatUAJJKBJYNyaNjoetetlfmFzNxe/ppgDHTZK6ad3cQJjVf.y.	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-07 07:14:26.391	f	2026-06-30 07:14:26.64
5	1	$2b$12$8drVH3ZHcrX9JOvrvso.HuP7Pdt1yeJ5NENfFDQr9AxztnafxJTXm	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-30 03:50:12.17	f	2026-06-23 03:50:12.407
6	1	$2b$12$sBePJrMwRgwjKvVfidmecux0BuKXcUMtV.wpH6ZswTniBiHy0WgoK	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-30 03:53:59.351	t	2026-06-23 03:53:59.574
7	1	$2b$12$Seprn8zvMx7EumEt3synK.Zkdx3r0.azhuRtX8BRu1sZJBdlPtumS	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-30 04:02:46.614	t	2026-06-23 04:02:46.836
11	1	$2b$12$5BTR6/CYvfVrTOeiIWikAueHs98oeWZOrrw5pDlMxpx7IHMmsXky.	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-06-30 07:09:56.072	f	2026-06-23 07:09:56.335
12	1	$2b$12$ABTNHp5wurqLSFmIQp2ULO9rSnAFkgMVBtRpfBWj9zxjQccaB7qD.	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-06-30 07:09:59.563	f	2026-06-23 07:09:59.783
13	1	$2b$12$I8vY3pVdr2TRqMgTmriiLOwYFWofAidvfMwMDUpAl.XO9SdO2N7Oq	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-06-30 07:11:05.564	f	2026-06-23 07:11:05.776
8	1	$2b$12$JkADPzDEN0RI5esOT/2oPO9in7gybinMh57u7Nh3haIPdP3NNeKxi	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-30 07:25:23.408	f	2026-06-23 04:08:51.99
14	1	$2b$12$QaNusNUCnmPBJ3wXGsi.seYnE.I0US97epPGWhfQpIDkm1wW8tGtC	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-06-30 09:31:30.818	f	2026-06-23 07:39:18.839
48	1	$2b$12$rBItHW2UcjfJ.QsX2ozON.s6iaE2RcsrKTbgJHoqExCyU9yCeu.L.	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-02 02:35:14.768	f	2026-06-25 02:35:15.143
49	1	$2b$12$4UPodtJupDRRteVxg1ar/ONjt5h0gEWH3sBfGIsZCgVa.HU8NmKiG	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-02 02:35:28.074	f	2026-06-25 02:35:28.297
50	1	$2b$12$IqhShHTm2MzGd1E1BJG4quOMfi2Z27f.ITzBKxecYziqOvxM9lT0W	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-02 04:22:39.127	t	2026-06-25 04:05:08.005
51	1	$2b$12$mGjC.Sdom3.sCaS.dRaxv.0MPmGV6JF8EW2VN/.bysaG7YayxcjhO	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-02 05:24:49.505	f	2026-06-25 04:22:50.187
52	1	$2b$12$GBgwSuxoIa6PtiCBhxYpuOk5zdKdkZnplxOrAXguIByPtZT60zC/.	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-02 07:50:50.608	f	2026-06-25 06:53:08.015
53	1	$2b$12$zh4gWArxjYOwc6rBNnM90uUajaW/XyBXozEtELG6ckXj9ByJrAaVS	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-02 08:48:03.008	f	2026-06-25 07:50:55.547
56	1	$2b$12$kKXajiUL7rZdncPZX4IcjOcSRYBdcY940Elli1.NwGkdYcA1rBXdq	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-05 03:35:26.541	t	2026-06-28 03:35:26.764
57	1	$2b$12$HsNYIKlx6Tyuv1nCnkm.pOEnzRDuqdWnhm.QF8Kcpspx1LWt5rTv.	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-06 03:10:22.96	f	2026-06-29 02:28:13.946
58	1	$2b$12$lLzIr5ItbZthMl.YKj.ZyentXfFvzVPCOg3y4DPymkuFsok3OeF9u	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-06 04:00:28.718	f	2026-06-29 03:32:21.705
59	1	$2b$12$vxHI3ZaXCokBeOyxNTZhNuQ3VWoNvq4mp54DJZ239nMGfpNh/u32i	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-06 06:13:49.59	f	2026-06-29 04:24:34.957
60	1	$2b$12$h9WEH3S2QuYQYcEI/7uhauDTpwtjvhL8GL/o2mSJ/N.Kp5Qf8AGHu	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-06 07:29:48.859	f	2026-06-29 06:13:52.631
61	1	$2b$12$au3RSfTqI4U0JjdZpDkBzujAOv.I3YESi9hDP93xngjOPQl3RnfqO	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-06 07:58:03.83	f	2026-06-29 07:29:55.795
62	1	$2b$12$dG/eaSAPwhp0yWZYgqlGAu4bP4GH2.YclgdwsXp/3Z2LsMUHg7Xre	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-06 09:21:14.489	f	2026-06-29 09:07:10.343
63	1	$2b$12$AUuFRApJq6KdXlk8tW2Of.2oqy0B8W/86WYWpdMm3ihpfY7vkKBnq	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-07 01:57:17.113	t	2026-06-30 01:57:17.337
64	6	$2b$12$rYGSP1Xv6.ckJLJH93zBVOlHPGIFD4dpMgh8/SCLoH/o1w9bBRb52	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-07 02:13:00.587	t	2026-06-30 01:59:01.108
65	1	$2b$12$2VIxIZ4N.JaIL9arudCKFegzXqtkkofXcGmrwJTVG/0s2UWJKBboi	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-07 02:17:40.394	t	2026-06-30 02:17:40.605
66	1	$2b$12$Xw0wuHrxrhBKHpT/9eXo.u8x0uYqApBo/lWNjL7uHh56qsVPSCcI2	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-07 02:27:54.761	t	2026-06-30 02:27:54.987
67	1	$2b$12$bPus2eRgGiJDjpXmtGH5ceU/nNwL/NEbZG8FYdILpG6Kdd81qA9R.	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-07 02:31:24.995	f	2026-06-30 02:31:25.25
68	1	$2b$12$fAxFLWPnVu8WB7ckRmBT8OdWkg23z7Y1fCA5K9vjiSF0YWx9RdhSC	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-07 02:31:32.298	f	2026-06-30 02:31:32.521
69	1	$2b$12$/v1fDPa4rVcpeE3IImcz0uDYHe9/VVUjPjh1jSg8daV0jFDvFcv0K	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-07 02:47:01.203	f	2026-06-30 02:32:42.13
82	1	$2b$12$YHk0O2K7nYuDNeqEReq.eOdoee36q28MZbmqvJ6ewdIV3fx31.Sz.	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-07 07:07:00.865	f	2026-06-30 06:38:51.497
84	6	$2b$12$9W1oXF9BlciaKE0Vs0xBzeN93Nnr8/ELzqYBQyFXtcKiU9c0vuUL.	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-07 07:14:41.166	f	2026-06-30 07:14:41.377
70	1	$2b$12$m4cYsyyAfioW0aZmZORq7eBx4KVRNzyowuYRI7YSRP8wrJdDy25ye	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-07 03:30:10.217	f	2026-06-30 02:47:02.46
71	1	$2b$12$GrcXqhfSrzVEPrDpcyq8Xe0ehI6366IuMxTKckFE/NgqPiGXNLF46	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-07 03:30:35.873	f	2026-06-30 03:30:36.086
72	6	$2b$12$Epav/2W4WXqrZF/sU6KPJOOdQ5v4AeUXUQcaUoxB2bS77WWBUKZ76	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-07 03:35:09.867	f	2026-06-30 03:35:10.09
85	1	$2b$12$gzfVVm2KPvjtYRWUR9iV0OMAGjgv3i4DJO68gX.y8625VUW55meiK	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-07 07:36:10.855	f	2026-06-30 07:14:48.734
86	1	$2b$12$Rl4vtELXo8G35XTosZqvQeHEQhIznYnIZafO0VM09hWnoj/5FijEy	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-07 07:36:14.529	f	2026-06-30 07:36:14.746
87	6	$2b$12$4iGtIhA0poY1SCCI5qLLaeWz8uw5XFcbChEJu3og83S8jOlvkmKFS	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-07 07:36:47.021	f	2026-06-30 07:36:47.229
88	6	$2b$12$N1yb4gaDjjG/Hesk3oS1aur0kWGDmYSt/h0sr7kMS6k7Q6n7kDSDq	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-08 00:20:23.184	f	2026-07-01 00:20:23.409
89	1	$2b$12$ZwQymBZvd/RsXvJITOnIA.kMlv6BYCaV5LD5Fkc9l65mccp1UgLrW	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-08 00:20:40.005	f	2026-07-01 00:20:40.218
90	6	$2b$12$PzPKqm6tPf/JccmEAdI8KOpcvfPYcX683BpCmqKoCTJwrVHk4u0JC	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-08 00:21:03.666	f	2026-07-01 00:21:03.884
91	1	$2b$12$gteTMgarquLzMkKcdSCmvuTS3TfPOzPjzpJVvsXwsA.tDdWS5vUm2	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-08 00:21:23.009	f	2026-07-01 00:21:23.229
92	6	$2b$12$HzKMjPIX9Nc/ALomoqFJ0.fDv4JtSrWam5Zlssw0bwT6fo07nafby	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-08 00:31:11.053	f	2026-07-01 00:31:11.267
77	6	$2b$12$bH6G1GJ.MKCdRxvo7hsMV.42nsOaDm9.an7OBEa0CNY8dXPgIc2/2	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-07 04:06:44.666	f	2026-06-30 04:06:45.211
78	1	$2b$12$agB0D4qWD7UzWuGnAAVnv.IVaBkCyRHQ8VkPoGam69uMwx.rIxZJm	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-07 04:07:15.606	f	2026-06-30 04:07:16.129
93	1	$2b$12$PxDpnwpHUP4k2cEful9fl.Lr/frvNKJkOTGDJLepK2OLUjtENtMVS	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-08 00:32:05.415	f	2026-07-01 00:32:05.637
94	6	$2b$12$emCyGX7tsec1Sgfh8yViT.Sazh5atZL4rBJoCxk6QzjXxiejAjiUe	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-08 00:32:21.815	f	2026-07-01 00:32:22.025
95	6	$2b$12$t3/azKWd1D2PKj4pACjO5u.q1ZCG0WrD.ICODeg9npRK3LNCwkqTu	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-08 00:53:30.448	f	2026-07-01 00:34:25.313
96	6	$2b$12$00zhPOv34Y7fFXIEjpHJvOIMhR4CtkFzTaMqWLX11VucEZdy9Ndaa	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-08 01:41:19.357	f	2026-07-01 00:53:32.054
79	1	$2b$12$eWwxJ5RX4Cc01.rHIv9Hf.as3BdLs/naPqHwxDfWagsk27CxJMGKu	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-07 06:30:18.73	f	2026-06-30 04:11:30.899
80	1	$2b$12$E4YDNyy6tq6tytqoVy5hde9DK/P.8DFFXFXpynDaOJsEx93eAxfxq	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-07 06:30:53.959	f	2026-06-30 06:30:54.172
81	1	$2b$12$soaLFU/ufouoUcAouCB1ZO4OPP2LX/mJW6YCfKr5uQ8DTCs0u.Qhm	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-07 06:37:55.379	f	2026-06-30 06:37:55.594
97	1	$2b$12$2LMqgUK9VEbWtKxyNr.GReypojPYwwZKZ3uRMrF4afOUf2/ds2PsK	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-09 02:32:37.336	f	2026-07-02 02:18:32.814
98	6	$2b$12$BoFzrxV5ic7WClwCXqjnW.kw6za1G1TexqYFXNekpTWoRqhWh9e7a	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-09 02:35:30.038	f	2026-07-02 02:35:30.26
99	1	$2b$12$dVAiQk2tTeS0lfw40mL2Iewwls5QPDLnRlz8zVn/6eRW10yKNJyJe	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-09 02:35:59.605	f	2026-07-02 02:35:59.818
100	6	$2b$12$jp2vBYY4I2uWjxAbX2vUc.oEBbKlH.irMbn4CXKt0MQjRmRmeUIJi	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-09 03:18:16.489	f	2026-07-02 02:36:08.271
101	6	$2b$12$8FBfyovGu6RqG/LucF/BPeqqapjhq4hDZphRPS27nXKRajRC1RySi	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-09 04:05:41.386	f	2026-07-02 03:33:17.171
106	6	$2b$12$AJ/k53YJBBL209gvZvwaveq/cTZtYZuWdxCq6juvZpLMFL5UKYp72	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	2026-07-09 04:09:09.683	f	2026-07-02 04:09:09.907
107	6	$2b$12$f5YBcoNtsnKS/.K9ziVBLOr3PVi1p0Y4v9IgknD2CBTxRKfoKU9aG	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-13 02:13:13.889	f	2026-07-06 02:13:14.114
140	1	$2b$12$y.Idx6juMbn20ol0FI2bbOPSaiCYwWvQMVMTO/s3tO2A30wSkq6ee	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 08:35:01.869	f	2026-07-07 08:17:04.975
108	164	$2b$12$Hfak7GdTuAsNiSjS87uc8OW6/SGY25to6BNQE6/CvUJ.ap0MCM0Oy	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-13 02:43:52.165	t	2026-07-06 02:43:52.472
141	1	$2b$12$fS.7msIwO1.DFW16qkS8ZeAVsP92xL4B8XGMWtx8271RZIIBNL6Wu	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 08:35:09.073	f	2026-07-07 08:35:09.49
110	164	$2b$12$6V8ZKCppG75WVMPOnrJH.u9vMXxiXub8jBUNgJZBOG3D.XTxqXOrG	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-13 02:46:17.296	f	2026-07-06 02:46:17.592
143	1	$2b$12$Sm0jqQMHVdiA/j.nxqLUYePEy3JGDE4q9xNtX94FaCRenbPKaHdOS	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 08:47:40.803	f	2026-07-07 08:47:41.24
111	164	$2b$12$EHqZpju7qjrbvLXpZnFDbOhSg1BhNbQULNdFNA7LGJcI8MvkIkbFe	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-13 03:00:09.984	f	2026-07-06 03:00:10.202
112	164	$2b$12$oHcm7wFuPEbgBH8/AkTTbukhtVSHgqw/AeHZ1aymnY2XOMT5kYsba	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-13 03:01:15.587	f	2026-07-06 03:01:15.809
145	1	$2b$12$/HzvNLi2grfA3sGg2gzT7O0hsflF3RH1RHIpYCrCg6E3wWMIvcqg2	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 08:50:53.883	f	2026-07-07 08:50:54.309
113	6	$2b$12$Yp01u3UL7A9kXIfJe.nG7eVW84.55a6OQYcwD8URGh0IN16B.2w72	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-13 03:21:29.941	f	2026-07-06 03:21:30.181
114	1	$2b$12$dNuD.44itdcKKssfEwALjOWYQ.yGVWjDlUzrbCV7ippBV6r5wUZFy	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-13 03:21:50.351	f	2026-07-06 03:21:50.567
147	164	$2b$12$4g1kCraQ/Z8GDbr6YKlMq./RmDfeY528aE4f6lfSOWVkbU904lzkO	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 08:56:07.383	f	2026-07-07 08:56:07.599
115	6	$2b$12$x4TGYLeE4bfyyFkOiFT0luG83OZ1aCPNfz7ovwqCGth99/rUe8LNa	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-13 03:30:05.322	f	2026-07-06 03:30:05.579
116	6	$2b$12$5hZYSleHWaebz4cx6MlzlOka0nV99mi0vWD1PMeNSu3Fl1jpcOaSe	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-13 03:38:13.799	f	2026-07-06 03:38:14.169
149	1	$2b$12$VR4RhaYN0V16Qrw5QPFteOF9d4TSKURiHyFFJDubP8VpJWYLhAk1e	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 09:01:36.461	f	2026-07-07 09:01:36.69
117	164	$2b$12$vMbH1WbbvU2BOTYhP6//yu/HyU6aMVPc7Vpjgnb6ZuSERjgP0llc6	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-13 03:46:25.454	f	2026-07-06 03:46:25.707
118	6	$2b$12$ru8odG5G7B3/o.u0ugNiJOIKU6iInswUz5A6l9SnF559OrcYrsGYy	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-13 03:49:49.121	f	2026-07-06 03:49:49.325
151	1	$2b$12$kWs1EvUk30OkvYtg2EDj7ebmlFW7gXizbqU7kVNY3F8eIiJAgN4nG	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-21 01:19:59.758	f	2026-07-14 01:19:59.982
153	1	$2b$12$t4J59UbGiqS/zUiOn.EBYO8K.v44oif9u3nxcTx5Iqp1LpdBEPtN2	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-21 01:58:38.753	f	2026-07-14 01:58:38.96
119	6	$2b$12$S/6ES1oGo6FkAeTp2FsTw.Qb2JnALOgKE1X3Zjz/MrEbKx6SjByqa	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-13 04:28:32.936	f	2026-07-06 04:00:10.209
109	164	$2b$12$SQxz.xBjK9QR796n9k06zu20FiiM.IVQ//B6BWwdMbAYff0OyFYme	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0	2026-07-13 05:06:19.852	f	2026-07-06 02:45:59.582
120	6	$2b$12$gaAPxkzNLjhMCRy.J1AkkOpuo.fgDxcH8raRIXxxSDRvv3K.if.EC	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-13 06:07:40.255	f	2026-07-06 06:07:40.503
121	1	$2b$12$tppv8SzRJX.Cq4HnqJPtBOWzbs/rtZBLgmCZjx.ruPTftyxHgB0Ay	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-13 06:08:12.541	f	2026-07-06 06:08:12.764
122	164	$2b$12$bvN0NMESABpfLQB5nTSr8ercTRCsAhyUis1aSTEDV830havbWcBBq	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-13 06:08:55.778	f	2026-07-06 06:08:55.999
128	1	$2b$12$ldMocwpSmUWUHjg0kg1CPunVWLIA7lQWrVRMqz00X5sMJi/WYUVtW	::1	node	2026-07-14 02:44:41.714	f	2026-07-07 02:44:41.942
129	1	$2b$12$NQb3EN3YTveqHe15nfRu7uEQNTaIOdtYTLq3FD/KsA2ABomTF8LEq	::1	node	2026-07-14 02:46:06.827	f	2026-07-07 02:46:07.044
134	1	$2b$12$Aco75CfGopgbyEFnhCVVHuKIseUXInIzx3URAXX14rPuyXlUCFpEK	::1	node	2026-07-14 03:02:54.771	f	2026-07-07 03:02:55.007
123	1	$2b$12$SZNoT9R6nkRWD/T9IACN6eRVp1XuXfI/aaV5OnyekEExyo8gFDS.C	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 06:23:54.274	f	2026-07-07 02:24:28.925
137	164	$2b$12$ZYb5rxxmg9T.G0PYLAl/Z.vWfrzv9L/b2oH1kyR3DAkmbpLQwkZPm	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 06:36:30.439	f	2026-07-07 06:36:30.646
138	164	$2b$12$dW5FsVgNGVMW0yld8908iOvCifMY7zCbASTZbBnwxzc6p9Dxy5JNW	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 07:05:03.931	f	2026-07-07 07:05:04.132
142	164	$2b$12$UZIaz7EmdJxGUlUV2/t4fuNCMZamRicw9tULQ4B0qc.MK.i8lbS5y	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 08:47:00.75	f	2026-07-07 08:47:01.247
144	164	$2b$12$DzKar0fEc/1y5aNd1tfjQeVWVCwvPt68LPl.r46dWCr3UMhvXJpve	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 08:48:04.765	f	2026-07-07 08:48:05.201
139	1	$2b$12$6tPcvkpdtNjyqwph6.CuiOtVZ7AnxaLdq0JC4yi6AmjRXd0FYsbe6	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 07:40:16.178	f	2026-07-07 07:12:06.951
146	1	$2b$12$8DNJ.1/T2gogE2xUVl4gs.pE.CBqscuYOZv0aB19SqAN3xe2uAO42	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 08:55:57.338	f	2026-07-07 08:55:57.554
148	1	$2b$12$dgIjA3ZEo2zKtMJOmUPRNeOhNFn0Gboyxk7pgGw0UmiPMAdq4Ujee	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 08:56:29.059	f	2026-07-07 08:56:29.271
150	1	$2b$12$z1Pdoxxz8eXR1VqsrBTAf.PGHnkxgGK1c/q4t14KZb3DWfCAWn8.G	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-14 09:02:00.435	f	2026-07-07 09:02:00.67
152	1	$2b$12$ooBXPYhyy0VZgF6/nQyfruZ.NTx/ocHVkaBG24ERh/PqfP/6OVCa2	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-21 01:58:11.877	f	2026-07-14 01:23:18.321
154	164	$2b$12$j0faIUl9E.icB7u0YMsZSu0iY874hE0e2Q2qtPWV9Y7ojmdIUWo5y	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-21 01:59:02.969	f	2026-07-14 01:59:03.215
155	6	$2b$12$C3SQQ2SPDmOOHAEIE3NsVeOn4CvFmAP8vjoHYs9LS4CEy2nlPRclS	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-21 01:59:16.823	f	2026-07-14 01:59:17.032
156	164	$2b$12$5EP.LQV/8HrF1fC7oTUDS.4JsvZ58yKAMoe8i6Hl7eCZhGUlkpfXS	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-21 01:59:59.723	f	2026-07-14 01:59:59.932
157	6	$2b$12$xxJFORzJUICv90YZQL8vMuPhya955vJH7UKhWSXS8j4/bnf2vn4tS	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-21 02:00:18.734	f	2026-07-14 02:00:18.942
158	164	$2b$12$sHItK7/EB1K8s.JHNxq0a.e1n/P6expTwPJvrFioz85kovEVewpy2	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-21 02:01:14.248	f	2026-07-14 02:01:14.46
159	164	$2b$12$v1bQ5juPZLh/IEJFSugVleVGuRkt8GQhTi0.aCNqfDTjnfGHmoeQO	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-21 02:12:15.438	f	2026-07-14 02:12:15.641
160	1	$2b$12$oeb0FnM5gGEnolCIxPmcleBTZTJJliNitg/dkO7BBpevODLjIK2si	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-21 02:12:28.174	f	2026-07-14 02:12:28.38
161	164	$2b$12$IG17CN/UtazYcf.TRnPqzegOCXL2/RFuqlHAFyOR5ApW6xVPn1idi	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-21 02:38:25.485	f	2026-07-14 02:38:25.723
162	164	$2b$12$NNrqraNAXeRA.LcNlmXKN.qgYqUNC6U1JcCBupLwywuE3pX8jeoJO	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-21 02:44:09.787	f	2026-07-14 02:44:10.046
163	1	$2b$12$Er8j4DKSlcOvsNFtWIcPC.gNj/RglAXzWiIeLxePhh/p2GZRCBMBy	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-21 02:44:34.703	f	2026-07-14 02:44:34.925
164	164	$2b$12$XMydnjC/equCDyG2NLS4Q.JelFs1vpU066IX1c.c4zak2r4BADlpm	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-21 02:47:34.296	f	2026-07-14 02:47:34.497
165	1	$2b$12$DWCavMfxZTPwTGuLJPmpKuK9K/H3YJtwgC9UoBiKqfToqFlm7LNCq	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-21 02:47:55.549	f	2026-07-14 02:47:55.766
166	6	$2b$12$fat3bEQKq1Hc/cnz9S9p8esCPwczSiIeW0Op7ykPqWiYWoPpwjXGa	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-21 02:48:15.283	f	2026-07-14 02:48:15.483
167	164	$2b$12$21VRUeIw69aFUlMCrOoxde5MC2HEW8cQzQle2ASLh0E1TyKc3ZnYO	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-21 02:49:21.69	f	2026-07-14 02:49:21.917
168	6	$2b$12$mVT/7NDqfwq84kZDJ7NdW.MyUtzhnhgHDU3rnEB9uCcc0bZFAqIji	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-21 02:50:34.674	f	2026-07-14 02:50:34.896
169	164	$2b$12$S8RFB/ajpPUmgoZwLJP9BOc4K2zN3MtE0.heB9E1cp8EeDLexmBb6	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-21 02:51:01.723	f	2026-07-14 02:51:01.945
170	6	$2b$12$Sb14Xs1.Xt8tyYyy5wu7mOEnVN3c6evB62qITRu05UQsbJQKiXDpq	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-21 02:51:43.734	f	2026-07-14 02:51:43.937
171	1	$2b$12$DfIXISFk.fgzoplSIsnBQuMWSLTQm7ucCXlfMISaqdtucgchw4GLW	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-21 02:56:35.883	f	2026-07-14 02:56:36.086
172	1	$2b$12$V.B/23yJJmV.LetR4aIgl.j9QD.kU6aMGUMNQ7o8IjwZ8Tkdrkiru	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-21 02:56:39.644	f	2026-07-14 02:56:39.849
173	1	$2b$12$qeyKEadBGXfrEd90/CW7K.jtIOMuBO39NpPYRYsDBeJBysVqQ8NCK	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-21 02:56:42.808	f	2026-07-14 02:56:43.01
174	1	$2b$12$XXo.i0mrHTLfYoY8zbqjl.AlqNJSVHNlggeAwS/86ZXOIlFH5z/4a	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-21 02:56:45.874	f	2026-07-14 02:56:46.078
175	1	$2b$12$k81h3OVfSRN86tIo/NCy7OyDdIs39uSJcyd1C8eMXAPASdIqCGAQO	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-21 02:56:49.395	f	2026-07-14 02:56:49.596
176	1	$2b$12$pyOYWAOYGYbbWjrhRhpq7uFGaHnQt.vk8Uzq0ZvvyTJI/MYF5B5Qy	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-21 02:56:53.23	f	2026-07-14 02:56:53.433
177	1	$2b$12$TKkmq/4WPidpqdbN.KKfVOD9Wi4AAT3aKiOvm9i5w.Nm0lYvznqhy	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-21 02:56:56.619	f	2026-07-14 02:56:56.821
178	1	$2b$12$Bd9bjaUzw1qT/IQohzcgDuF5GvGayc9SnW2OIQQi2kF6pu/22gUsu	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-21 02:57:00.385	f	2026-07-14 02:57:00.591
179	1	$2b$12$L/84dK8t9wq4Z5dEz07WYOROj9W0ND0cfjH3uRpUM41SryXpiE1yO	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-21 02:57:03.832	f	2026-07-14 02:57:04.042
180	164	$2b$12$gpzKqCDrN6EkTG1tUDd8J.qg/BDNeDKujn2zFBNQoThyvTrc6bT0q	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-21 02:57:33.262	f	2026-07-14 02:57:33.469
181	6	$2b$12$xcyhbKvUYera1hs4JL91.elytz8Zuprx5W6FDq5TfCwDDgyBklh..	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-21 02:58:20.527	f	2026-07-14 02:58:20.74
182	164	$2b$12$bQDP1pM.8E0cE60iGWoyL.atEzDE5kCltwlRec0UfPTM3yKSR/j5q	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-21 02:59:09.591	f	2026-07-14 02:59:09.803
183	164	$2b$12$yxdtJ81K1BWuy2EO71S3y.jmhlbQ9sxl4ss2Z0R9RvYPPTz38qZV.	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-21 02:59:34.649	f	2026-07-14 02:59:34.862
184	6	$2b$12$ndn5IO4tRZCiCndfVRP91ulsWtXyTnFcl2xqf8hoJuNku3Q850RHK	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-21 03:13:41.743	f	2026-07-14 02:59:40.884
185	164	$2b$12$eEKIKwOpxzbpso3RHIu4XuMgn/k9i8D4S7VuLkNguZ5ZUqX0zovZK	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-21 03:29:10.012	f	2026-07-14 03:29:10.236
186	6	$2b$12$2gYd9aadpYEOCEdG1vZKHuhyl9oiAX/F4OeceLTpT1fIVN5Nb11SG	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-21 03:29:31.356	f	2026-07-14 03:29:31.576
187	164	$2b$12$GKBXkqp3dFNTaC7Gl9XhWexddrZTV7sALfNA00Hd20o3PwPedsqLi	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-21 03:29:53.137	f	2026-07-14 03:29:53.358
188	6	$2b$12$4E8h9yJuHGoNjcuN8h.uOOF/IYJxRjiwDTBmhrqSg5f4fWudQe2z.	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-21 03:30:09.75	f	2026-07-14 03:30:09.959
189	164	$2b$12$w9TZTqBPRLkOJDrUTq1l5u49Lrb.NKide5bKvmd7Acpq2xknn4ubu	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-21 03:30:27.516	f	2026-07-14 03:30:27.732
191	1	$2b$12$Id0VOR9lGJbc13m8GjH1BuxCD5PS3dHKYjStLAuW6UwroHVgYngGW	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-21 03:42:26.693	f	2026-07-14 03:42:26.904
192	1	$2b$12$3DxIjqDRKDayNQ/oKjeTc.1eZbk2p3dRIrTktxHfeiLH5qqRaYReC	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-21 03:42:31.637	f	2026-07-14 03:42:31.841
193	1	$2b$12$2GQQ6fUilkpgAcB0J7LKGOeyhBWMqyRAeQQ.fPRL0Zggf.FsgBiLO	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-21 03:45:04.759	f	2026-07-14 03:45:04.968
194	1	$2b$12$hpfRfN3pkepsqZ8VB9LRHemnuduld1AWT6RMQkXD2eCf.1WhMjI4i	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-21 03:53:30.918	f	2026-07-14 03:53:31.165
195	1	$2b$12$VtbZAh.OGC/Na8tu2AUdz.TWUCxDoeCl/BwPh3B0HU5kHsdOitUby	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-21 03:53:35.633	f	2026-07-14 03:53:35.837
196	1	$2b$12$r.ojuE92yYLgmEPDi3JvzuCPRes68B0UcEDTkWFT7OdACVbl.vrNG	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-21 03:53:50.718	f	2026-07-14 03:53:50.924
197	1	$2b$12$OF1Mi4IWJdKjisi6Ij0nGuM3bjeip0sJZk.lnd/g.j3gOxF1pUaE6	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-21 03:53:53.849	f	2026-07-14 03:53:54.053
198	1	$2b$12$58fCOhWhy88qR.I9y5IBruSV2XKtzh5TZAylwQecMYM9sJlUv/20S	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-21 03:54:48.177	f	2026-07-14 03:54:48.385
199	1	$2b$12$dzw56BUET2V4ofMEUAvshOiTdL4gKG.C.GQPHOr3cFE0zyx91PHtq	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-21 04:02:54.938	f	2026-07-14 04:02:55.148
200	1	$2b$12$JM2nrHS9Ih5wbHItIU7Cg.d4gND1RmSz23pmQy860awHzPbcx5eQW	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-21 04:03:06.741	f	2026-07-14 04:03:06.943
201	1	$2b$12$hnKc6zUVZ8ovtGlQD8ydjecmgsziU3/sRbQRrcl6Kq9gUH2Fwdhki	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-21 04:04:41.275	f	2026-07-14 04:04:41.483
202	1	$2b$12$gz3ApnWbTKHaUhp5RRF9Du1jqhiT0jMhW1bBnv6XzvKUDXmzd4B/2	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-21 04:04:54.01	f	2026-07-14 04:04:54.213
190	6	$2b$12$2NodB6GF21mOieqA87QnFel6N3ovzHtg0kH36cdfAZOviQMqA34iG	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-21 04:05:32.485	f	2026-07-14 03:35:51.034
204	1	$2b$12$Nmy//SmfZqXKzGkyqKGPk.WOfpwe226rTdrX6V0TGZZ/av7.hS5yG	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-21 04:11:35.445	f	2026-07-14 04:11:35.655
205	1	$2b$12$.LYM571TstTQBxa8Kmn3EODbVFccv8isWg.2FGMNgxUMDrHdDISCK	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-21 04:20:43.851	f	2026-07-14 04:20:44.078
206	1	$2b$12$bHHovJAwzoBeCBgVEbRlG.8ig1fzyDu2mkCVFfonbzt5R7h.K4.Ee	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-21 04:20:49.585	f	2026-07-14 04:20:49.792
207	1	$2b$12$tDLEjDagszH9rKpmtxwSCuRGkC6hJygPrBgtsOHYakuPUdDhHnkk6	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-21 04:22:42.081	f	2026-07-14 04:22:42.298
208	1	$2b$12$it9kyRce1jqPaxnKdWiVluhXEGYXlkt7dtuud8kvcZF8DNkDWvADK	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-21 04:29:49.157	f	2026-07-14 04:29:49.372
209	1	$2b$12$4ZWBvgvpgb6CXxlBLxwYvObZpAeHMHpJh6FvJ5wNDLxZ.vA9xgs8i	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-21 04:30:06.728	f	2026-07-14 04:30:06.935
203	6	$2b$12$0szkxANYdRDPHGHL0hbOMutUW/tFgiaYE2zNW24HWBC.wTH9qWuSO	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-21 05:08:12.903	f	2026-07-14 04:05:36.761
211	1	$2b$12$dIUSWkz6zl9O.irYsaKCEOhb5t13uoKQ.qGGoT2OgE67NIekRrOqq	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8655	2026-07-21 05:15:15.554	f	2026-07-14 05:15:15.763
210	6	$2b$12$hGteaYXbq952Xw3iIIhrHumbG9tQyi4CCwPEbniy2NSQC4O3KDjtq	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-21 05:22:22.84	f	2026-07-14 05:08:20.233
212	164	$2b$12$2BVdErFgklUbaV8TpNZizerZifmKLZt6.KaZ.3VoRCd9p9iOq38aa	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-21 06:26:33.06	f	2026-07-14 05:27:55.505
213	6	$2b$12$/Y.asU/fHQ5VYfGECeHbDOh9QmXEiTNOx8Hl3TlpyTZgPNyxUI/Wq	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-21 06:52:58.164	f	2026-07-14 06:52:58.387
214	1	$2b$12$2JKWqPBHr0RwZOrWamnCCeMgm4/NsPVvaewAK56yF1HiB1LT2irxC	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-21 07:13:42.774	f	2026-07-14 06:54:26.109
215	1	$2b$12$.AOxFkgpaR8g2AX9uWZej.OIdCcPiptMyAIkzJAIKKeAyBTynRQ.m	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-21 07:22:49.173	f	2026-07-14 07:22:49.393
216	164	$2b$12$bYdr.ST78hxXtPyqGpqyuOLFqA33xySgpljO81EUaBl1oM./g4qRO	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-21 07:24:19.476	f	2026-07-14 07:24:19.693
217	164	$2b$12$z8km5msJR6f0nLcuCOmp8O3EkmFW/jOCjFLDaKepCc4zmC0HYIz06	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-21 07:24:37.35	f	2026-07-14 07:24:37.58
218	1	$2b$12$.tuH3nGI5hgPUZuPSzlZkeAg87.dT65OQqyM5vDogSivwBdjRkUue	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-21 07:27:49.453	f	2026-07-14 07:27:49.675
219	164	$2b$12$b84krAXeXz1rxYjU93lwWeO9t.P1wx20ADhVGUIt69MrS0olzoXBO	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-21 07:29:27.652	f	2026-07-14 07:29:27.868
220	1	$2b$12$sNDNmQDwuVfgn0CghSwrYOmJa2bYxu.A1vsyYNvM8eyz3fmwnDLFC	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-21 09:13:01.379	f	2026-07-14 07:29:53.041
221	6	$2b$12$1dT8OiYD9QMG9d5C8SFD7e9kKh5D2mcJBElGfYxw8oUfVsAxEuLq6	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	2026-07-21 09:51:04.085	f	2026-07-14 09:14:43.344
\.


--
-- Data for Name: user_subscriptions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_subscriptions (id, "userId", "planId", status, "startDate", "endDate", "createdAt", "updatedAt", "deletedAt", "isPermanent") FROM stdin;
15	1	18	ACTIVE	2026-07-07 04:15:45.186	2027-07-07 00:00:00	2026-07-07 04:15:45.189	2026-07-07 04:15:45.189	\N	f
5	1	16	ACTIVE	2026-06-23 07:12:01.438	2026-07-23 07:12:01.438	2026-06-23 07:12:01.44	2026-07-07 04:21:54.675	\N	f
14	2	16	ACTIVE	2026-07-07 04:15:09.332	2026-08-06 00:00:00	2026-07-07 04:15:09.358	2026-07-07 04:21:54.675	\N	f
16	1	16	ACTIVE	2026-07-07 04:16:03.354	2026-08-06 00:00:00	2026-07-07 04:16:03.356	2026-07-07 04:21:54.675	\N	f
6	3	3	ACTIVE	2026-06-25 06:54:13.938	2026-09-23 06:54:13.938	2026-06-25 06:54:13.939	2026-07-07 04:21:54.843	\N	f
2	4	4	ACTIVE	2026-06-23 04:11:54.867	2027-06-23 04:11:54.867	2026-06-23 04:11:54.868	2026-07-07 04:21:54.846	\N	f
13	175	3	EXPIRED	2026-07-07 02:56:37.505	2026-07-06 02:56:37.547	2026-07-07 02:56:37.506	2026-07-07 04:21:54.848	\N	f
17	164	18	ACTIVE	2026-07-07 08:47:58.718	2027-07-07 00:00:00	2026-07-07 08:47:58.74	2026-07-07 08:47:58.74	\N	f
18	164	18	ACTIVE	2026-07-14 02:58:34.897	2027-07-14 00:00:00	2026-07-14 02:58:34.907	2026-07-14 02:58:34.907	\N	f
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, "passwordHash", "fullName", phone, dob, address, "avatarUrl", "brokerId", "departmentId", "teamId", "riskTaste", "tierLevel", status, "createdAt", "updatedAt", "deletedAt", "emailVerifiedAt", "investmentDuration", "investmentStyle", "stockAccount", "stockCompany", "legacyTier", company, "joinDate", "position", "sortOrder", "referralId", "referralName", "paymentProofUrl", "staffCode") FROM stdin;
6	tuannv7105@gmail.com	$2b$12$Fen/HrqYqHXH5TsAJ2QGIupMBXEa2yjjyIKJnhtA0jDzA8oIjVi1S	Nguyễn Văn Tuấn	0865863045	2005-10-07	Quốc Oai, Hà Nội	\N	\N	2	6	\N	STANDARD	ACTIVE	2026-06-23 02:47:38.899	2026-07-14 11:27:17.338	\N	2026-06-26 03:23:41.604	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	BW9B
2	user_silver@fintop.vn	$2b$10$xyz	Nguyễn Văn Bạc	\N	\N	\N	\N	\N	\N	\N	\N	SILVER	ACTIVE	2026-06-16 07:25:51.026	2026-07-07 04:15:09.381	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
9	api-test@fintop.vn	dummy	API Tester	\N	\N	\N	\N	\N	\N	\N	\N	STANDARD	ACTIVE	2026-06-23 03:01:02.273	2026-06-23 03:01:02.273	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
12	alertuser@fintop.vn	dummy	Test Alert User	\N	\N	\N	\N	\N	\N	\N	\N	STANDARD	ACTIVE	2026-06-23 03:01:25.502	2026-06-23 03:01:25.502	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
13	realtime@fintop.vn	dummy	Realtime Test User	\N	\N	\N	\N	\N	\N	\N	\N	DIAMOND	ACTIVE	2026-06-23 03:01:32.444	2026-06-23 03:01:32.444	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
167	nguyentrungthanh05012005@gmail.com	$2b$10$wvi3KYVG/ah/B/77PV2.9uBhs5TkrQM4yw.codY65ag2O0UVmvH6.	Trung Thành Nguyễn	0835955799	2005-01-05	Phường Từ Liêm		\N	2	72	\N	STANDARD	ACTIVE	2026-07-06 11:26:27.416	2026-07-14 11:27:17.338	\N	2026-07-06 11:26:27.416	\N	\N	\N	\N	\N		\N		\N	\N	\N	\N	BW4O
79	luongtuyen.271298@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Lương Đặng Bích Tuyền	0784809235	1998-12-27	Số 10, Nguyễn Huệ, Bến Nghé, Quận 1	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	AGGRESSIVE	STANDARD	ACTIVE	2025-06-02 02:08:05	2026-07-14 11:27:17.338	\N	2025-06-02 02:08:05	3 - 6 tháng	Lướt sóng ngắn hạn	\N	khac	Thường	\N	2025-06-02	\N	\N	\N	\N	\N	\N
16	anhtuan2k5zxc@gmail.com	$2b$12$FLz2mzmqkXWzcj6ys6L4m.UX8BvoRI1txUYY4EapbBXTKWGtQZgw6	nguyễn văn tuấn	\N	\N	\N	\N	\N	\N	\N	\N	STANDARD	ACTIVE	2026-06-23 03:03:20.07	2026-06-23 04:08:57.001	2026-06-23 04:08:56.999	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
4	user_diamond@fintop.vn	$2b$10$xyz	Phạm Minh Kim Cương	\N	\N	\N	\N	\N	\N	\N	\N	DIAMOND	ACTIVE	2026-06-16 07:25:51.041	2026-06-23 04:11:54.872	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
80	maihoa.x9290@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Mai Thị Hoa	0976182720	1992-11-04	Long Biên, Hà Nội	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	MODERATE	STANDARD	ACTIVE	2025-05-22 01:23:34	2026-07-14 11:27:17.338	\N	2025-05-22 01:23:34	0 - 3 tháng	Linh hoạt kết hợp	\N	TKCK	Thường	\N	2025-05-22	\N	\N	\N	\N	\N	\N
81	thuytrangle171024@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	4. Lê Thị Thùy Trang	0399869406	2004-10-17	17/141/1194 Đường Láng, Láng Thượng, Đống Đa, Hà Nội	https://fintopdata.vn/file-image/avatar/avatar_default.png	130	\N	\N	MODERATE	STANDARD	ACTIVE	2025-05-20 08:56:16	2026-07-14 11:27:17.338	\N	2025-05-20 08:56:16	0 - 3 tháng	Linh hoạt kết hợp	S69406	vps	Thường	\N	2025-05-20	\N	\N	\N	\N	\N	\N
82	ttaikt505@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Nguyễn Trọng Tài	0913513016	2025-07-01	Hà Nội	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	MODERATE	STANDARD	ACTIVE	2025-05-12 09:50:42	2026-07-14 11:27:17.338	\N	2025-05-12 09:50:42	\N	Linh hoạt kết hợp	\N	ssi	Thường	\N	2025-05-12	\N	\N	\N	\N	\N	\N
83	sanhhen@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Lucky	0918770170	1972-08-31	Hồ Chí Minh	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	MODERATE	STANDARD	ACTIVE	2025-05-08 14:09:41	2026-07-14 11:27:17.338	\N	2025-05-08 14:09:41	0 - 3 tháng	Linh hoạt kết hợp	\N	khac	Thường	\N	2025-05-08	\N	\N	\N	\N	\N	\N
84	theloihau@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Mr Tran	0949591268	1987-10-12	Nguyen Van Troi	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	MODERATE	STANDARD	ACTIVE	2025-04-10 23:43:51	2026-07-14 11:27:17.338	\N	2025-04-10 23:43:51	\N	Linh hoạt kết hợp	\N	vps	Thường	\N	2025-04-11	\N	\N	\N	\N	\N	\N
86	letham742002@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Lê Thị Thắm	0974808130	2002-07-04	Hà Nội	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	MODERATE	STANDARD	ACTIVE	2025-03-27 01:07:17	2026-07-14 11:27:17.338	\N	2025-03-27 01:07:17	\N	Linh hoạt kết hợp	\N	ssi	VIP2	\N	2025-03-27	\N	\N	\N	\N	\N	\N
87	xuanthu189@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	trần xuân thu	0986436838	1984-09-18	số 68 ngõ 12 đào tấn	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	MODERATE	STANDARD	ACTIVE	2025-03-19 00:32:38	2026-07-14 11:27:17.338	\N	2025-03-19 00:32:38	\N	Linh hoạt kết hợp	200537	vps	Thường	\N	2025-03-19	\N	\N	\N	\N	\N	\N
21	ceo@fintop.vn	$2b$10$e6e7Y0vuSDiXNezIeO6bD.lCNFniNbVId5db0uKgyCphqviMqX8FG	Nguyễn Thế Anh	\N	\N	\N	\N	110	1	\N	\N	STANDARD	ACTIVE	2026-06-23 08:15:29.472	2026-06-23 08:15:29.472	2026-06-29 10:58:13.817	2026-06-23 08:15:29.462	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
88	vuongtrangshiho@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Phạm Quang Huy	0777019024	2003-10-10	Hà Nội	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	MODERATE	STANDARD	ACTIVE	2025-03-03 15:03:15	2026-07-14 11:27:17.338	\N	2025-03-03 15:03:15	0 - 3 tháng	Linh hoạt kết hợp	\N	TKCK	Thường	\N	2025-03-03	\N	\N	\N	\N	\N	\N
30	testuser@fintop.vn	$2b$10$zvXW93Rpy2igAop.0sbE6ezr0Y/Jpt4yMyMtVEG5pXGg8OpOD57ma	Khách hàng Thử nghiệm (Test User)	0888888888	\N	\N	\N	\N	\N	\N	\N	STANDARD	ACTIVE	2026-06-25 02:55:47.107	2026-06-25 02:55:47.107	\N	2026-06-25 02:55:47.104	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
3	user_gold@fintop.vn	$2b$10$xyz	Trần Thị Vàng	\N	\N	\N	\N	\N	\N	\N	\N	GOLD	ACTIVE	2026-06-16 07:25:51.037	2026-06-25 06:54:13.944	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
5	anhtuanzxc710@gmail.com	$2b$12$KlQAUBf4r0rfm2c/K7cotOBO58ZpTlWrEY1fas9sGVynsUtCX5K8W	nguyễn văn tuấn	\N	\N	\N	\N	\N	\N	\N	\N	STANDARD	ACTIVE	2026-06-23 02:44:34.813	2026-06-28 03:36:36.664	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
149	giangjojo2004@gmail.com	$2b$10$T804gG8x1h9M4K1K8r8.2er44v3x8z1P8.K7.uC1Vv49O/6.oJc/e	Nguyễn Trường Giang	0704741767	2004-11-26	68/6 Lê Văn Linh phường xóm chiếu TP Hồ Chí Minh	/file-image/avatar/avatar_default.png	116	2	36	\N	STANDARD	ACTIVE	2026-06-29 10:53:08.621	2026-07-14 11:27:17.338	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	BTK7
89	nguyenhuuhoang022021@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Hoang Nguyen Huu	0946885333	\N	Thái Nguyên	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	CONSERVATIVE	STANDARD	ACTIVE	2025-03-03 14:53:30	2026-07-14 11:27:17.338	\N	2025-03-03 14:53:30	3 - 6 tháng	Trung và dài hạn	\N	TKCK	Thường	\N	2025-03-03	\N	\N	\N	\N	\N	\N
90	ngolamthanh101@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Ngo Thanh	07045514677	\N	Nghe An	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	CONSERVATIVE	STANDARD	ACTIVE	2025-02-23 08:32:07	2026-07-14 11:27:17.338	\N	2025-02-23 08:32:07	6 - 12 tháng	Trung và dài hạn	\N	vps	Thường	\N	2025-02-23	\N	\N	\N	\N	\N	\N
91	minhorigin2003@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Nguyễn Hoàng Nhật Minh	0836392696	2003-09-18	Hà Nội	https://fintopdata.vn/file-image/avatar/avatar_default.png	130	\N	\N	MODERATE	STANDARD	ACTIVE	2025-02-19 03:32:28	2026-07-14 11:27:17.338	\N	2025-02-19 03:32:28	\N	Linh hoạt kết hợp	Q08951	vps	Thường	\N	2025-02-19	\N	\N	\N	\N	\N	\N
92	thuydungcpg@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	lê thuỳ dung	0978076120	1994-05-18	HÀ NỘI	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	MODERATE	STANDARD	ACTIVE	2025-02-13 01:18:12	2026-07-14 11:27:17.338	\N	2025-02-13 01:18:12	\N	Linh hoạt kết hợp	\N	khac	Thường	\N	2025-02-13	\N	\N	\N	\N	\N	\N
93	ngomaihien813hn@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Ngô Mai Hiên	0912024674	2003-10-08	112 Ngọc Khánh	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	MODERATE	STANDARD	ACTIVE	2025-01-06 13:52:51	2026-07-14 11:27:17.338	\N	2025-01-06 13:52:51	0 - 3 tháng	Linh hoạt kết hợp	Q24674	vps	VIP2	\N	2025-01-06	\N	\N	\N	\N	\N	\N
94	myanhbui.vac@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Bùi Mỹ Anh	00825026899	2004-08-25	Chùa Láng, Đống Đa, HN	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	MODERATE	STANDARD	ACTIVE	2025-01-02 08:42:46	2026-07-14 11:27:17.338	\N	2025-01-02 08:42:46	\N	Linh hoạt kết hợp	\N	vps	Thường	\N	2025-01-02	\N	\N	\N	\N	\N	\N
95	haitrongtran1@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Trần Trọng Hải	0918340258	1968-03-25	HCMC	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	MODERATE	STANDARD	ACTIVE	2025-01-01 12:55:36	2026-07-14 11:27:17.338	\N	2025-01-01 12:55:36	0 - 3 tháng	Linh hoạt kết hợp	\N	khac	Thường	\N	2025-01-01	\N	\N	\N	\N	\N	\N
96	aiphuong88@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Hà Thị Ái Phương	0988624358	2024-12-07	Hải phòng	https://fintopdata.vn/file-image/avatar/avatar_default.png	130	\N	\N	MODERATE	STANDARD	ACTIVE	2024-12-30 07:46:53	2026-07-14 11:27:17.338	\N	2024-12-30 07:46:53	\N	Linh hoạt kết hợp	220986	vps	VIP1	\N	2024-12-30	\N	\N	\N	\N	\N	\N
97	tuanlong95.nuce@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Nguyễn Tuấn Long	0947637897	1995-04-13	Thanh Hoá	https://fintopdata.vn/file-image/avatar/avatar_default.png	130	\N	\N	CONSERVATIVE	STANDARD	ACTIVE	2024-12-30 07:31:36	2026-07-14 11:27:17.338	\N	2024-12-30 07:31:36	\N	Trung và dài hạn	N37897	vps	VIP2	\N	2024-12-30	\N	\N	\N	\N	\N	\N
99	haanh.n2211@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Nguyễn Hà Anh	0328536379	1993-02-14	107 ấp Nhơn Thọ 2, xã Nhơn Ái, huyện Phong Điền, tp. Cần Thơ	https://fintopdata.vn/file-image/avatar/avatar_default.png	130	\N	\N	MODERATE	STANDARD	ACTIVE	2024-12-23 15:22:25	2026-07-14 11:27:17.338	\N	2024-12-23 15:22:25	\N	Linh hoạt kết hợp	235801	vps	VIP2	\N	2024-12-23	\N	\N	\N	\N	\N	\N
100	tuancao.investor@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Cao Tuan	0886333392	1992-08-17	Hà Nội	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	AGGRESSIVE	STANDARD	ACTIVE	2024-12-20 07:38:58	2026-07-14 11:27:17.338	\N	2024-12-20 07:38:58	\N	Lướt sóng ngắn hạn	\N	khac	Thường	\N	2024-12-20	\N	\N	\N	\N	\N	\N
101	linhdemons2006@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Trần Đức Huy	0972009126	2006-06-10	Park 3 Khu Đô Thị Times CIty	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	AGGRESSIVE	STANDARD	ACTIVE	2024-12-11 05:12:38	2026-07-14 11:27:17.338	\N	2024-12-11 05:12:38	\N	Lướt sóng ngắn hạn	539888	vps	VIP1	\N	2024-12-11	\N	\N	\N	\N	\N	\N
102	thientu8d@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Trần Thiện Tú	0935936383	2001-02-02	Thu Duc city, Bung Ong Thoan street	https://fintopdata.vn/file-image/avatar/avatar_default.png	133	\N	\N	CONSERVATIVE	STANDARD	ACTIVE	2024-11-28 09:25:16	2026-07-14 11:27:17.338	\N	2024-11-28 09:25:16	\N	Trung và dài hạn	\N	vps	Thường	\N	2024-11-28	\N	\N	\N	\N	\N	\N
103	thanhcaht38@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Nguyễn Thị Thanh Ca	0964980100	2000-03-23	Thành phố Hà Nội	https://fintopdata.vn/file-image/avatar/avatar_default.png	6	\N	\N	MODERATE	STANDARD	ACTIVE	2024-11-28 07:36:35	2026-07-14 11:27:17.338	\N	2024-11-28 07:36:35	\N	Linh hoạt kết hợp	A80100	vps	VIP1	\N	2024-11-28	\N	\N	\N	\N	\N	\N
32	vnquyen88@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Võ Ngọc Quyền	0938173599	\N	Hcm	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	AGGRESSIVE	STANDARD	ACTIVE	2026-04-23 07:38:33	2026-07-14 11:27:17.338	\N	2026-04-23 07:38:33	\N	Lướt sóng ngắn hạn	473599	vps	Thường	\N	2026-04-23	\N	\N	\N	\N	\N	\N
129	khangthuan07@gmail.com	$2b$10$T804gG8x1h9M4K1K8r8.2er44v3x8z1P8.K7.uC1Vv49O/6.oJc/e	Nguyễn Thuận Khang	0356479959	2003-06-29	Hồ Chí Minh	/file-image/avatar/avatar_default.png	116	2	63	\N	STANDARD	ACTIVE	2026-06-29 10:53:08.584	2026-07-14 11:27:17.338	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	BJ2S
130	hailedylan889@gmail.com	$2b$10$T804gG8x1h9M4K1K8r8.2er44v3x8z1P8.K7.uC1Vv49O/6.oJc/e	Nguyễn Đình Hải	0357731889	1995-02-07	Hà Nội	/file-image/avatar/avatar_default.png	110	2	8	\N	STANDARD	ACTIVE	2026-06-29 10:53:08.585	2026-07-14 11:27:17.338	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	6061
131	dannhihht@gmail.com	$2b$10$T804gG8x1h9M4K1K8r8.2er44v3x8z1P8.K7.uC1Vv49O/6.oJc/e	Phan Nữ Đan Nhi	0845205955	2003-02-28	Hà Nội	/file-image/avatar/avatar_default.png	116	2	21	\N	STANDARD	ACTIVE	2026-06-29 10:53:08.587	2026-07-14 11:27:17.338	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	BNSZ
132	nguyendat28112004@gmail.com	$2b$10$T804gG8x1h9M4K1K8r8.2er44v3x8z1P8.K7.uC1Vv49O/6.oJc/e	nguyễn bách đạt	0336646836	2004-11-28	Hà Nội	/file-image/avatar/avatar_default.png	110	2	22	\N	STANDARD	ACTIVE	2026-06-29 10:53:08.589	2026-07-14 11:27:17.338	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	F003
133	viettb234@gmail.com	$2b$10$T804gG8x1h9M4K1K8r8.2er44v3x8z1P8.K7.uC1Vv49O/6.oJc/e	Trần Quốc Việt	0869391861	2003-10-13	Hà Nội	/file-image/avatar/avatar_default.png	110	2	9	\N	STANDARD	ACTIVE	2026-06-29 10:53:08.59	2026-07-14 11:27:17.338	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	BPJ4
134	thanhphucubqn@gmail.com	$2b$10$T804gG8x1h9M4K1K8r8.2er44v3x8z1P8.K7.uC1Vv49O/6.oJc/e	Nguyễn Thành Phúc	0369879176	2000-09-12	Tòa S3 Vinhomes Skylake Phạm Hùng, Nam Từ Liêm	/file-image/avatar/avatar_default.png	113	2	4	\N	STANDARD	ACTIVE	2026-06-29 10:53:08.591	2026-07-14 11:27:17.338	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	BF14
135	thugie79.93@gmail.com	$2b$10$T804gG8x1h9M4K1K8r8.2er44v3x8z1P8.K7.uC1Vv49O/6.oJc/e	Hoài Thu Nguyễn	0972227823	1993-09-07	Tầng 18 tòa VTC Online, 18 Tam Trinh, Hà Nội, Việt Nam.	/file-image/avatar/avatar_default.png	112	2	5	\N	STANDARD	ACTIVE	2026-06-29 10:53:08.593	2026-07-14 11:27:17.338	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	5016
136	doanphuonghanhmthh@gmail.com	$2b$10$T804gG8x1h9M4K1K8r8.2er44v3x8z1P8.K7.uC1Vv49O/6.oJc/e	Đoàn Phương Hạnh	0347268359	2004-06-01	157 Chùa Láng, Đống Đa, Hà Nội	/file-image/avatar/avatar_default.png	113	2	64	\N	STANDARD	ACTIVE	2026-06-29 10:53:08.594	2026-07-14 11:27:17.338	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	BRRU
137	phuongwmai281103@gmail.com	$2b$10$T804gG8x1h9M4K1K8r8.2er44v3x8z1P8.K7.uC1Vv49O/6.oJc/e	Nguyễn Lê Phương Mai	0971120304	2003-11-28	No. 18, adjacent row 20C, Van Phu urban area	/file-image/avatar/avatar_default.png	116	2	65	\N	STANDARD	ACTIVE	2026-06-29 10:53:08.599	2026-07-14 11:27:17.338	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	BSPD
138	ngoc.nt0899@gmail.com	$2b$10$T804gG8x1h9M4K1K8r8.2er44v3x8z1P8.K7.uC1Vv49O/6.oJc/e	Nguyễn Thị Ngọc	0979342651	1999-08-12	Ngõ 12 Tôn Thất Tùng, Kim Liên, Hà Nội	/file-image/avatar/avatar_default.png	113	2	66	\N	STANDARD	ACTIVE	2026-06-29 10:53:08.6	2026-07-14 11:27:17.338	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	BRN4
139	nguyenmaithy04@gmail.com	$2b$10$T804gG8x1h9M4K1K8r8.2er44v3x8z1P8.K7.uC1Vv49O/6.oJc/e	Nguyễn Mai Thy	0943030604	2004-06-03	Hà Nội	/file-image/avatar/avatar_default.png	113	2	26	\N	STANDARD	ACTIVE	2026-06-29 10:53:08.602	2026-07-14 11:27:17.338	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	BSQW
140	nstung234@gmail.com	$2b$10$T804gG8x1h9M4K1K8r8.2er44v3x8z1P8.K7.uC1Vv49O/6.oJc/e	Ngô Sơn Tùng	0392061651	2004-03-20	51/8 Bùi Ngọc Dương, Bạch Mai, Hà Nội	/file-image/avatar/avatar_default.png	113	2	75	\N	STANDARD	ACTIVE	2026-06-29 10:53:08.604	2026-07-14 11:27:17.338	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
141	giangthuy2711@gmail.com	$2b$10$T804gG8x1h9M4K1K8r8.2er44v3x8z1P8.K7.uC1Vv49O/6.oJc/e	Nguyễn Thị Thùy Giang	0921446885	2004-11-27	Hà Nội	/file-image/avatar/avatar_default.png	111	2	68	\N	STANDARD	ACTIVE	2026-06-29 10:53:08.605	2026-07-14 11:27:17.338	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	BN32
142	long2004ptit@gmail.com	$2b$10$T804gG8x1h9M4K1K8r8.2er44v3x8z1P8.K7.uC1Vv49O/6.oJc/e	Vũ Thành Long	0977735502	2004-02-22	Hà Nội	/file-image/avatar/avatar_default.png	116	2	69	\N	STANDARD	ACTIVE	2026-06-29 10:53:08.607	2026-07-14 11:27:17.338	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	BSPB
143	hothinh338@gmail.com	$2b$10$T804gG8x1h9M4K1K8r8.2er44v3x8z1P8.K7.uC1Vv49O/6.oJc/e	Hồ Phú Thịnh	0898413118	2004-08-13	Thành Phố Hồ Chí Minh	/file-image/avatar/avatar_default.png	116	2	70	\N	STANDARD	ACTIVE	2026-06-29 10:53:08.609	2026-07-14 11:27:17.338	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	BTJJ
144	olianbill2508@gmail.com	$2b$10$T804gG8x1h9M4K1K8r8.2er44v3x8z1P8.K7.uC1Vv49O/6.oJc/e	Dang Nhu Ngoc	0981101355	1999-10-23	Hà nội	/file-image/avatar/avatar_default.png	113	2	10	\N	STANDARD	ACTIVE	2026-06-29 10:53:08.61	2026-07-14 11:27:17.338	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	BSVA
145	phuonganh03ntt@gmail.com	$2b$10$T804gG8x1h9M4K1K8r8.2er44v3x8z1P8.K7.uC1Vv49O/6.oJc/e	Nguyễn Thị Phương Anh	0963802731	2003-10-11	Ninh Bình	/file-image/avatar/avatar_default.png	113	2	10	\N	STANDARD	ACTIVE	2026-06-29 10:53:08.613	2026-07-14 11:27:17.338	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	BSVA
166	le217112@gmail.com	$2b$10$wvi3KYVG/ah/B/77PV2.9uBhs5TkrQM4yw.codY65ag2O0UVmvH6.	Lê Yến Nhi	0977563620	2005-10-09	Quận Dương Kinh	\N	\N	2	33	\N	STANDARD	ACTIVE	2026-07-06 11:26:27.416	2026-07-14 11:27:17.338	\N	2026-07-06 11:26:27.416	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	BT4O
147	dmnguyen12977@gmail.com	$2b$10$T804gG8x1h9M4K1K8r8.2er44v3x8z1P8.K7.uC1Vv49O/6.oJc/e	Nguyên Minh Dương	0707653497	1997-07-12	35 Lê Văn Lương, Thanh Xuân, Hà Nội, Việt Nam	/file-image/avatar/avatar_default.png	116	2	34	\N	STANDARD	ACTIVE	2026-06-29 10:53:08.617	2026-07-14 11:27:17.338	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	BTLT
148	ntlieuxd2005@gmail.com	$2b$10$T804gG8x1h9M4K1K8r8.2er44v3x8z1P8.K7.uC1Vv49O/6.oJc/e	Nguyễn Thị Liễu	0368266435	2005-10-14	Thôn Trường Xuân, xã Xuân Dương, huyện Thanh Oai, thành phố Hà Nội	/file-image/avatar/avatar_default.png	111	2	35	\N	STANDARD	ACTIVE	2026-06-29 10:53:08.619	2026-07-14 11:27:17.338	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	BTRN
150	lehatrang21102004@gmail.com	$2b$10$T804gG8x1h9M4K1K8r8.2er44v3x8z1P8.K7.uC1Vv49O/6.oJc/e	Lê Hà Trang	0337057530	2004-10-21	Hà Nội	/file-image/avatar/avatar_default.png	111	2	37	\N	STANDARD	ACTIVE	2026-06-29 10:53:08.623	2026-07-14 11:27:17.338	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	BSZD
151	loanttp203@gmail.com	$2b$10$T804gG8x1h9M4K1K8r8.2er44v3x8z1P8.K7.uC1Vv49O/6.oJc/e	Trần Thị Phương Loan	0358035448	2004-03-20	Hồ Chí Minh	/file-image/avatar/avatar_default.png	111	2	38	\N	STANDARD	ACTIVE	2026-06-29 10:53:08.624	2026-07-14 11:27:17.338	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	BTRW
152	thungocph@gmail.com	$2b$10$T804gG8x1h9M4K1K8r8.2er44v3x8z1P8.K7.uC1Vv49O/6.oJc/e	Phạm Thị Ngọc Thu	0832888836	1999-06-26	Hà Nội	/file-image/avatar/avatar_default.png	110	2	71	\N	STANDARD	ACTIVE	2026-06-29 10:53:08.626	2026-07-14 11:27:17.338	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	5777
154	tnam19884@gmail.com	$2b$10$T804gG8x1h9M4K1K8r8.2er44v3x8z1P8.K7.uC1Vv49O/6.oJc/e	Trần Tuấn Nam	0915985799	2003-08-30	Tân Hạnh, Đông Sơn, TP Thanh Hóa	/file-image/avatar/avatar_default.png	113	2	73	\N	STANDARD	ACTIVE	2026-06-29 10:53:08.628	2026-07-14 11:27:17.338	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	F101
156	doantri12343@gmail.com	$2b$10$T804gG8x1h9M4K1K8r8.2er44v3x8z1P8.K7.uC1Vv49O/6.oJc/e	Đoàn Nguyên Trí	0886871437	2004-01-13	Hồ Chí Minh	/file-image/avatar/avatar_default.png	110	2	74	\N	STANDARD	ACTIVE	2026-06-29 10:53:08.631	2026-07-14 11:27:17.338	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	BWF6
108	linhkhantran1111@gmail.com	$2b$12$wA9gXFMkQxLJLlg9w/10XOLAEbrYrDbOroZrKpaf4/rSdqlVC5s42	nguyễn văn văn	\N	\N	\N	\N	\N	\N	\N	\N	STANDARD	ACTIVE	2026-06-28 04:27:04.063	2026-06-29 07:00:24.473	2026-06-29 07:00:24.473	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
37	tuanminh310820@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Phan Tuấn Minh	0374449988	2000-08-31	Hà Nội	https://fintopdata.vn/file-image/avatar/avatar_default.png	134	\N	\N	MODERATE	STANDARD	ACTIVE	2026-01-30 08:19:14	2026-07-14 11:27:17.338	\N	2026-01-30 08:19:14	6 - 12 tháng	Linh hoạt kết hợp	H05961	vps	VIP2	\N	2026-01-30	\N	\N	\N	\N	\N	\N
38	baongocqb55@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Trần Hùng Long	0972433456	1990-03-09	quảng trị	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	MODERATE	STANDARD	ACTIVE	2026-01-28 04:06:02	2026-07-14 11:27:17.338	\N	2026-01-28 04:06:02	0 - 3 tháng	Linh hoạt kết hợp	\N	khac	Thường	\N	2026-01-28	\N	\N	\N	\N	\N	\N
39	duongthanhdatn@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	DUONG THANH DAT NGUYEN	0797608258	2004-02-24	THU DUC	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	MODERATE	STANDARD	ACTIVE	2026-01-19 03:54:26	2026-07-14 11:27:17.338	\N	2026-01-19 03:54:26	\N	Linh hoạt kết hợp	\N	khac	Thường	\N	2026-01-19	\N	\N	\N	\N	\N	\N
40	ltdung.cn4@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Lê Thị Thanh Dung	0916365027	1978-07-11	hà nội	https://fintopdata.vn/file-image/avatar/avatar_default.png	135	\N	\N	MODERATE	STANDARD	ACTIVE	2026-01-12 03:59:26	2026-07-14 11:27:17.338	\N	2026-01-12 03:59:26	\N	Linh hoạt kết hợp	543600	vps	VIP2	\N	2026-01-12	\N	\N	\N	\N	\N	\N
41	chilong0126@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Hoàng Chí Long	0369502006	2006-06-03	Hà Nội	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	MODERATE	STANDARD	ACTIVE	2026-01-08 18:33:30	2026-07-14 11:27:17.338	\N	2026-01-08 18:33:30	0 - 3 tháng	Linh hoạt kết hợp	\N	TKCK	Thường	\N	2026-01-09	\N	\N	\N	\N	\N	\N
42	chuphuongg032@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Chu Mai Phương	0359475278	2004-03-02	Hà Nội	https://fintopdata.vn/file-image/avatar/avatar_default.png	110	\N	\N	MODERATE	STANDARD	ACTIVE	2026-01-07 07:06:25	2026-07-14 11:27:17.338	\N	2026-01-07 07:06:25	0 - 3 tháng	Linh hoạt kết hợp	T75278	vps	Thường	\N	2026-01-07	\N	\N	\N	\N	\N	\N
43	wanghuy2712@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Trần Quang Huy	0374855579	2005-12-09	hưng yên	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	MODERATE	STANDARD	ACTIVE	2025-12-25 08:53:31	2026-07-14 11:27:17.338	\N	2025-12-25 08:53:31	3 - 6 tháng	Linh hoạt kết hợp	\N	vps	Thường	\N	2025-12-25	\N	\N	\N	\N	\N	\N
1	admin@fintop.vn	$2b$10$EjN4FWycQ.Cbj4GMoGlhO.bqiHyCiYnoTqrkoqaMvscaZJE0JRHby	Hệ thống Quản trị viên (Super Admin)	0999999999	\N	\N	\N	110	1	\N	\N	SILVER	ACTIVE	2026-06-16 07:25:15.878	2026-07-07 04:16:03.358	\N	2026-06-16 08:13:47.618	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	/uploads/img-1783397689573-956071127.jpg	\N
44	phamtangthaonguyen@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Phạm Tăng Thảo Nguyên	0962679042	2003-01-01	Đại Lộc	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	MODERATE	STANDARD	ACTIVE	2025-12-17 06:44:07	2026-07-14 11:27:17.338	\N	2025-12-17 06:44:07	3 - 6 tháng	Linh hoạt kết hợp	\N	ssi	Thường	\N	2025-12-17	\N	\N	\N	\N	\N	\N
105	fintop.bashare@gmail.com	$2b$10$SEHt.WpwL2RpWJNPaObAcO7zHp5Gp6gr6z1uqzpO6n/n8e191X3Vi	Nguyễn Công Luật	0386358006	2001-09-21	Hà Nội	/file-image/avatar/avatar_default.png	110	1	11	\N	STANDARD	ACTIVE	2026-06-26 02:46:50.453	2026-07-14 11:27:17.338	\N	2026-06-26 02:46:50.304	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	F000
120	tthanhthao250604.fam@gmail.com	$2b$10$2LyFYTGuU5ezKSko3Lcjd.BMggq6iTpFDKWd7h4VvcoERwYOKQ/oi	Trần Thị Thanh Thảo	0983582655	2004-06-25	Tx. Hoàng Mai	/file-image/avatar/avatar_default.png	110	2	12	\N	STANDARD	ACTIVE	2026-06-29 10:20:59.84	2026-07-14 11:27:17.338	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	BOCR
33	thuphuong21.rec@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Nguyễn Thị Thu Phương	0376635615	2005-02-21	Thành phố Chí Linh, Hải Phòng	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	CONSERVATIVE	STANDARD	ACTIVE	2026-03-23 14:31:37	2026-07-14 11:27:17.338	\N	2026-03-23 14:31:37	6 - 12 tháng	Trung và dài hạn	\N	ssi	Thường	\N	2026-03-23	\N	\N	\N	\N	\N	\N
34	quynhtrangtran3623@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Quynh Trang Tran	0359118911	2003-06-30	42/180/211 Khuong Trung street, Khuong Dinh ward, Hanoi	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	MODERATE	STANDARD	ACTIVE	2026-03-02 03:32:41	2026-07-14 11:27:17.338	\N	2026-03-02 03:32:41	6 - 12 tháng	Linh hoạt kết hợp	474133	vps	Thường	\N	2026-03-02	\N	\N	\N	\N	\N	\N
35	truongld.sacoland@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Lê đình trường	0943208828	1991-01-19	Thanh hoá	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	MODERATE	STANDARD	ACTIVE	2026-02-04 14:59:26	2026-07-14 11:27:17.338	\N	2026-02-04 14:59:26	0 - 3 tháng	Linh hoạt kết hợp	\N	ssi	Thường	\N	2026-02-04	\N	\N	\N	\N	\N	\N
36	phamkhanhphuong0203@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Phương Phạm Khánh	0868731028	2005-03-02	Hà Nội	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	MODERATE	STANDARD	ACTIVE	2026-01-30 18:30:37	2026-07-14 11:27:17.338	\N	2026-01-30 18:30:37	0 - 3 tháng	Linh hoạt kết hợp	\N	vps	Thường	\N	2026-01-31	\N	\N	\N	\N	\N	\N
116	dinhhai.6061@fintop.vn	$2b$10$PgNsmJMApndE6sdeR.D6me/xvGsUpUSPNsn3sdXbT/zz5ZaxZVIRa	Nguyễn Đình Hải	0966778899	1989-03-09	Hà Nội	/file-image/avatar/avatar_default.png	110	2	8	\N	STANDARD	ACTIVE	2026-06-29 10:14:20.438	2026-06-29 10:14:20.438	2026-06-29 10:58:13.805	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
117	quocviet.bpj4@fintop.vn	$2b$10$PgNsmJMApndE6sdeR.D6me/xvGsUpUSPNsn3sdXbT/zz5ZaxZVIRa	Trần Quốc Việt	0933445566	1991-11-20	Hà Nội	/file-image/avatar/avatar_default.png	110	2	9	\N	STANDARD	ACTIVE	2026-06-29 10:14:20.441	2026-06-29 10:14:20.441	2026-06-29 10:58:13.812	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
113	khanhlinh.8043@fintop.vn	$2b$10$PgNsmJMApndE6sdeR.D6me/xvGsUpUSPNsn3sdXbT/zz5ZaxZVIRa	Trần Khánh Linh	0987654321	1995-12-25	Hà Nội	/file-image/avatar/avatar_default.png	110	2	6	\N	STANDARD	ACTIVE	2026-06-29 10:14:20.425	2026-06-29 10:14:20.425	2026-06-29 10:58:13.813	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
10	editor@fintop.vn	dummy	Vũ Quốc Việt	\N	\N	\N	\N	110	3	\N	\N	STANDARD	ACTIVE	2026-06-23 03:01:05.97	2026-06-23 08:15:29.545	2026-06-29 10:58:13.815	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
26	sale.admin@fintop.vn	$2b$10$e6e7Y0vuSDiXNezIeO6bD.lCNFniNbVId5db0uKgyCphqviMqX8FG	Đỗ Gia Bảo	\N	\N	\N	\N	110	2	\N	\N	STANDARD	ACTIVE	2026-06-23 08:15:29.556	2026-06-23 08:15:29.556	2026-06-29 10:58:13.816	2026-06-23 08:15:29.556	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
24	editor.pro@fintop.vn	$2b$10$e6e7Y0vuSDiXNezIeO6bD.lCNFniNbVId5db0uKgyCphqviMqX8FG	Lê Thu Trang	\N	\N	\N	\N	110	3	\N	\N	STANDARD	ACTIVE	2026-06-23 08:15:29.535	2026-06-23 08:15:29.535	2026-06-29 10:58:13.816	2026-06-23 08:15:29.534	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
114	tuannv.8043@fintop.vn	$2b$10$PgNsmJMApndE6sdeR.D6me/xvGsUpUSPNsn3sdXbT/zz5ZaxZVIRa	Nguyễn Văn Tuấn	0903334445	1988-08-15	Hà Nội	/file-image/avatar/avatar_default.png	110	2	6	\N	STANDARD	ACTIVE	2026-06-29 10:14:20.43	2026-06-29 10:14:20.43	2026-06-29 10:58:13.817	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
14	expert@fintop.vn	$2b$12$N82W6v89NdQgGXf7G.6F8Om8BNEcJvDeRhkcwDoPjEt6xguY9Cm8u	Vũ Việt Đức	\N	\N	\N	\N	110	3	\N	\N	DIAMOND	ACTIVE	2026-06-23 03:01:38.192	2026-06-23 08:15:29.635	2026-06-29 10:58:13.818	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
112	hoaithu.5016@fintop.vn	$2b$10$PgNsmJMApndE6sdeR.D6me/xvGsUpUSPNsn3sdXbT/zz5ZaxZVIRa	Hoài Thu Nguyễn	0912345678	1992-05-10	Hà Nội	/file-image/avatar/avatar_default.png	110	2	5	\N	STANDARD	ACTIVE	2026-06-29 10:14:20.421	2026-06-29 10:14:20.421	2026-06-29 10:58:13.818	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
22	assistant@fintop.vn	$2b$10$e6e7Y0vuSDiXNezIeO6bD.lCNFniNbVId5db0uKgyCphqviMqX8FG	Trần Minh Hằng	\N	\N	\N	\N	110	1	\N	\N	STANDARD	ACTIVE	2026-06-23 08:15:29.517	2026-06-23 08:15:29.517	2026-06-29 10:58:13.818	2026-06-23 08:15:29.516	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
27	sale@fintop.vn	$2b$10$e6e7Y0vuSDiXNezIeO6bD.lCNFniNbVId5db0uKgyCphqviMqX8FG	Hoàng Lan Anh	\N	\N	\N	\N	110	2	\N	\N	STANDARD	ACTIVE	2026-06-23 08:15:29.567	2026-06-23 08:15:29.567	2026-06-29 10:58:13.837	2026-06-23 08:15:29.566	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
23	editor.admin@fintop.vn	$2b$10$e6e7Y0vuSDiXNezIeO6bD.lCNFniNbVId5db0uKgyCphqviMqX8FG	Phạm Thanh Sơn	\N	\N	\N	\N	110	3	\N	\N	STANDARD	ACTIVE	2026-06-23 08:15:29.526	2026-06-23 08:15:29.526	2026-06-29 10:58:13.837	2026-06-23 08:15:29.525	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
164	linhkhanhtran1111@gmail.com	$2b$12$LJvCHm7z/qItqeFF0/Dn3Ocoyq8jOcs8R6k.xzOnflBsknvp8k84W	linh	865863045	2005-07-15	Hà Nội	\N	\N	\N	\N	\N	STANDARD	ACTIVE	2026-07-06 02:40:59.923	2026-07-14 07:29:40.598	\N	2026-07-06 02:41:34.129	Trên 1 năm	Linh hoạt kết hợp		Chưa TKCK	\N		\N		\N	\N	\N	/uploads/img-1783997887179-905673107.jpg	\N
153	nguyentrinhthanh05012005@gmail.com	$2b$10$T804gG8x1h9M4K1K8r8.2er44v3x8z1P8.K7.uC1Vv49O/6.oJc/e	Trịnh Thành Nguyễn	0835565799	2005-01-05	Phường Mỹ Lâm	/file-image/avatar/avatar_default.png	113	2	40	\N	STANDARD	ACTIVE	2026-06-29 10:53:08.627	2026-07-14 04:04:41.803	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	BW4D
146	la217112@gmail.com	$2b$10$T804gG8x1h9M4K1K8r8.2er44v3x8z1P8.K7.uC1Vv49O/6.oJc/e	Lã Yến Nhi	0977583620	2005-10-09	Quận Dương Kinh	/file-image/avatar/avatar_default.png	111	2	33	\N	STANDARD	ACTIVE	2026-06-29 10:53:08.615	2026-07-14 04:04:41.867	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	BT4O
155	tuanmv7105@gmail.com	$2b$10$T804gG8x1h9M4K1K8r8.2er44v3x8z1P8.K7.uC1Vv49O/6.oJc/e	Nguyễn Văn Tuấn	0985863045	2005-10-07	Quốc Oai, Hà Nội	/file-image/avatar/avatar_default.png	110	2	44	\N	STANDARD	ACTIVE	2026-06-29 10:53:08.629	2026-07-14 04:05:55.446	\N	\N	\N	\N	\N	\N	\N		\N		\N	\N	\N	\N	BW9B
45	anhdtp.tec@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Đoàn thị phương anh	0967930356	1999-07-30	Hà Nội	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	MODERATE	STANDARD	ACTIVE	2025-12-11 14:17:50	2026-07-14 11:27:17.338	\N	2025-12-11 14:17:50	\N	Linh hoạt kết hợp	\N	vnd	Thường	\N	2025-12-11	\N	\N	\N	\N	\N	\N
46	hovanlinh@yahoo.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	HỒ VĂN LĨNH	0903503446	1971-08-01	Tp. Đà Nẵng	https://fintopdata.vn/file-image/avatar/avatar_default.png	135	\N	\N	MODERATE	STANDARD	ACTIVE	2025-11-28 08:36:32	2026-07-14 11:27:17.338	\N	2025-11-28 08:36:32	6 - 12 tháng	Linh hoạt kết hợp	403446	vps	Thường	\N	2025-11-28	\N	\N	\N	\N	\N	\N
47	huongdn2008@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Đặng Thị Ngọc Hương	0983382219	1977-12-11	Hà Nội	https://fintopdata.vn/file-image/avatar/avatar_default.png	6	\N	\N	MODERATE	DIAMOND	ACTIVE	2025-11-27 07:11:14	2026-07-14 11:27:17.338	\N	2025-11-27 07:11:14	\N	Linh hoạt kết hợp	283048	vps	KIM_CUONG	\N	2025-11-27	\N	\N	\N	\N	\N	\N
49	peinopie@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Bùi Hương Giang	0387731000	2005-10-11	Hà Nội	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	MODERATE	STANDARD	ACTIVE	2025-11-06 04:11:25	2026-07-14 11:27:17.338	\N	2025-11-06 04:11:25	3 - 6 tháng	Linh hoạt kết hợp	S07852	vps	Thường	\N	2025-11-06	\N	\N	\N	\N	\N	\N
50	phamcongtuan1106@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Phạm Công Tuấn	0948793988	2006-11-11	Ha Long, Quang Ninh	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	MODERATE	STANDARD	ACTIVE	2025-10-24 16:34:07	2026-07-14 11:27:17.338	\N	2025-10-24 16:34:07	\N	Linh hoạt kết hợp	\N	khac	Thường	\N	2025-10-24	\N	\N	\N	\N	\N	\N
111	thanhphuc.bf14@fintop.vn	$2b$10$PgNsmJMApndE6sdeR.D6me/xvGsUpUSPNsn3sdXbT/zz5ZaxZVIRa	Nguyễn Thành Phúc	0901234567	1990-01-01	Hà Nội	/file-image/avatar/avatar_default.png	110	2	4	\N	STANDARD	ACTIVE	2026-06-29 10:14:20.418	2026-06-29 10:14:20.418	2026-06-29 10:58:13.819	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
85	trinhthuyhien0202@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Trịnh Thúy Hiền	0886997226	2005-02-02	Đống Đa, Hà Nội	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	MODERATE	STANDARD	ACTIVE	2025-04-10 14:13:32	2026-07-14 11:27:17.338	\N	2025-04-10 14:13:32	\N	Linh hoạt kết hợp	\N	vps	VIP1	\N	2025-04-10	\N	\N	\N	\N	\N	\N
98	maitiendung210899@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Mai Tiến Dũng	0889225336	1999-08-21	Đồng Hới, Quảng Bình	https://fintopdata.vn/file-image/avatar/avatar_default.png	6	\N	\N	CONSERVATIVE	STANDARD	ACTIVE	2024-12-27 07:12:16	2026-07-14 11:27:17.338	\N	2024-12-27 07:12:16	\N	Trung và dài hạn	536415	vps	Thường	\N	2024-12-27	\N	\N	\N	\N	\N	\N
31	phamtranphucan1002@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	sasdasd	0907753675	2000-08-17	Thành phố Thủ Đức, Thành phố Hồ Chí Minh	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	MODERATE	STANDARD	ACTIVE	2026-05-12 03:56:32	2026-07-14 11:27:17.338	\N	2026-05-12 03:56:32	6 - 12 tháng	Linh hoạt kết hợp	\N	vps	Thường	\N	2026-05-12	\N	\N	\N	\N	\N	\N
48	dhung8039@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Đỗ Minh Hưng	0522610132	2004-01-22	254/33/61 Bến Vân Đồn p2 q4	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	MODERATE	STANDARD	ACTIVE	2025-11-26 13:02:11	2026-07-14 11:27:17.338	\N	2025-11-26 13:02:11	3 - 6 tháng	Linh hoạt kết hợp	\N	TKCK	Thường	\N	2025-11-26	\N	\N	\N	\N	\N	\N
51	vuhaphuong692@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Vũ Hà Phương	0975047445	2006-04-27	Ninh Bình	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	MODERATE	STANDARD	ACTIVE	2025-10-23 07:17:42	2026-07-14 11:27:17.338	\N	2025-10-23 07:17:42	0 - 3 tháng	Linh hoạt kết hợp	\N	vnd	Thường	\N	2025-10-23	\N	\N	\N	\N	\N	\N
52	phuonganh2559@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Nguyễn Ngọc Phương Anh	0827858899	1999-05-26	Hồ Chí Minh	https://fintopdata.vn/file-image/avatar/avatar_default.png	6	2	10	MODERATE	STANDARD	ACTIVE	2025-10-23 06:12:59	2026-07-14 11:27:17.338	\N	2025-10-23 06:12:59	0 - 3 tháng	Linh hoạt kết hợp	S14895	vps	VIP2	\N	2025-10-23	\N	\N	\N	\N	\N	\N
53	nguyentoannam942003@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Nguyễn Toàn Nam	0977453378	2003-05-24	Phường Phước Long B, Thủ Đức, TP. Hồ Chí Minh	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	AGGRESSIVE	STANDARD	ACTIVE	2025-10-22 12:13:03	2026-07-14 11:27:17.338	\N	2025-10-22 12:13:03	0 - 3 tháng	Lướt sóng ngắn hạn	\N	TKCK	Thường	\N	2025-10-22	\N	\N	\N	\N	\N	\N
54	luongthevinh129bk@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Lương Thế Vinh	0977916363	1983-09-12	Thái Hà Đống Đa Hà Nội	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	MODERATE	STANDARD	ACTIVE	2025-10-22 04:48:51	2026-07-14 11:27:17.338	\N	2025-10-22 04:48:51	0 - 3 tháng	Linh hoạt kết hợp	026CS53895	vps	VIP2	\N	2025-10-22	\N	\N	\N	\N	\N	\N
55	v11bbpp@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Nguyen Duc Vinh	0903232468	1974-12-10	Hà Nội	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	MODERATE	STANDARD	ACTIVE	2025-10-12 15:24:28	2026-07-14 11:27:17.338	\N	2025-10-12 15:24:28	\N	Linh hoạt kết hợp	v688	vps	Thường	\N	2025-10-12	\N	\N	\N	\N	\N	\N
56	anhvh.qn@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Vũ Hoàng Anh	0936963931	1993-05-06	Quảng Ninh	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	AGGRESSIVE	STANDARD	ACTIVE	2025-10-08 03:38:22	2026-07-14 11:27:17.338	\N	2025-10-08 03:38:22	\N	Lướt sóng ngắn hạn	712616	vps	Thường	\N	2025-10-08	\N	\N	\N	\N	\N	\N
57	namnghiahiep900@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	nguyen van nam	0935055988	0990-01-01	tp huế	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	MODERATE	STANDARD	ACTIVE	2025-09-25 02:48:40	2026-07-14 11:27:17.338	\N	2025-09-25 02:48:40	\N	Linh hoạt kết hợp	\N	vnd	Thường	\N	2025-09-25	\N	\N	\N	\N	\N	\N
58	tranthidiep2310@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Trần Điệp	0932337622	1991-11-20	Hồ Chí Minh	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	MODERATE	STANDARD	ACTIVE	2025-09-23 07:16:07	2026-07-14 11:27:17.338	\N	2025-09-23 07:16:07	\N	Linh hoạt kết hợp	\N	vnd	Thường	\N	2025-09-23	\N	\N	\N	\N	\N	\N
59	huyentd03@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Dương Thị Huyền	0339326103	2003-08-23	Phương Liệt, Hà Nội	https://fintopdata.vn/file-image/avatar/avatar_default.png	59	2	7	AGGRESSIVE	STANDARD	ACTIVE	2025-09-23 07:03:22	2026-07-14 11:27:17.338	\N	2025-09-23 07:03:22	0 - 3 tháng	Lướt sóng ngắn hạn	\N	vps	VIP2	\N	2025-09-23	\N	\N	\N	\N	\N	\N
60	huytqbn@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Trần Quang Huy	0914087826	1978-01-17	Bắc Ninh	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	AGGRESSIVE	STANDARD	ACTIVE	2025-08-13 00:42:55	2026-07-14 11:27:17.338	\N	2025-08-13 00:42:55	\N	Lướt sóng ngắn hạn	\N	ssi	Thường	\N	2025-08-13	\N	\N	\N	\N	\N	\N
61	phamcuongthm@yahoo.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Phạm Cương	+84916261165	1965-11-26	Hồ Chí Minh city	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	AGGRESSIVE	STANDARD	ACTIVE	2025-08-12 02:16:46	2026-07-14 11:27:17.338	\N	2025-08-12 02:16:46	0 - 3 tháng	Lướt sóng ngắn hạn	\N	khac	Thường	\N	2025-08-12	\N	\N	\N	\N	\N	\N
62	bang.hs1978@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Hồ Sỹ Băng hồ	0919083135	0078-07-12	BN4-LK3, KP 7, phường Thống Nhất, thành phố Biên Hòa, tỉnh Đồng Nai.	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	MODERATE	STANDARD	ACTIVE	2025-08-07 09:25:04	2026-07-14 11:27:17.338	\N	2025-08-07 09:25:04	\N	Linh hoạt kết hợp	N04489	vps	Thường	\N	2025-08-07	\N	\N	\N	\N	\N	\N
63	diepdanle0108@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Lê Dư Diệp Đan	0981006700	2005-08-01	Hà Nội	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	CONSERVATIVE	STANDARD	ACTIVE	2025-08-07 08:59:50	2026-07-14 11:27:17.338	\N	2025-08-07 08:59:50	\N	Trung và dài hạn	DAN108	vps	Thường	\N	2025-08-07	\N	\N	\N	\N	\N	\N
64	hoangminh01122019@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Lê Hoàng Minh	0906206899	2004-12-01	67C Quán Thánh, phường Quán Thánh, quận Ba Đình	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	MODERATE	STANDARD	ACTIVE	2025-08-05 08:38:28	2026-07-14 11:27:17.338	\N	2025-08-05 08:38:28	\N	Linh hoạt kết hợp	\N	vps	Thường	\N	2025-08-05	\N	\N	\N	\N	\N	\N
124	nhuquynhnguyen16102002@gmail.com	$2b$10$T804gG8x1h9M4K1K8r8.2er44v3x8z1P8.K7.uC1Vv49O/6.oJc/e	Nguyễn Như Quỳnh	0362928667	2002-10-16	Thanh Hóa	/file-image/avatar/avatar_default.png	110	2	59	\N	STANDARD	ACTIVE	2026-06-29 10:53:08.575	2026-07-14 11:27:17.338	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	BJFS
125	nguyenduyan179202@gmail.com	$2b$10$T804gG8x1h9M4K1K8r8.2er44v3x8z1P8.K7.uC1Vv49O/6.oJc/e	Nguyễn Duy An	0965990173	2002-09-17	Hà Nội	/file-image/avatar/avatar_default.png	110	2	60	\N	STANDARD	ACTIVE	2026-06-29 10:53:08.577	2026-07-14 11:27:17.338	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	BEW5
126	diuhoang517@gmail.com	$2b$10$T804gG8x1h9M4K1K8r8.2er44v3x8z1P8.K7.uC1Vv49O/6.oJc/e	Hoàng Thị Dịu	0796090848	2005-09-27	Hà Nội	/file-image/avatar/avatar_default.png	113	2	61	\N	STANDARD	ACTIVE	2026-06-29 10:53:08.579	2026-07-14 11:27:17.338	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	BM35
127	duyhoangvu2692004@gmail.com	$2b$10$T804gG8x1h9M4K1K8r8.2er44v3x8z1P8.K7.uC1Vv49O/6.oJc/e	Vũ Hoàng Duy	0325414140	2004-09-26	Hà Nội	/file-image/avatar/avatar_default.png	113	2	62	\N	STANDARD	ACTIVE	2026-06-29 10:53:08.58	2026-07-14 11:27:17.338	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	BLHG
65	sweet.huy110@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Duc Huy	0905936339	1980-01-01	Tp. Hồ Chí Minh	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	MODERATE	STANDARD	ACTIVE	2025-08-04 16:51:19	2026-07-14 11:27:17.338	\N	2025-08-04 16:51:19	\N	Linh hoạt kết hợp	\N	vnd	Thường	\N	2025-08-04	\N	\N	\N	\N	\N	\N
66	hpnguyen1996@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Nguyễn Hồng Phương	0832421286	1996-01-31	19 ngõ 3 Trần Khát Chân, phường Thanh Lương	https://fintopdata.vn/file-image/avatar/avatar_default.png	110	\N	\N	MODERATE	STANDARD	ACTIVE	2025-07-30 01:18:30	2026-07-14 11:27:17.338	\N	2025-07-30 01:18:30	\N	Linh hoạt kết hợp	345940	vps	Thường	\N	2025-07-30	\N	\N	\N	\N	\N	\N
67	minhvuong040194@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Trần Minh Vương	0945163118	1993-11-18	Hưng Yên	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	MODERATE	STANDARD	ACTIVE	2025-07-15 14:45:09	2026-07-14 11:27:17.338	\N	2025-07-15 14:45:09	\N	Linh hoạt kết hợp	863118	vps	Thường	\N	2025-07-15	\N	\N	\N	\N	\N	\N
68	yahoo2k4@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	trần thành đạt	0949868325	2004-01-01	Hà Nội	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	MODERATE	STANDARD	ACTIVE	2025-07-14 03:35:16	2026-07-14 11:27:17.338	\N	2025-07-14 03:35:16	0 - 3 tháng	Linh hoạt kết hợp	\N	TKCK	Thường	\N	2025-07-14	\N	\N	\N	\N	\N	\N
110	fintop.ba@gmail.com	$2b$10$PgNsmJMApndE6sdeR.D6me/xvGsUpUSPNsn3sdXbT/zz5ZaxZVIRa	FinTop_Admin	0386358007	2024-03-17	Hà Nội	../../assets/images/LogoFinTop_notbg.jpg	110	1	3	\N	STANDARD	ACTIVE	2026-06-29 10:14:20.345	2026-07-14 11:27:17.338	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	BOJE
121	withna0610@gmail.com	$2b$10$T804gG8x1h9M4K1K8r8.2er44v3x8z1P8.K7.uC1Vv49O/6.oJc/e	Đào Thị Ngọc Anh	0396727519	2003-10-06	Hà Đông - Hà Nội	/file-image/avatar/avatar_default.png	110	2	58	\N	STANDARD	ACTIVE	2026-06-29 10:53:08.566	2026-07-14 11:27:17.338	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	F861
122	khanhlinhtran10150@gmail.com	$2b$10$T804gG8x1h9M4K1K8r8.2er44v3x8z1P8.K7.uC1Vv49O/6.oJc/e	Trần Khánh Linh	0971764531	1999-01-10	Hà Nội	/file-image/avatar/avatar_default.png	113	2	6	\N	STANDARD	ACTIVE	2026-06-29 10:53:08.57	2026-07-14 11:27:17.338	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	8043
123	hanhnm91@gmail.com	$2b$10$T804gG8x1h9M4K1K8r8.2er44v3x8z1P8.K7.uC1Vv49O/6.oJc/e	Nguyễn Minh Hạnh	0934650459	1991-11-14	Hà Nội	/file-image/avatar/avatar_default.png	110	3	14	\N	STANDARD	ACTIVE	2026-06-29 10:53:08.572	2026-07-14 11:27:17.338	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	5654
69	namanhdapchai@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	22121	0904193275	1995-06-10	hn	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	MODERATE	STANDARD	ACTIVE	2025-07-09 17:17:03	2026-07-14 11:27:17.338	\N	2025-07-09 17:17:03	\N	Linh hoạt kết hợp	namanh123	khac	Thường	\N	2025-07-10	\N	\N	\N	\N	\N	\N
70	congnc2@bidv.com.vn	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Ngô Chí Công	0977765431	0987-08-01	Tiền Giang	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	AGGRESSIVE	STANDARD	ACTIVE	2025-06-26 08:18:31	2026-07-14 11:27:17.338	\N	2025-06-26 08:18:31	\N	Lướt sóng ngắn hạn	263635	vps	Thường	\N	2025-06-26	\N	\N	\N	\N	\N	\N
71	nguyenthanhan6102004@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	nguyễn thành an	0346517036	2004-06-10	hà tĩnh	https://fintopdata.vn/file-image/avatar/avatar_default.png	110	\N	\N	AGGRESSIVE	STANDARD	ACTIVE	2025-06-19 03:21:39	2026-07-14 11:27:17.338	\N	2025-06-19 03:21:39	0 - 3 tháng	Lướt sóng ngắn hạn	S76296	vps	Thường	\N	2025-06-19	\N	\N	\N	\N	\N	\N
72	hoangvu0108mr@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Hoàng Vũ	0899599313	2006-08-01	Hà Nội	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	CONSERVATIVE	STANDARD	ACTIVE	2025-06-13 19:22:53	2026-07-14 11:27:17.338	\N	2025-06-13 19:22:53	6 - 12 tháng	Trung và dài hạn	898874	vps	Thường	\N	2025-06-14	\N	\N	\N	\N	\N	\N
73	nguyencongluat092001@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	luatnc	0355928888	2025-06-13	Phường Thượng Thanh	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	AGGRESSIVE	STANDARD	ACTIVE	2025-06-13 04:20:20	2026-07-14 11:27:17.338	\N	2025-06-13 04:20:20	0 - 3 tháng	Lướt sóng ngắn hạn	\N	TKCK	Thường	\N	2025-06-13	\N	\N	\N	\N	\N	\N
74	minhchienhn33@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	minhchien87	0978211223	1987-11-04	Hà Nội	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	MODERATE	STANDARD	ACTIVE	2025-06-12 14:18:56	2026-07-14 11:27:17.338	\N	2025-06-12 14:18:56	\N	Linh hoạt kết hợp	\N	vps	Thường	\N	2025-06-12	\N	\N	\N	\N	\N	\N
75	ptu186204@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Phạm Thanh Tú	0964908204	2004-06-18	cum 4 Hong Ha Dan Phuong Ha Noi	https://fintopdata.vn/file-image/avatar/avatar_default.png	6	\N	\N	AGGRESSIVE	STANDARD	ACTIVE	2025-06-11 03:00:35	2026-07-14 11:27:17.338	\N	2025-06-11 03:00:35	0 - 3 tháng	Lướt sóng ngắn hạn	S08204	vps	VIP2	\N	2025-06-11	\N	\N	\N	\N	\N	\N
76	xolano8558@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	ANH TUAN	0967578875	1993-02-01	hà tĩnh	https://fintopdata.vn/file-image/avatar/avatar_default.png	6	\N	\N	MODERATE	STANDARD	ACTIVE	2025-06-10 03:38:45	2026-07-14 11:27:17.338	\N	2025-06-10 03:38:45	\N	Linh hoạt kết hợp	N15715	vps	VIP2	\N	2025-06-10	\N	\N	\N	\N	\N	\N
128	leducvh02@gmail.com	$2b$10$T804gG8x1h9M4K1K8r8.2er44v3x8z1P8.K7.uC1Vv49O/6.oJc/e	Lê Đình Đức	0869870233	2002-10-09	Hà Nội	/file-image/avatar/avatar_default.png	116	2	19	\N	STANDARD	ACTIVE	2026-06-29 10:53:08.582	2026-07-14 11:27:17.338	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	BJYE
175	test_billing@fintop.vn	$2b$12$atKY.XOYET0VCLAwx6bgDegexmYcAzyL75J96qTkRkDYDqneK8eNG	Test User Billing	\N	\N	\N	\N	130	\N	\N	\N	STANDARD	ACTIVE	2026-07-07 02:56:37.474	2026-07-14 02:57:04.066	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
77	ntminh0922@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Minh Nguyen Thanh	0913768968	1976-09-22	Ho Chi Minh	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	MODERATE	STANDARD	ACTIVE	2025-06-06 03:23:33	2026-07-14 11:27:17.338	\N	2025-06-06 03:23:33	\N	Linh hoạt kết hợp	\N	vps	Thường	\N	2025-06-06	\N	\N	\N	\N	\N	\N
78	lehatamduong@gmail.com	$2b$10$mC.AZ8qdVJzDqNRaIB.92OpeU.lpyJv3x9CAUDchGDok/VlwK6FoK	Le ha tam duong	0983399321	1981-12-09	Tp Hồ Chí Minh	https://fintopdata.vn/file-image/avatar/avatar_default.png	\N	\N	\N	MODERATE	STANDARD	ACTIVE	2025-06-04 22:52:38	2026-07-14 11:27:17.338	\N	2025-06-04 22:52:38	\N	Linh hoạt kết hợp	\N	vps	Thường	\N	2025-06-05	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: vip_signals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vip_signals (id, "stockId", "authorId", source, direction, status, "minTierAccess", "entryPrice", "cutLossPrice", "targetPrice", notes, "publishedAt", "closedAt", "createdAt", "updatedAt", "deletedAt") FROM stdin;
75	60	1	EXPERT	BUY	PUBLISHED	STANDARD	132400.0000	124000.0000	155000.0000	🔥 FPT breakout khỏi vùng tích lũy 128-132K. Target 1: 145K, Target 2: 155K. AI & Cloud là động lực chính. Volume xác nhận uptrend.	2026-07-06 18:06:39.764	\N	2026-07-07 03:08:40.634	2026-07-07 03:08:40.634	\N
70	38	1	EXPERT	BUY	PUBLISHED	GOLD	91200.0000	86000.0000	105000.0000	📈 VCB đang trong uptrend dài hạn. NIM cải thiện, tín dụng tăng mạnh. Mua tích lũy dần tại vùng 89-92K.	2026-07-05 23:28:27.884	\N	2026-07-07 02:56:45.014	2026-07-07 02:56:45.014	\N
71	37	1	EXPERT	BUY	PUBLISHED	GOLD	29150.0000	26500.0000	34000.0000	⚡ HPG phục hồi theo chu kỳ thép. Giá HRC tăng 15% từ đáy. Dung Quất 2 sẽ bổ sung công suất 20%. Entry: 28.5-29.5K.	2026-07-03 00:24:30.397	\N	2026-07-07 02:56:45.018	2026-07-07 02:56:45.018	\N
72	42	1	EXPERT	BUY	PUBLISHED	GOLD	25800.0000	23500.0000	30000.0000	🏦 MBB banking star — ROE tăng mạnh, CASA cải thiện. P/B chỉ 1.4x — hấp dẫn so với nhóm. Target 30K.	2026-07-03 21:47:50.118	\N	2026-07-07 02:56:45.021	2026-07-07 02:56:45.021	\N
73	45	1	EXPERT	BUY	REACHED_TARGET	GOLD	32000.0000	29000.0000	38000.0000	✅ ĐÃ ĐẠT MỤC TIÊU | SSI hưởng lợi khi thanh khoản thị trường tăng mạnh. Entry 32K → Target 38K đạt. Chốt lời +18.75%.	2026-07-01 14:17:49.271	2026-07-07 02:56:45.025	2026-07-07 02:56:45.026	2026-07-07 02:56:45.026	\N
74	46	1	EXPERT	SELL	CUT_LOSS	GOLD	24000.0000	21500.0000	28000.0000	⚠️ CẮT LỖ | VND giảm mạnh do tin xấu ngành, kích hoạt SL tại 21.5K. Cắt lỗ -10.4%.	2026-07-04 06:05:59.412	2026-07-07 02:56:45.031	2026-07-07 02:56:45.031	2026-07-07 02:56:45.031	\N
\.


--
-- Data for Name: watchlist_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.watchlist_items (id, "watchlistId", "stockId", "addedAt") FROM stdin;
13	13	60	2026-07-07 03:05:36.24
\.


--
-- Data for Name: watchlists; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.watchlists (id, "userId", name, "isDefault", "createdAt", "updatedAt") FROM stdin;
13	12	My Tech Stocks	f	2026-07-07 03:05:36.195	2026-07-07 03:05:36.195
\.


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 1009, true);


--
-- Name: blogs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.blogs_id_seq', 274, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.categories_id_seq', 113, true);


--
-- Name: content_revisions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.content_revisions_id_seq', 83, true);


--
-- Name: copy_trade_copiers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.copy_trade_copiers_id_seq', 4, true);


--
-- Name: copy_trade_masters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.copy_trade_masters_id_seq', 3, true);


--
-- Name: copy_trade_orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.copy_trade_orders_id_seq', 4, true);


--
-- Name: departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.departments_id_seq', 15, true);


--
-- Name: email_verification_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.email_verification_tokens_id_seq', 11, true);


--
-- Name: featured_contents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.featured_contents_id_seq', 1, false);


--
-- Name: financial_indicators_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.financial_indicators_id_seq', 1, false);


--
-- Name: foreign_flow_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.foreign_flow_history_id_seq', 1, false);


--
-- Name: handbooks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.handbooks_id_seq', 67, true);


--
-- Name: industries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.industries_id_seq', 51, true);


--
-- Name: invoices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.invoices_id_seq', 22, true);


--
-- Name: market_breadth_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.market_breadth_history_id_seq', 1, false);


--
-- Name: market_data_sync_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.market_data_sync_logs_id_seq', 39, true);


--
-- Name: market_regime_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.market_regime_history_id_seq', 1, false);


--
-- Name: money_flow_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.money_flow_history_id_seq', 1, false);


--
-- Name: notification_delivery_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notification_delivery_logs_id_seq', 23, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notifications_id_seq', 23, true);


--
-- Name: outbox_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.outbox_events_id_seq', 36, true);


--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.password_reset_tokens_id_seq', 22, true);


--
-- Name: payment_webhook_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.payment_webhook_logs_id_seq', 13, true);


--
-- Name: permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.permissions_id_seq', 14, true);


--
-- Name: portfolio_holdings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.portfolio_holdings_id_seq', 60, true);


--
-- Name: portfolio_nav_snapshots_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.portfolio_nav_snapshots_id_seq', 10, true);


--
-- Name: price_alerts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.price_alerts_id_seq', 13, true);


--
-- Name: recommended_portfolios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.recommended_portfolios_id_seq', 20, true);


--
-- Name: report_files_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.report_files_id_seq', 2, true);


--
-- Name: research_reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.research_reports_id_seq', 1, false);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.roles_id_seq', 11, true);


--
-- Name: sector_rotation_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sector_rotation_history_id_seq', 1, false);


--
-- Name: sectors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sectors_id_seq', 22, true);


--
-- Name: signal_execution_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.signal_execution_logs_id_seq', 24, true);


--
-- Name: signal_targets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.signal_targets_id_seq', 75, true);


--
-- Name: stock_exchanges_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.stock_exchanges_id_seq', 3, true);


--
-- Name: stock_prices_daily_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.stock_prices_daily_id_seq', 39, true);


--
-- Name: stocks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.stocks_id_seq', 60, true);


--
-- Name: subscription_plans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.subscription_plans_id_seq', 18, true);


--
-- Name: tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tags_id_seq', 1, false);


--
-- Name: teams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.teams_id_seq', 76, true);


--
-- Name: transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.transactions_id_seq', 18, true);


--
-- Name: user_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_sessions_id_seq', 221, true);


--
-- Name: user_subscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_subscriptions_id_seq', 18, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 176, true);


--
-- Name: vip_signals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.vip_signals_id_seq', 75, true);


--
-- Name: watchlist_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.watchlist_items_id_seq', 13, true);


--
-- Name: watchlists_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.watchlists_id_seq', 13, true);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: blog_tags blog_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_tags
    ADD CONSTRAINT blog_tags_pkey PRIMARY KEY ("blogId", "tagId");


--
-- Name: blogs blogs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blogs
    ADD CONSTRAINT blogs_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: content_revisions content_revisions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_revisions
    ADD CONSTRAINT content_revisions_pkey PRIMARY KEY (id);


--
-- Name: copy_trade_copiers copy_trade_copiers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copy_trade_copiers
    ADD CONSTRAINT copy_trade_copiers_pkey PRIMARY KEY (id);


--
-- Name: copy_trade_masters copy_trade_masters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copy_trade_masters
    ADD CONSTRAINT copy_trade_masters_pkey PRIMARY KEY (id);


--
-- Name: copy_trade_orders copy_trade_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copy_trade_orders
    ADD CONSTRAINT copy_trade_orders_pkey PRIMARY KEY (id);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: email_verification_tokens email_verification_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_verification_tokens
    ADD CONSTRAINT email_verification_tokens_pkey PRIMARY KEY (id);


--
-- Name: featured_contents featured_contents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.featured_contents
    ADD CONSTRAINT featured_contents_pkey PRIMARY KEY (id);


--
-- Name: financial_indicators financial_indicators_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financial_indicators
    ADD CONSTRAINT financial_indicators_pkey PRIMARY KEY (id);


--
-- Name: foreign_flow_history foreign_flow_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.foreign_flow_history
    ADD CONSTRAINT foreign_flow_history_pkey PRIMARY KEY (id);


--
-- Name: handbooks handbooks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.handbooks
    ADD CONSTRAINT handbooks_pkey PRIMARY KEY (id);


--
-- Name: industries industries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industries
    ADD CONSTRAINT industries_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: market_breadth_history market_breadth_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.market_breadth_history
    ADD CONSTRAINT market_breadth_history_pkey PRIMARY KEY (id);


--
-- Name: market_data_sync_logs market_data_sync_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.market_data_sync_logs
    ADD CONSTRAINT market_data_sync_logs_pkey PRIMARY KEY (id);


--
-- Name: market_regime_history market_regime_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.market_regime_history
    ADD CONSTRAINT market_regime_history_pkey PRIMARY KEY (id);


--
-- Name: money_flow_history money_flow_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.money_flow_history
    ADD CONSTRAINT money_flow_history_pkey PRIMARY KEY (id);


--
-- Name: notification_delivery_logs notification_delivery_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_delivery_logs
    ADD CONSTRAINT notification_delivery_logs_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: outbox_events outbox_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.outbox_events
    ADD CONSTRAINT outbox_events_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: payment_webhook_logs payment_webhook_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_webhook_logs
    ADD CONSTRAINT payment_webhook_logs_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: portfolio_holdings portfolio_holdings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolio_holdings
    ADD CONSTRAINT portfolio_holdings_pkey PRIMARY KEY (id);


--
-- Name: portfolio_nav_snapshots portfolio_nav_snapshots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolio_nav_snapshots
    ADD CONSTRAINT portfolio_nav_snapshots_pkey PRIMARY KEY (id);


--
-- Name: price_alerts price_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.price_alerts
    ADD CONSTRAINT price_alerts_pkey PRIMARY KEY (id);


--
-- Name: recommended_portfolios recommended_portfolios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recommended_portfolios
    ADD CONSTRAINT recommended_portfolios_pkey PRIMARY KEY (id);


--
-- Name: report_files report_files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_files
    ADD CONSTRAINT report_files_pkey PRIMARY KEY (id);


--
-- Name: research_reports research_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.research_reports
    ADD CONSTRAINT research_reports_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY ("roleId", "permissionId");


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: sector_rotation_history sector_rotation_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sector_rotation_history
    ADD CONSTRAINT sector_rotation_history_pkey PRIMARY KEY (id);


--
-- Name: sectors sectors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sectors
    ADD CONSTRAINT sectors_pkey PRIMARY KEY (id);


--
-- Name: signal_execution_logs signal_execution_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signal_execution_logs
    ADD CONSTRAINT signal_execution_logs_pkey PRIMARY KEY (id);


--
-- Name: signal_targets signal_targets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signal_targets
    ADD CONSTRAINT signal_targets_pkey PRIMARY KEY (id);


--
-- Name: stock_exchanges stock_exchanges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_exchanges
    ADD CONSTRAINT stock_exchanges_pkey PRIMARY KEY (id);


--
-- Name: stock_prices_daily stock_prices_daily_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_prices_daily
    ADD CONSTRAINT stock_prices_daily_pkey PRIMARY KEY (id);


--
-- Name: stocks stocks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stocks
    ADD CONSTRAINT stocks_pkey PRIMARY KEY (id);


--
-- Name: subscription_plans subscription_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_pkey PRIMARY KEY (id);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY ("userId", "roleId");


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);


--
-- Name: user_subscriptions user_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vip_signals vip_signals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vip_signals
    ADD CONSTRAINT vip_signals_pkey PRIMARY KEY (id);


--
-- Name: watchlist_items watchlist_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.watchlist_items
    ADD CONSTRAINT watchlist_items_pkey PRIMARY KEY (id);


--
-- Name: watchlists watchlists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.watchlists
    ADD CONSTRAINT watchlists_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_action_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "audit_logs_action_createdAt_idx" ON public.audit_logs USING btree (action, "createdAt");


--
-- Name: audit_logs_tableName_recordId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "audit_logs_tableName_recordId_idx" ON public.audit_logs USING btree ("tableName", "recordId");


--
-- Name: audit_logs_userId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "audit_logs_userId_createdAt_idx" ON public.audit_logs USING btree ("userId", "createdAt");


--
-- Name: blogs_authorId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "blogs_authorId_idx" ON public.blogs USING btree ("authorId");


--
-- Name: blogs_categoryId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "blogs_categoryId_idx" ON public.blogs USING btree ("categoryId");


--
-- Name: blogs_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX blogs_slug_key ON public.blogs USING btree (slug);


--
-- Name: blogs_status_publishedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "blogs_status_publishedAt_idx" ON public.blogs USING btree (status, "publishedAt");


--
-- Name: categories_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX categories_slug_key ON public.categories USING btree (slug);


--
-- Name: content_revisions_blogId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "content_revisions_blogId_createdAt_idx" ON public.content_revisions USING btree ("blogId", "createdAt");


--
-- Name: departments_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX departments_code_key ON public.departments USING btree (code);


--
-- Name: departments_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX departments_name_key ON public.departments USING btree (name);


--
-- Name: departments_status_deletedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "departments_status_deletedAt_idx" ON public.departments USING btree (status, "deletedAt");


--
-- Name: email_verification_tokens_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "email_verification_tokens_userId_idx" ON public.email_verification_tokens USING btree ("userId");


--
-- Name: featured_contents_blogId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "featured_contents_blogId_key" ON public.featured_contents USING btree ("blogId");


--
-- Name: featured_contents_position_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX featured_contents_position_idx ON public.featured_contents USING btree ("position");


--
-- Name: financial_indicators_stockId_period_date_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "financial_indicators_stockId_period_date_key" ON public.financial_indicators USING btree ("stockId", period, date);


--
-- Name: foreign_flow_history_sector_code_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX foreign_flow_history_sector_code_idx ON public.foreign_flow_history USING btree (sector_code);


--
-- Name: foreign_flow_history_ticker_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX foreign_flow_history_ticker_idx ON public.foreign_flow_history USING btree (ticker);


--
-- Name: foreign_flow_history_trade_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX foreign_flow_history_trade_date_idx ON public.foreign_flow_history USING btree (trade_date);


--
-- Name: foreign_flow_history_trade_date_ticker_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX foreign_flow_history_trade_date_ticker_key ON public.foreign_flow_history USING btree (trade_date, ticker);


--
-- Name: industries_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX industries_code_key ON public.industries USING btree (code);


--
-- Name: industries_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX industries_name_key ON public.industries USING btree (name);


--
-- Name: industries_sectorId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "industries_sectorId_idx" ON public.industries USING btree ("sectorId");


--
-- Name: invoices_userId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "invoices_userId_status_idx" ON public.invoices USING btree ("userId", status);


--
-- Name: market_breadth_history_exchange_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX market_breadth_history_exchange_idx ON public.market_breadth_history USING btree (exchange);


--
-- Name: market_breadth_history_trade_date_exchange_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX market_breadth_history_trade_date_exchange_key ON public.market_breadth_history USING btree (trade_date, exchange);


--
-- Name: market_breadth_history_trade_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX market_breadth_history_trade_date_idx ON public.market_breadth_history USING btree (trade_date);


--
-- Name: market_data_sync_logs_status_startedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "market_data_sync_logs_status_startedAt_idx" ON public.market_data_sync_logs USING btree (status, "startedAt");


--
-- Name: market_regime_history_index_code_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX market_regime_history_index_code_idx ON public.market_regime_history USING btree (index_code);


--
-- Name: market_regime_history_trade_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX market_regime_history_trade_date_idx ON public.market_regime_history USING btree (trade_date);


--
-- Name: market_regime_history_trade_date_index_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX market_regime_history_trade_date_index_code_key ON public.market_regime_history USING btree (trade_date, index_code);


--
-- Name: money_flow_history_sector_code_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX money_flow_history_sector_code_idx ON public.money_flow_history USING btree (sector_code);


--
-- Name: money_flow_history_ticker_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX money_flow_history_ticker_idx ON public.money_flow_history USING btree (ticker);


--
-- Name: money_flow_history_trade_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX money_flow_history_trade_date_idx ON public.money_flow_history USING btree (trade_date);


--
-- Name: money_flow_history_trade_date_ticker_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX money_flow_history_trade_date_ticker_key ON public.money_flow_history USING btree (trade_date, ticker);


--
-- Name: notification_delivery_logs_notificationId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "notification_delivery_logs_notificationId_idx" ON public.notification_delivery_logs USING btree ("notificationId");


--
-- Name: notifications_userId_status_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "notifications_userId_status_createdAt_idx" ON public.notifications USING btree ("userId", status, "createdAt");


--
-- Name: outbox_events_status_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "outbox_events_status_createdAt_idx" ON public.outbox_events USING btree (status, "createdAt");


--
-- Name: password_reset_tokens_token_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX password_reset_tokens_token_idx ON public.password_reset_tokens USING btree (token);


--
-- Name: password_reset_tokens_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX password_reset_tokens_token_key ON public.password_reset_tokens USING btree (token);


--
-- Name: password_reset_tokens_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "password_reset_tokens_userId_idx" ON public.password_reset_tokens USING btree ("userId");


--
-- Name: payment_webhook_logs_idempotencyKey_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "payment_webhook_logs_idempotencyKey_key" ON public.payment_webhook_logs USING btree ("idempotencyKey");


--
-- Name: permissions_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX permissions_code_key ON public.permissions USING btree (code);


--
-- Name: permissions_module_action_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX permissions_module_action_idx ON public.permissions USING btree (module, action);


--
-- Name: portfolio_holdings_portfolioId_stockId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "portfolio_holdings_portfolioId_stockId_key" ON public.portfolio_holdings USING btree ("portfolioId", "stockId");


--
-- Name: portfolio_nav_snapshots_portfolioId_date_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "portfolio_nav_snapshots_portfolioId_date_key" ON public.portfolio_nav_snapshots USING btree ("portfolioId", date);


--
-- Name: price_alerts_status_stockId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "price_alerts_status_stockId_idx" ON public.price_alerts USING btree (status, "stockId");


--
-- Name: price_alerts_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "price_alerts_userId_idx" ON public.price_alerts USING btree ("userId");


--
-- Name: recommended_portfolios_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX recommended_portfolios_status_idx ON public.recommended_portfolios USING btree (status);


--
-- Name: report_files_status_reportType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "report_files_status_reportType_idx" ON public.report_files USING btree (status, "reportType");


--
-- Name: research_reports_report_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX research_reports_report_type_idx ON public.research_reports USING btree (report_type);


--
-- Name: research_reports_subject_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX research_reports_subject_idx ON public.research_reports USING btree (subject);


--
-- Name: roles_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX roles_code_key ON public.roles USING btree (code);


--
-- Name: roles_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX roles_name_key ON public.roles USING btree (name);


--
-- Name: sector_rotation_history_sector_code_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sector_rotation_history_sector_code_idx ON public.sector_rotation_history USING btree (sector_code);


--
-- Name: sector_rotation_history_trade_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sector_rotation_history_trade_date_idx ON public.sector_rotation_history USING btree (trade_date);


--
-- Name: sector_rotation_history_trade_date_sector_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX sector_rotation_history_trade_date_sector_code_key ON public.sector_rotation_history USING btree (trade_date, sector_code);


--
-- Name: sectors_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX sectors_code_key ON public.sectors USING btree (code);


--
-- Name: sectors_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX sectors_name_key ON public.sectors USING btree (name);


--
-- Name: signal_execution_logs_signalId_executedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "signal_execution_logs_signalId_executedAt_idx" ON public.signal_execution_logs USING btree ("signalId", "executedAt");


--
-- Name: signal_targets_signalId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "signal_targets_signalId_idx" ON public.signal_targets USING btree ("signalId");


--
-- Name: stock_exchanges_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX stock_exchanges_code_key ON public.stock_exchanges USING btree (code);


--
-- Name: stock_prices_daily_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_prices_daily_date_idx ON public.stock_prices_daily USING btree (date);


--
-- Name: stock_prices_daily_stockId_date_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "stock_prices_daily_stockId_date_key" ON public.stock_prices_daily USING btree ("stockId", date);


--
-- Name: stocks_exchangeId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "stocks_exchangeId_status_idx" ON public.stocks USING btree ("exchangeId", status);


--
-- Name: stocks_industryId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "stocks_industryId_idx" ON public.stocks USING btree ("industryId");


--
-- Name: stocks_isin_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX stocks_isin_key ON public.stocks USING btree (isin);


--
-- Name: stocks_symbol_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX stocks_symbol_key ON public.stocks USING btree (symbol);


--
-- Name: tags_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX tags_slug_key ON public.tags USING btree (slug);


--
-- Name: teams_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX teams_code_key ON public.teams USING btree (code);


--
-- Name: teams_departmentId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "teams_departmentId_status_idx" ON public.teams USING btree ("departmentId", status);


--
-- Name: teams_leaderId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "teams_leaderId_status_idx" ON public.teams USING btree ("leaderId", status);


--
-- Name: transactions_invoiceId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "transactions_invoiceId_status_idx" ON public.transactions USING btree ("invoiceId", status);


--
-- Name: transactions_providerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "transactions_providerId_idx" ON public.transactions USING btree ("providerId");


--
-- Name: user_roles_roleId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "user_roles_roleId_idx" ON public.user_roles USING btree ("roleId");


--
-- Name: user_sessions_refreshToken_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "user_sessions_refreshToken_idx" ON public.user_sessions USING btree ("refreshToken");


--
-- Name: user_sessions_refreshToken_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "user_sessions_refreshToken_key" ON public.user_sessions USING btree ("refreshToken");


--
-- Name: user_sessions_userId_isRevoked_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "user_sessions_userId_isRevoked_idx" ON public.user_sessions USING btree ("userId", "isRevoked");


--
-- Name: user_subscriptions_endDate_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "user_subscriptions_endDate_status_idx" ON public.user_subscriptions USING btree ("endDate", status);


--
-- Name: user_subscriptions_userId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "user_subscriptions_userId_status_idx" ON public.user_subscriptions USING btree ("userId", status);


--
-- Name: users_brokerId_deletedAt_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "users_brokerId_deletedAt_status_idx" ON public.users USING btree ("brokerId", "deletedAt", status);


--
-- Name: users_departmentId_teamId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "users_departmentId_teamId_status_idx" ON public.users USING btree ("departmentId", "teamId", status);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_email_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_email_status_idx ON public.users USING btree (email, status);


--
-- Name: users_phone_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_phone_key ON public.users USING btree (phone);


--
-- Name: users_phone_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_phone_status_idx ON public.users USING btree (phone, status);


--
-- Name: vip_signals_status_publishedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "vip_signals_status_publishedAt_idx" ON public.vip_signals USING btree (status, "publishedAt");


--
-- Name: vip_signals_stockId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "vip_signals_stockId_idx" ON public.vip_signals USING btree ("stockId");


--
-- Name: watchlist_items_watchlistId_stockId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "watchlist_items_watchlistId_stockId_key" ON public.watchlist_items USING btree ("watchlistId", "stockId");


--
-- Name: watchlists_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "watchlists_userId_idx" ON public.watchlists USING btree ("userId");


--
-- Name: watchlists_userId_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "watchlists_userId_name_key" ON public.watchlists USING btree ("userId", name);


--
-- Name: audit_logs audit_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: blog_tags blog_tags_blogId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_tags
    ADD CONSTRAINT "blog_tags_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES public.blogs(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: blog_tags blog_tags_tagId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_tags
    ADD CONSTRAINT "blog_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES public.tags(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: blogs blogs_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blogs
    ADD CONSTRAINT "blogs_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: blogs blogs_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blogs
    ADD CONSTRAINT "blogs_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: content_revisions content_revisions_blogId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_revisions
    ADD CONSTRAINT "content_revisions_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES public.blogs(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: content_revisions content_revisions_editorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_revisions
    ADD CONSTRAINT "content_revisions_editorId_fkey" FOREIGN KEY ("editorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: copy_trade_copiers copy_trade_copiers_masterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copy_trade_copiers
    ADD CONSTRAINT "copy_trade_copiers_masterId_fkey" FOREIGN KEY ("masterId") REFERENCES public.copy_trade_masters(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: copy_trade_orders copy_trade_orders_masterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copy_trade_orders
    ADD CONSTRAINT "copy_trade_orders_masterId_fkey" FOREIGN KEY ("masterId") REFERENCES public.copy_trade_masters(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: email_verification_tokens email_verification_tokens_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_verification_tokens
    ADD CONSTRAINT "email_verification_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: featured_contents featured_contents_blogId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.featured_contents
    ADD CONSTRAINT "featured_contents_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES public.blogs(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: financial_indicators financial_indicators_stockId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financial_indicators
    ADD CONSTRAINT "financial_indicators_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES public.stocks(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: industries industries_sectorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industries
    ADD CONSTRAINT "industries_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES public.sectors(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: invoices invoices_subscriptionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "invoices_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES public.user_subscriptions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: invoices invoices_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "invoices_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: notification_delivery_logs notification_delivery_logs_notificationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_delivery_logs
    ADD CONSTRAINT "notification_delivery_logs_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES public.notifications(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifications notifications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: password_reset_tokens password_reset_tokens_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: portfolio_holdings portfolio_holdings_portfolioId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolio_holdings
    ADD CONSTRAINT "portfolio_holdings_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES public.recommended_portfolios(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: portfolio_holdings portfolio_holdings_stockId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolio_holdings
    ADD CONSTRAINT "portfolio_holdings_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES public.stocks(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: portfolio_nav_snapshots portfolio_nav_snapshots_portfolioId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolio_nav_snapshots
    ADD CONSTRAINT "portfolio_nav_snapshots_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES public.recommended_portfolios(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: price_alerts price_alerts_stockId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.price_alerts
    ADD CONSTRAINT "price_alerts_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES public.stocks(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: price_alerts price_alerts_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.price_alerts
    ADD CONSTRAINT "price_alerts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: recommended_portfolios recommended_portfolios_managerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recommended_portfolios
    ADD CONSTRAINT "recommended_portfolios_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: report_files report_files_uploaderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_files
    ADD CONSTRAINT "report_files_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: role_permissions role_permissions_assignedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "role_permissions_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: role_permissions role_permissions_permissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES public.permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: signal_execution_logs signal_execution_logs_signalId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signal_execution_logs
    ADD CONSTRAINT "signal_execution_logs_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES public.vip_signals(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: signal_targets signal_targets_signalId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signal_targets
    ADD CONSTRAINT "signal_targets_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES public.vip_signals(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: stock_prices_daily stock_prices_daily_stockId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_prices_daily
    ADD CONSTRAINT "stock_prices_daily_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES public.stocks(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stocks stocks_exchangeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stocks
    ADD CONSTRAINT "stocks_exchangeId_fkey" FOREIGN KEY ("exchangeId") REFERENCES public.stock_exchanges(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stocks stocks_industryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stocks
    ADD CONSTRAINT "stocks_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES public.industries(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: teams teams_departmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT "teams_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES public.departments(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: teams teams_leaderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT "teams_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: transactions transactions_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT "transactions_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public.invoices(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: user_roles user_roles_assignedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT "user_roles_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: user_roles user_roles_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_roles user_roles_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_sessions user_sessions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT "user_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_subscriptions user_subscriptions_planId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT "user_subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES public.subscription_plans(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: user_subscriptions user_subscriptions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT "user_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: users users_brokerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: users users_departmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES public.departments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: users users_teamId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES public.teams(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: vip_signals vip_signals_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vip_signals
    ADD CONSTRAINT "vip_signals_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: vip_signals vip_signals_stockId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vip_signals
    ADD CONSTRAINT "vip_signals_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES public.stocks(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: watchlist_items watchlist_items_stockId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.watchlist_items
    ADD CONSTRAINT "watchlist_items_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES public.stocks(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: watchlist_items watchlist_items_watchlistId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.watchlist_items
    ADD CONSTRAINT "watchlist_items_watchlistId_fkey" FOREIGN KEY ("watchlistId") REFERENCES public.watchlists(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: watchlists watchlists_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.watchlists
    ADD CONSTRAINT "watchlists_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict EznCQIlUdarFMqBpFomee93sOTudDGiBOVcOxvTbWBPl7zdDEs5J3FKXfx1Sbxp


-- AlterTable
ALTER TABLE "stocks" ADD COLUMN     "act" VARCHAR(50),
ADD COLUMN     "analyst" VARCHAR(100),
ADD COLUMN     "identify_trend" TEXT,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "resistance_range" VARCHAR(100),
ADD COLUMN     "rsi_mfi" VARCHAR(50),
ADD COLUMN     "support_range" VARCHAR(100),
ADD COLUMN     "top_status" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "trading_price_range" VARCHAR(100);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "emailVerifiedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "copy_trade_masters" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "strategy" VARCHAR(255) NOT NULL,
    "aum" DECIMAL(19,4) NOT NULL,
    "followers" INTEGER NOT NULL DEFAULT 0,
    "profit" DECIMAL(9,2) NOT NULL,
    "winRate" DECIMAL(5,2) NOT NULL,
    "status" "RECORD_STATUS" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "copy_trade_masters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "copy_trade_copiers" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "masterId" INTEGER NOT NULL,
    "capital" DECIMAL(19,4) NOT NULL,
    "multiplier" DECIMAL(5,2) NOT NULL,
    "profit" DECIMAL(19,4) NOT NULL,
    "status" "RECORD_STATUS" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "copy_trade_copiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "copy_trade_orders" (
    "id" SERIAL NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "masterId" INTEGER NOT NULL,
    "symbol" VARCHAR(10) NOT NULL,
    "action" VARCHAR(10) NOT NULL,
    "price" DECIMAL(19,4) NOT NULL,
    "quantity" BIGINT NOT NULL,
    "accounts" INTEGER NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
    "successRate" DECIMAL(5,2) NOT NULL DEFAULT 100.00,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "copy_trade_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sector_rotation_history" (
    "id" SERIAL NOT NULL,
    "trade_date" DATE NOT NULL,
    "sector_code" VARCHAR(50) NOT NULL,
    "sector_name" VARCHAR(100) NOT NULL,
    "return_1d" DECIMAL(9,4),
    "return_1w" DECIMAL(9,4),
    "return_1m" DECIMAL(9,4),
    "return_3m" DECIMAL(9,4),
    "return_6m" DECIMAL(9,4),
    "return_ytd" DECIMAL(9,4),
    "relative_strength" DECIMAL(9,4),
    "rank_1m" INTEGER,
    "rank_3m" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sector_rotation_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "money_flow_history" (
    "id" BIGSERIAL NOT NULL,
    "trade_date" DATE NOT NULL,
    "ticker" VARCHAR(10) NOT NULL,
    "sector_code" VARCHAR(50),
    "sector_name" VARCHAR(100),
    "market_cap_group" VARCHAR(20),
    "buy_value" DECIMAL(19,4),
    "sell_value" DECIMAL(19,4),
    "net_value" DECIMAL(19,4),
    "total_value" DECIMAL(19,4),
    "net_value_ratio" DECIMAL(9,4),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "money_flow_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "foreign_flow_history" (
    "id" BIGSERIAL NOT NULL,
    "trade_date" DATE NOT NULL,
    "ticker" VARCHAR(10) NOT NULL,
    "sector_code" VARCHAR(50),
    "sector_name" VARCHAR(100),
    "foreign_buy_value" DECIMAL(19,4),
    "foreign_sell_value" DECIMAL(19,4),
    "foreign_net_value" DECIMAL(19,4),
    "foreign_buy_volume" BIGINT,
    "foreign_sell_volume" BIGINT,
    "foreign_net_volume" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "foreign_flow_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_breadth_history" (
    "id" SERIAL NOT NULL,
    "trade_date" DATE NOT NULL,
    "exchange" VARCHAR(20) NOT NULL,
    "advancing_count" INTEGER NOT NULL,
    "declining_count" INTEGER NOT NULL,
    "unchanged_count" INTEGER NOT NULL,
    "total_count" INTEGER NOT NULL,
    "advance_decline_ratio" DECIMAL(9,4),
    "new_high_count" INTEGER,
    "new_low_count" INTEGER,
    "above_ma20_count" INTEGER,
    "above_ma50_count" INTEGER,
    "above_ma200_count" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "market_breadth_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_regime_history" (
    "id" SERIAL NOT NULL,
    "trade_date" DATE NOT NULL,
    "index_code" VARCHAR(20) NOT NULL,
    "close" DECIMAL(19,4) NOT NULL,
    "ema20" DECIMAL(19,4),
    "ema50" DECIMAL(19,4),
    "ema200" DECIMAL(19,4),
    "atr" DECIMAL(19,4),
    "adx" DECIMAL(19,4),
    "regime" VARCHAR(20) NOT NULL,
    "risk_score" INTEGER,
    "explanation" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "market_regime_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "research_reports" (
    "id" SERIAL NOT NULL,
    "report_type" VARCHAR(50) NOT NULL,
    "subject" VARCHAR(100) NOT NULL,
    "language" VARCHAR(10) NOT NULL,
    "format" VARCHAR(20) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata_json" JSONB,

    CONSTRAINT "research_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" BIGSERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_verification_tokens" (
    "id" BIGSERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "code" VARCHAR(6) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sector_rotation_history_trade_date_idx" ON "sector_rotation_history"("trade_date");

-- CreateIndex
CREATE INDEX "sector_rotation_history_sector_code_idx" ON "sector_rotation_history"("sector_code");

-- CreateIndex
CREATE UNIQUE INDEX "sector_rotation_history_trade_date_sector_code_key" ON "sector_rotation_history"("trade_date", "sector_code");

-- CreateIndex
CREATE INDEX "money_flow_history_trade_date_idx" ON "money_flow_history"("trade_date");

-- CreateIndex
CREATE INDEX "money_flow_history_ticker_idx" ON "money_flow_history"("ticker");

-- CreateIndex
CREATE INDEX "money_flow_history_sector_code_idx" ON "money_flow_history"("sector_code");

-- CreateIndex
CREATE UNIQUE INDEX "money_flow_history_trade_date_ticker_key" ON "money_flow_history"("trade_date", "ticker");

-- CreateIndex
CREATE INDEX "foreign_flow_history_trade_date_idx" ON "foreign_flow_history"("trade_date");

-- CreateIndex
CREATE INDEX "foreign_flow_history_ticker_idx" ON "foreign_flow_history"("ticker");

-- CreateIndex
CREATE INDEX "foreign_flow_history_sector_code_idx" ON "foreign_flow_history"("sector_code");

-- CreateIndex
CREATE UNIQUE INDEX "foreign_flow_history_trade_date_ticker_key" ON "foreign_flow_history"("trade_date", "ticker");

-- CreateIndex
CREATE INDEX "market_breadth_history_trade_date_idx" ON "market_breadth_history"("trade_date");

-- CreateIndex
CREATE INDEX "market_breadth_history_exchange_idx" ON "market_breadth_history"("exchange");

-- CreateIndex
CREATE UNIQUE INDEX "market_breadth_history_trade_date_exchange_key" ON "market_breadth_history"("trade_date", "exchange");

-- CreateIndex
CREATE INDEX "market_regime_history_trade_date_idx" ON "market_regime_history"("trade_date");

-- CreateIndex
CREATE INDEX "market_regime_history_index_code_idx" ON "market_regime_history"("index_code");

-- CreateIndex
CREATE UNIQUE INDEX "market_regime_history_trade_date_index_code_key" ON "market_regime_history"("trade_date", "index_code");

-- CreateIndex
CREATE INDEX "research_reports_report_type_idx" ON "research_reports"("report_type");

-- CreateIndex
CREATE INDEX "research_reports_subject_idx" ON "research_reports"("subject");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_token_idx" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_userId_idx" ON "password_reset_tokens"("userId");

-- CreateIndex
CREATE INDEX "email_verification_tokens_userId_idx" ON "email_verification_tokens"("userId");

-- AddForeignKey
ALTER TABLE "copy_trade_copiers" ADD CONSTRAINT "copy_trade_copiers_masterId_fkey" FOREIGN KEY ("masterId") REFERENCES "copy_trade_masters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "copy_trade_orders" ADD CONSTRAINT "copy_trade_orders_masterId_fkey" FOREIGN KEY ("masterId") REFERENCES "copy_trade_masters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

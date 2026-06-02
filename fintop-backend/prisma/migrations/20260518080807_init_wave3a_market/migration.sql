-- CreateEnum
CREATE TYPE "STOCK_STATUS" AS ENUM ('ACTIVE', 'SUSPENDED', 'DELISTED');

-- CreateEnum
CREATE TYPE "EXCHANGE_CODE" AS ENUM ('HOSE', 'HNX', 'UPCOM');

-- CreateEnum
CREATE TYPE "MARKET_SYNC_STATUS" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "INDICATOR_PERIOD" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');

-- CreateTable
CREATE TABLE "sectors" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "status" "RECORD_STATUS" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "sectors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "industries" (
    "id" SERIAL NOT NULL,
    "sectorId" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "status" "RECORD_STATUS" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "industries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_exchanges" (
    "id" SERIAL NOT NULL,
    "code" "EXCHANGE_CODE" NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "status" "RECORD_STATUS" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_exchanges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stocks" (
    "id" SERIAL NOT NULL,
    "symbol" VARCHAR(10) NOT NULL,
    "companyName" VARCHAR(255) NOT NULL,
    "exchangeId" INTEGER NOT NULL,
    "industryId" INTEGER,
    "status" "STOCK_STATUS" NOT NULL DEFAULT 'ACTIVE',
    "isin" VARCHAR(50),
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "stocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_prices_daily" (
    "id" BIGSERIAL NOT NULL,
    "stockId" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "open" DECIMAL(19,4) NOT NULL,
    "high" DECIMAL(19,4) NOT NULL,
    "low" DECIMAL(19,4) NOT NULL,
    "close" DECIMAL(19,4) NOT NULL,
    "volume" BIGINT NOT NULL,
    "adjClose" DECIMAL(19,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_prices_daily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_indicators" (
    "id" BIGSERIAL NOT NULL,
    "stockId" INTEGER NOT NULL,
    "period" "INDICATOR_PERIOD" NOT NULL,
    "date" DATE NOT NULL,
    "peRatio" DECIMAL(19,4),
    "pbRatio" DECIMAL(19,4),
    "eps" DECIMAL(19,4),
    "marketCap" DECIMAL(24,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_indicators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_data_sync_logs" (
    "id" BIGSERIAL NOT NULL,
    "source" VARCHAR(100) NOT NULL,
    "syncType" VARCHAR(50) NOT NULL,
    "status" "MARKET_SYNC_STATUS" NOT NULL DEFAULT 'PENDING',
    "recordsUpserted" INTEGER NOT NULL DEFAULT 0,
    "recordsFailed" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "market_data_sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sectors_name_key" ON "sectors"("name");

-- CreateIndex
CREATE UNIQUE INDEX "sectors_code_key" ON "sectors"("code");

-- CreateIndex
CREATE UNIQUE INDEX "industries_name_key" ON "industries"("name");

-- CreateIndex
CREATE UNIQUE INDEX "industries_code_key" ON "industries"("code");

-- CreateIndex
CREATE INDEX "industries_sectorId_idx" ON "industries"("sectorId");

-- CreateIndex
CREATE UNIQUE INDEX "stock_exchanges_code_key" ON "stock_exchanges"("code");

-- CreateIndex
CREATE UNIQUE INDEX "stocks_symbol_key" ON "stocks"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "stocks_isin_key" ON "stocks"("isin");

-- CreateIndex
CREATE INDEX "stocks_exchangeId_status_idx" ON "stocks"("exchangeId", "status");

-- CreateIndex
CREATE INDEX "stocks_industryId_idx" ON "stocks"("industryId");

-- CreateIndex
CREATE INDEX "stock_prices_daily_date_idx" ON "stock_prices_daily"("date");

-- CreateIndex
CREATE UNIQUE INDEX "stock_prices_daily_stockId_date_key" ON "stock_prices_daily"("stockId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "financial_indicators_stockId_period_date_key" ON "financial_indicators"("stockId", "period", "date");

-- CreateIndex
CREATE INDEX "market_data_sync_logs_status_startedAt_idx" ON "market_data_sync_logs"("status", "startedAt");

-- AddForeignKey
ALTER TABLE "industries" ADD CONSTRAINT "industries_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "sectors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stocks" ADD CONSTRAINT "stocks_exchangeId_fkey" FOREIGN KEY ("exchangeId") REFERENCES "stock_exchanges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stocks" ADD CONSTRAINT "stocks_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "industries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_prices_daily" ADD CONSTRAINT "stock_prices_daily_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "stocks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_indicators" ADD CONSTRAINT "financial_indicators_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "stocks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

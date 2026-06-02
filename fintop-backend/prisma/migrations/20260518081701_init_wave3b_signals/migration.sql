-- CreateEnum
CREATE TYPE "SIGNAL_STATUS" AS ENUM ('DRAFT', 'PUBLISHED', 'REACHED_TARGET', 'CUT_LOSS', 'CLOSED');

-- CreateEnum
CREATE TYPE "SIGNAL_DIRECTION" AS ENUM ('BUY', 'SELL');

-- CreateEnum
CREATE TYPE "PORTFOLIO_STATUS" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "SIGNAL_SOURCE" AS ENUM ('SYSTEM', 'EXPERT');

-- CreateTable
CREATE TABLE "vip_signals" (
    "id" SERIAL NOT NULL,
    "stockId" INTEGER NOT NULL,
    "authorId" INTEGER,
    "source" "SIGNAL_SOURCE" NOT NULL DEFAULT 'EXPERT',
    "direction" "SIGNAL_DIRECTION" NOT NULL,
    "status" "SIGNAL_STATUS" NOT NULL DEFAULT 'DRAFT',
    "minTierAccess" "SUBSCRIPTION_TIER" NOT NULL DEFAULT 'GOLD',
    "entryPrice" DECIMAL(19,4) NOT NULL,
    "cutLossPrice" DECIMAL(19,4) NOT NULL,
    "targetPrice" DECIMAL(19,4) NOT NULL,
    "notes" TEXT,
    "publishedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "vip_signals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "signal_targets" (
    "id" SERIAL NOT NULL,
    "signalId" INTEGER NOT NULL,
    "price" DECIMAL(19,4) NOT NULL,
    "targetIndex" INTEGER NOT NULL,
    "isHit" BOOLEAN NOT NULL DEFAULT false,
    "hitAt" TIMESTAMP(3),

    CONSTRAINT "signal_targets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "signal_execution_logs" (
    "id" BIGSERIAL NOT NULL,
    "signalId" INTEGER NOT NULL,
    "fromStatus" "SIGNAL_STATUS" NOT NULL,
    "toStatus" "SIGNAL_STATUS" NOT NULL,
    "triggerPrice" DECIMAL(19,4),
    "reason" TEXT,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "signal_execution_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommended_portfolios" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "managerId" INTEGER,
    "status" "PORTFOLIO_STATUS" NOT NULL DEFAULT 'DRAFT',
    "minTierAccess" "SUBSCRIPTION_TIER" NOT NULL DEFAULT 'GOLD',
    "initialCapital" DECIMAL(19,4) NOT NULL,
    "currentNav" DECIMAL(19,4) NOT NULL,
    "cashBalance" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "recommended_portfolios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolio_holdings" (
    "id" SERIAL NOT NULL,
    "portfolioId" INTEGER NOT NULL,
    "stockId" INTEGER NOT NULL,
    "quantity" BIGINT NOT NULL,
    "avgEntryPrice" DECIMAL(19,4) NOT NULL,
    "currentPrice" DECIMAL(19,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolio_holdings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolio_nav_snapshots" (
    "id" BIGSERIAL NOT NULL,
    "portfolioId" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "nav" DECIMAL(19,4) NOT NULL,
    "cashBalance" DECIMAL(19,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portfolio_nav_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "vip_signals_status_publishedAt_idx" ON "vip_signals"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "vip_signals_stockId_idx" ON "vip_signals"("stockId");

-- CreateIndex
CREATE INDEX "signal_targets_signalId_idx" ON "signal_targets"("signalId");

-- CreateIndex
CREATE INDEX "signal_execution_logs_signalId_executedAt_idx" ON "signal_execution_logs"("signalId", "executedAt");

-- CreateIndex
CREATE INDEX "recommended_portfolios_status_idx" ON "recommended_portfolios"("status");

-- CreateIndex
CREATE UNIQUE INDEX "portfolio_holdings_portfolioId_stockId_key" ON "portfolio_holdings"("portfolioId", "stockId");

-- CreateIndex
CREATE UNIQUE INDEX "portfolio_nav_snapshots_portfolioId_date_key" ON "portfolio_nav_snapshots"("portfolioId", "date");

-- AddForeignKey
ALTER TABLE "vip_signals" ADD CONSTRAINT "vip_signals_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "stocks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vip_signals" ADD CONSTRAINT "vip_signals_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signal_targets" ADD CONSTRAINT "signal_targets_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES "vip_signals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signal_execution_logs" ADD CONSTRAINT "signal_execution_logs_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES "vip_signals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommended_portfolios" ADD CONSTRAINT "recommended_portfolios_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_holdings" ADD CONSTRAINT "portfolio_holdings_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "recommended_portfolios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_holdings" ADD CONSTRAINT "portfolio_holdings_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "stocks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_nav_snapshots" ADD CONSTRAINT "portfolio_nav_snapshots_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "recommended_portfolios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

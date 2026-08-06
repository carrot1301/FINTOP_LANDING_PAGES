"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketService = void 0;
const common_1 = require("@nestjs/common");
const market_repository_1 = require("./market.repository");
const redis_service_1 = require("../../common/redis/redis.service");
const vn_stock_directory_1 = require("./vn-stock-directory");
const prisma_service_1 = require("../../common/database/prisma.service");
const client_1 = require("@prisma/client");
let MarketService = class MarketService {
    repository;
    redisService;
    prisma;
    industryMapping = {
        'Công nghệ thông tin': 'Công nghệ thông tin',
        'Bán buôn, bán lẻ': 'Bán buôn, bán lẻ',
        'Bán lẻ': 'Bán lẻ',
        'Bảo hiểm': 'Bảo hiểm',
        'Bất động sản': 'Bất động sản',
        'BĐS - KCN': 'BĐS - KCN',
        'Chứng khoán': 'Chứng khoán',
        'Dầu khí': 'Dầu khí',
        'Dệt may': 'Dệt may',
        'Dược phẩm - Y tế': 'Dược phẩm - Y tế',
        'Đa ngành': 'Đa ngành',
        'Hàng không': 'Hàng không',
        'Khai khoáng': 'Khai khoáng',
        'Năng lượng/Điện/Nước': 'Năng lượng/Điện/Nước',
        'Ngân Hàng': 'Ngân Hàng',
        'Phân bón': 'Phân bón',
        'Sản xuất NN/CN': 'Sản xuất NN/CN',
        'Thép - Vật liệu': 'Thép - Vật liệu',
        'Thực phẩm': 'Thực phẩm',
        'Thủy sản': 'Thủy sản',
        'Vận tải biển': 'Vận tải biển',
        'Vận tải kho': 'Vận tải kho',
        'Viễn thông': 'Viễn thông',
        'Xây dựng': 'Xây dựng',
        'Xuất nhập khẩu': 'Xuất nhập khẩu',
    };
    constructor(repository, redisService, prisma) {
        this.repository = repository;
        this.redisService = redisService;
        this.prisma = prisma;
    }
    async getStock(symbol) {
        const cacheKey = `quotes:latest:${symbol}`;
        const cachedData = await this.redisService.getClient().get(cacheKey);
        const cached = cachedData ? JSON.parse(cachedData) : null;
        const stock = await this.repository.findStockBySymbol(symbol);
        if (!stock)
            throw new common_1.NotFoundException('Stock not found');
        return {
            ...stock,
            realtimeQuote: cached || null,
        };
    }
    async getSectors() {
        return this.repository.getSectors();
    }
    async listActiveStocks() {
        const stocks = await this.repository.getStocks({});
        const actToStatus = (act) => {
            const norm = (act || '').toUpperCase();
            if (norm === 'RẤT TÍCH CỰC')
                return 'very-positive';
            if (norm === 'TÍCH CỰC')
                return 'positive';
            if (norm === 'KHẢ QUAN')
                return 'ok';
            if (norm === 'TRUNG LẬP')
                return 'neutral';
            if (norm === 'KO TÍCH CỰC')
                return 'negative';
            if (norm === 'TIÊU CỰC')
                return 'negative';
            return 'neutral';
        };
        const mapped = await Promise.all(stocks.map(async (s) => {
            const cacheKey = `quotes:latest:${s.symbol}`;
            let cached = null;
            try {
                const cachedData = await this.redisService.getClient().get(cacheKey);
                if (cachedData) {
                    cached = JSON.parse(cachedData);
                }
            }
            catch (err) { }
            const defaultPrice = s.symbol === 'FPT' ? 132400 : (s.symbol === 'HPG' ? 29150 : (s.symbol === 'VCB' ? 91200 : 35000));
            const closePrice = cached?.close ? Number(cached.close) : defaultPrice;
            const changePct = cached?.change_pct ? Number(cached.change_pct) : (s.symbol === 'FPT' ? 1.85 : (s.symbol === 'HPG' ? 0.52 : -0.2));
            return {
                id: s.id,
                ticker: s.symbol,
                companyName: s.companyName,
                exchange: s.exchange.code,
                sector: s.industry?.sector?.name || 'Đa ngành',
                industry: s.industry?.name || 'Đa ngành',
                price: closePrice,
                change_pct: changePct,
                status: s.act ? actToStatus(s.act) : (cached?.status || (changePct > 1 ? 'very-positive' : (changePct > 0 ? 'positive' : 'neutral'))),
                statusText: s.act || cached?.statusText || (changePct > 1 ? 'TÍCH CỰC' : (changePct > 0 ? 'KHẢ QUAN' : 'TRUNG LẬP')),
                officer: s.analyst || 'FinTop DATA',
                trend: s.rsi_mfi || (changePct > 0 ? 'UPTREND' : 'SIDEWAY'),
                delta_rsi: s.delta_rsi || '',
                validation_zone: s.trading_price_range || `${(closePrice * 0.98).toFixed(0)} - ${(closePrice * 1.01).toFixed(0)}`,
                resistance_zone: s.resistance_range || `${(closePrice * 1.05).toFixed(0)}`,
                support_zone: s.support_range || `${(closePrice * 0.95).toFixed(0)}`,
                synced_at: s.updatedAt ? s.updatedAt.toISOString() : new Date().toISOString(),
                updated_at: s.updatedAt ? s.updatedAt.toISOString() : new Date().toISOString(),
                order: s.order || 0,
                model_desc: s.identify_trend || '',
                top_status: s.top_status || 0,
            };
        }));
        return mapped;
    }
    async getHistoricalOHLCV(symbol, startDate, endDate) {
        const stock = await this.repository.findStockBySymbol(symbol);
        if (!stock)
            throw new common_1.NotFoundException('Stock not found');
        return this.repository.getHistoricalOHLCV(stock.id, startDate, endDate);
    }
    async lookupStockMetadata(symbol) {
        const cleanSymbol = symbol.trim().toUpperCase();
        if (!cleanSymbol || cleanSymbol.length < 3) {
            throw new common_1.BadRequestException('Mã cổ phiếu không hợp lệ (phải có ít nhất 3 ký tự)');
        }
        const cacheNamespace = 'market:lookup';
        try {
            const cached = await this.redisService.get(cacheNamespace, cleanSymbol);
            if (cached) {
                return cached;
            }
        }
        catch (err) {
        }
        const staticEntry = vn_stock_directory_1.VN_STOCK_DIRECTORY[cleanSymbol];
        if (staticEntry) {
            const result = { ...staticEntry };
            try {
                await this.redisService.setWithTTL(cacheNamespace, cleanSymbol, result, 604800);
            }
            catch (err) { }
            return result;
        }
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            const url = `https://finfo-api.vndirect.com.vn/v4/stocks?code=${cleanSymbol}`;
            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Referer': 'https://board.vndirect.com.vn/',
                },
            });
            clearTimeout(timeoutId);
            if (response.ok) {
                const json = await response.json();
                if (json.data && Array.isArray(json.data) && json.data.length > 0) {
                    const rawInfo = json.data[0];
                    let exchange = (rawInfo.floor || 'HOSE').toUpperCase();
                    if (exchange.includes('HOSE') || exchange.includes('HCM') || exchange === 'HSX')
                        exchange = 'HOSE';
                    else if (exchange.includes('HNX') || exchange.includes('HASTC'))
                        exchange = 'HNX';
                    else if (exchange.includes('UPCOM'))
                        exchange = 'UPCOM';
                    else
                        exchange = 'HOSE';
                    const rawIndustry = rawInfo.industryName || '';
                    const mappedIndustry = this.industryMapping[rawIndustry] || this.matchClosestIndustry(rawIndustry);
                    const result = {
                        symbol: cleanSymbol,
                        exchange,
                        industry: mappedIndustry,
                        companyName: rawInfo.companyName || rawInfo.shortName || '',
                    };
                    try {
                        await this.redisService.setWithTTL(cacheNamespace, cleanSymbol, result, 604800);
                    }
                    catch (err) { }
                    return result;
                }
            }
        }
        catch (err) {
        }
        throw new common_1.NotFoundException(`Không tìm thấy thông tin cho mã cổ phiếu: ${cleanSymbol}`);
    }
    matchClosestIndustry(rawIndustry) {
        if (!rawIndustry)
            return 'Đa ngành';
        const lower = rawIndustry.toLowerCase();
        if (lower.includes('ngân hàng'))
            return 'Ngân Hàng';
        if (lower.includes('bảo hiểm'))
            return 'Bảo hiểm';
        if (lower.includes('chứng khoán') || lower.includes('dịch vụ tài chính'))
            return 'Chứng khoán';
        if (lower.includes('công nghệ') || lower.includes('phần mềm') || lower.includes('máy tính'))
            return 'Công nghệ thông tin';
        if (lower.includes('bất động sản') || lower.includes('địa ốc')) {
            if (lower.includes('khu công nghiệp') || lower.includes('kcn')) {
                return 'BĐS - KCN';
            }
            return 'Bất động sản';
        }
        if (lower.includes('dầu khí') || lower.includes('xăng dầu'))
            return 'Dầu khí';
        if (lower.includes('dệt may') || lower.includes('sợi') || lower.includes('may mặc'))
            return 'Dệt may';
        if (lower.includes('dược') || lower.includes('y tế') || lower.includes('bệnh viện') || lower.includes('chăm sóc sức khỏe'))
            return 'Dược phẩm - Y tế';
        if (lower.includes('hàng không') || lower.includes('bay'))
            return 'Hàng không';
        if (lower.includes('khai khoáng') || lower.includes('than') || lower.includes('quặng') || lower.includes('đá'))
            return 'Khai khoáng';
        if (lower.includes('điện') || lower.includes('nước') || lower.includes('năng lượng') || lower.includes('nhiệt điện') || lower.includes('thủy điện'))
            return 'Năng lượng/Điện/Nước';
        if (lower.includes('phân bón') || lower.includes('hóa chất'))
            return 'Phân bón';
        if (lower.includes('nông nghiệp') || lower.includes('lâm nghiệp') || lower.includes('giấy') || lower.includes('cao su') || lower.includes('sản xuất')) {
            return 'Sản xuất NN/CN';
        }
        if (lower.includes('thép') || lower.includes('tôn') || lower.includes('kim loại') || lower.includes('sắt') || lower.includes('xi măng') || lower.includes('vật liệu')) {
            return 'Thép - Vật liệu';
        }
        if (lower.includes('thực phẩm') || lower.includes('đồ uống') || lower.includes('sữa') || lower.includes('bánh kẹo') || lower.includes('bia'))
            return 'Thực phẩm';
        if (lower.includes('thủy sản') || lower.includes('tôm') || lower.includes('cá'))
            return 'Thủy sản';
        if (lower.includes('vận tải biển') || lower.includes('cảng biển') || lower.includes('tàu biển'))
            return 'Vận tải biển';
        if (lower.includes('vận tải') || lower.includes('kho') || lower.includes('logistics') || lower.includes('giao nhận'))
            return 'Vận tải kho';
        if (lower.includes('viễn thông'))
            return 'Viễn thông';
        if (lower.includes('xây dựng') || lower.includes('công trình') || lower.includes('thầu'))
            return 'Xây dựng';
        if (lower.includes('xuất nhập khẩu') || lower.includes('thương mại') || lower.includes('xnk'))
            return 'Xuất nhập khẩu';
        if (lower.includes('bán buôn') && lower.includes('bán lẻ'))
            return 'Bán buôn, bán lẻ';
        if (lower.includes('bán lẻ'))
            return 'Bán lẻ';
        return 'Đa ngành';
    }
    async resolveExchangeId(code) {
        const clean = (code || 'HOSE').trim().toUpperCase();
        const ex = await this.prisma.stockExchange.findFirst({
            where: { code: clean },
        });
        if (ex)
            return ex.id;
        const created = await this.prisma.stockExchange.create({
            data: { code: clean, name: clean, status: 'ACTIVE' },
        });
        return created.id;
    }
    async resolveIndustryId(name) {
        if (!name)
            return null;
        const clean = name.trim();
        const ind = await this.prisma.industry.findFirst({
            where: { name: clean },
        });
        if (ind)
            return ind.id;
        let defaultSector = await this.prisma.sector.findFirst({
            where: { code: 'DEFAULT' },
        });
        if (!defaultSector) {
            defaultSector = await this.prisma.sector.create({
                data: { name: 'Đa ngành', code: 'DEFAULT', status: 'ACTIVE' },
            });
        }
        const created = await this.prisma.industry.create({
            data: {
                sectorId: defaultSector.id,
                name: clean,
                code: clean.toUpperCase().replace(/[^A-Z0-9]/g, '_').substring(0, 50),
                status: 'ACTIVE',
            },
        });
        return created.id;
    }
    async createStock(dto) {
        const symbol = dto.symbol.toUpperCase().trim();
        const existing = await this.prisma.stock.findUnique({
            where: { symbol },
        });
        if (existing) {
            if (existing.deletedAt) {
                return this.prisma.stock.update({
                    where: { id: existing.id },
                    data: {
                        deletedAt: null,
                        status: client_1.STOCK_STATUS.ACTIVE,
                        order: dto.order ?? 0,
                        analyst: dto.analyst,
                        identify_trend: dto.identify_trend,
                        act: dto.act,
                        rsi_mfi: dto.rsi_mfi,
                        delta_rsi: dto.delta_rsi,
                        trading_price_range: dto.trading_price_range,
                        resistance_range: dto.resistance_range,
                        support_range: dto.support_range,
                        top_status: dto.top_status ?? 1,
                    },
                });
            }
            throw new common_1.BadRequestException(`Cổ phiếu ${symbol} đã tồn tại trong hệ thống!`);
        }
        const exchangeId = await this.resolveExchangeId(dto.exchange);
        const industryId = await this.resolveIndustryId(dto.industry);
        return this.prisma.stock.create({
            data: {
                symbol,
                companyName: dto.companyName || symbol,
                exchangeId,
                industryId,
                order: dto.order ?? 0,
                analyst: dto.analyst,
                identify_trend: dto.identify_trend,
                act: dto.act,
                rsi_mfi: dto.rsi_mfi,
                delta_rsi: dto.delta_rsi,
                trading_price_range: dto.trading_price_range,
                resistance_range: dto.resistance_range,
                support_range: dto.support_range,
                top_status: dto.top_status ?? 1,
                status: client_1.STOCK_STATUS.ACTIVE,
            },
        });
    }
    async updateStock(id, dto) {
        const stock = await this.prisma.stock.findUnique({
            where: { id },
        });
        if (!stock)
            throw new common_1.NotFoundException('Cổ phiếu không tồn tại');
        const updateData = {
            order: dto.order !== undefined ? Number(dto.order) : undefined,
            analyst: dto.analyst,
            identify_trend: dto.identify_trend,
            act: dto.act,
            rsi_mfi: dto.rsi_mfi,
            delta_rsi: dto.delta_rsi,
            trading_price_range: dto.trading_price_range,
            resistance_range: dto.resistance_range,
            support_range: dto.support_range,
            top_status: dto.top_status !== undefined ? Number(dto.top_status) : undefined,
            updatedAt: new Date(),
        };
        if (dto.symbol) {
            const cleanSymbol = dto.symbol.toUpperCase().trim();
            const existing = await this.prisma.stock.findUnique({
                where: { symbol: cleanSymbol },
            });
            if (existing && existing.id !== id) {
                if (existing.deletedAt) {
                    await this.deleteStock(existing.id);
                }
                else {
                    throw new common_1.BadRequestException(`Mã cổ phiếu ${cleanSymbol} đã tồn tại trong hệ thống (ID: ${existing.id}). Vui lòng chọn mã khác.`);
                }
            }
            updateData.symbol = cleanSymbol;
        }
        if (dto.companyName) {
            updateData.companyName = dto.companyName;
        }
        if (dto.exchange) {
            updateData.exchangeId = await this.resolveExchangeId(dto.exchange);
        }
        if (dto.industry) {
            updateData.industryId = await this.resolveIndustryId(dto.industry);
        }
        return this.prisma.stock.update({
            where: { id },
            data: updateData,
        });
    }
    async deleteStock(id) {
        const stock = await this.prisma.stock.findUnique({ where: { id } });
        if (!stock)
            throw new common_1.NotFoundException('Cổ phiếu không tồn tại');
        await this.prisma.vipSignal.deleteMany({ where: { stockId: id } });
        await this.prisma.portfolioHolding.deleteMany({ where: { stockId: id } });
        await this.prisma.watchlistItem.deleteMany({ where: { stockId: id } });
        await this.prisma.priceAlert.deleteMany({ where: { stockId: id } });
        await this.prisma.financialIndicator.deleteMany({ where: { stockId: id } });
        await this.prisma.stockPriceDaily.deleteMany({ where: { stockId: id } });
        return this.prisma.stock.delete({
            where: { id },
        });
    }
    async bulkUpdateStocks(dto) {
        if (!dto.stocks || !Array.isArray(dto.stocks)) {
            throw new common_1.BadRequestException('Danh sách cập nhật không hợp lệ');
        }
        const updates = dto.stocks.map((s) => {
            const data = {
                order: s.order !== undefined ? Number(s.order) : undefined,
                top_status: s.top_status !== undefined ? Number(s.top_status) : undefined,
                identify_trend: s.identify_trend,
                act: s.act,
                rsi_mfi: s.rsi_mfi,
                delta_rsi: s.delta_rsi,
                trading_price_range: s.trading_price_range,
                resistance_range: s.resistance_range,
                support_range: s.support_range,
            };
            return this.prisma.stock.update({
                where: { id: s.id },
                data,
            });
        });
        return this.prisma.$transaction(updates);
    }
};
exports.MarketService = MarketService;
exports.MarketService = MarketService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [market_repository_1.MarketRepository,
        redis_service_1.RedisService,
        prisma_service_1.PrismaService])
], MarketService);
//# sourceMappingURL=market.service.js.map
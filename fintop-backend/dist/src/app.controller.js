"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AppController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const app_service_1 = require("./app.service");
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let AppController = AppController_1 = class AppController {
    appService;
    logger = new common_1.Logger(AppController_1.name);
    constructor(appService) {
        this.appService = appService;
    }
    getHello() {
        return this.appService.getHello();
    }
    getSitemap(res) {
        const pathsToTry = [
            path.join(process.cwd(), '..', 'sitemap.xml'),
            path.join(process.cwd(), 'sitemap.xml'),
            path.join(process.cwd(), '..', 'fintop_frontend', 'sitemap.xml'),
            '/var/www/fintop/sitemap.xml',
            '/var/www/fintop/fintop_frontend/sitemap.xml',
        ];
        for (const p of pathsToTry) {
            if (fs.existsSync(p)) {
                res.setHeader('Content-Type', 'application/xml; charset=utf-8');
                return res.send(fs.readFileSync(p, 'utf-8'));
            }
        }
        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        return res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url><loc>https://fintopdata.vn/</loc><lastmod>2026-09-09</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>
    <url><loc>https://fintopdata.vn/fintop-data/</loc><lastmod>2026-09-09</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>
    <url><loc>https://fintopdata.vn/fintop-data/bo-loc/</loc><lastmod>2026-09-09</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>
    <url><loc>https://fintopdata.vn/fintop-ai/</loc><lastmod>2026-09-09</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>
    <url><loc>https://fintopdata.vn/stock-data/thi-truong/</loc><lastmod>2026-09-09</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>
    <url><loc>https://fintopdata.vn/nghien-cuu/chuyen-sau/</loc><lastmod>2026-09-09</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>
    <url><loc>https://fintopdata.vn/nghien-cuu/thi-truong/</loc><lastmod>2026-09-09</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>
    <url><loc>https://fintopdata.vn/nghien-cuu/doanh-nghiep/</loc><lastmod>2026-09-09</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>
    <url><loc>https://fintopdata.vn/nghien-cuu/nhom-nganh/</loc><lastmod>2026-09-09</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>
    <url><loc>https://fintopdata.vn/huong-dan/</loc><lastmod>2026-09-09</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>
</urlset>`);
    }
    getRobots(res) {
        const pathsToTry = [
            path.join(process.cwd(), '..', 'robots.txt'),
            path.join(process.cwd(), 'robots.txt'),
            '/var/www/fintop/robots.txt',
        ];
        for (const p of pathsToTry) {
            if (fs.existsSync(p)) {
                res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                return res.send(fs.readFileSync(p, 'utf-8'));
            }
        }
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.send("User-agent: *\nAllow: /\nSitemap: https://fintopdata.vn/sitemap.xml\n");
    }
    getGoogleVerification(res) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send("google-site-verification: googleffe9b2e8d0ffe423.html");
    }
    triggerAutoDeploy() {
        this.logger.log('🚀 [Auto-Deploy] Webhook received! Triggering production deployment...');
        (0, child_process_1.exec)('cd /var/www/fintop && git fetch --all && git reset --hard origin/main && bash deploy.sh', (error, stdout, stderr) => {
            if (error) {
                this.logger.error(`❌ [Auto-Deploy Error]: ${error.message}`);
                return;
            }
            this.logger.log(`✅ [Auto-Deploy Complete]: ${stdout}`);
        });
        return {
            status: 'success',
            message: 'FinTop DATA Production Auto-Deploy triggered successfully!',
            timestamp: new Date().toISOString(),
        };
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AppController.prototype, "getHello", null);
__decorate([
    (0, common_1.Get)('sitemap.xml'),
    (0, common_1.Get)('blogs/share/sitemap.xml'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getSitemap", null);
__decorate([
    (0, common_1.Get)('robots.txt'),
    (0, common_1.Get)('blogs/share/robots.txt'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getRobots", null);
__decorate([
    (0, common_1.Get)('googleffe9b2e8d0ffe423.html'),
    (0, common_1.Get)('blogs/share/googleffe9b2e8d0ffe423.html'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getGoogleVerification", null);
__decorate([
    (0, common_1.Post)('deploy-webhook'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "triggerAutoDeploy", null);
exports.AppController = AppController = AppController_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_1.AppService])
], AppController);
//# sourceMappingURL=app.controller.js.map
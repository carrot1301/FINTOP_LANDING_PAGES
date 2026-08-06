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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const swagger_1 = require("@nestjs/swagger");
const admin_service_1 = require("./admin.service");
const plan_dto_1 = require("./dto/plan.dto");
let AdminController = class AdminController {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    async getOverview() {
        return this.adminService.getOverview();
    }
    async getUsers(page, limit, search, status, userType, tierLevel) {
        const p = page ? parseInt(page, 10) : 1;
        const l = limit ? parseInt(limit, 10) : 20;
        return this.adminService.getUsers(p, l, search, status, userType, tierLevel);
    }
    async getUserDetail(id) {
        return this.adminService.getUserDetail(parseInt(id, 10));
    }
    async updateUserStatus(id, status, admin) {
        return this.adminService.updateUserStatus(parseInt(id, 10), status, admin.id);
    }
    async assignRole(id, roleCode, admin) {
        return this.adminService.assignRole(parseInt(id, 10), roleCode, admin.id);
    }
    async removeRole(id, roleCode, admin) {
        return this.adminService.removeRole(parseInt(id, 10), roleCode, admin.id);
    }
    async deleteUser(id, admin) {
        return this.adminService.deleteUser(parseInt(id, 10), admin.id);
    }
    async updateUser(id, dto, admin) {
        return this.adminService.updateUser(parseInt(id, 10), dto, admin.id);
    }
    async getRoles() {
        return this.adminService.getRoles();
    }
    async getRolePermissions(id) {
        return this.adminService.getRolePermissions(parseInt(id, 10));
    }
    async getAllPermissions() {
        return this.adminService.getAllPermissions();
    }
    async updateRolePermissions(id, permissionIds, admin) {
        return this.adminService.updateRolePermissions(parseInt(id, 10), permissionIds, admin.id);
    }
    async getSignals(page, limit, status) {
        const p = page ? parseInt(page, 10) : 1;
        const l = limit ? parseInt(limit, 10) : 20;
        return this.adminService.getSignals(p, l, status);
    }
    async getBlogs(page, limit, status, search, categoryId) {
        const p = page ? parseInt(page, 10) : 1;
        const l = limit ? parseInt(limit, 10) : 20;
        const catId = categoryId ? parseInt(categoryId, 10) : undefined;
        return this.adminService.getBlogs(p, l, status, search, catId);
    }
    async getReports(page, limit) {
        const p = page ? parseInt(page, 10) : 1;
        const l = limit ? parseInt(limit, 10) : 20;
        return this.adminService.getReports(p, l);
    }
    async getNotifications(page, limit) {
        const p = page ? parseInt(page, 10) : 1;
        const l = limit ? parseInt(limit, 10) : 20;
        return this.adminService.getNotifications(p, l);
    }
    async broadcastNotification(title, content, userIds, admin) {
        return this.adminService.broadcastNotification(title, content, userIds, admin.id);
    }
    async getAuditLogs(page, limit, action, userId) {
        const p = page ? parseInt(page, 10) : 1;
        const l = limit ? parseInt(limit, 10) : 30;
        const uid = userId ? parseInt(userId, 10) : undefined;
        return this.adminService.getAuditLogs(p, l, action, uid);
    }
    async getSubscriptionPlans() {
        return this.adminService.getSubscriptionPlans();
    }
    async createPlan(dto, admin) {
        return this.adminService.createPlan(dto, admin.id);
    }
    async updatePlan(id, dto, admin) {
        return this.adminService.updatePlan(parseInt(id, 10), dto, admin.id);
    }
    async deletePlan(id, admin) {
        return this.adminService.deletePlan(parseInt(id, 10), admin.id);
    }
    async getInvoices(page, limit) {
        const p = page ? parseInt(page, 10) : 1;
        const l = limit ? parseInt(limit, 10) : 20;
        return this.adminService.getInvoices(p, l);
    }
    async approveInvoice(id, admin, isPermanent, endDate) {
        return this.adminService.approveInvoice(BigInt(id), !!isPermanent, endDate, admin.id);
    }
    async getMarketSyncLogs(page, limit) {
        const p = page ? parseInt(page, 10) : 1;
        const l = limit ? parseInt(limit, 10) : 20;
        return this.adminService.getMarketSyncLogs(p, l);
    }
    async getStocks(page, limit) {
        const p = page ? parseInt(page, 10) : 1;
        const l = limit ? parseInt(limit, 10) : 30;
        return this.adminService.getStocks(p, l);
    }
    async getPortfolios() {
        return this.adminService.getPortfolios();
    }
    async getHandbooks(category, search) {
        return this.adminService.getHandbooks(category, search);
    }
    async createHandbook(dto, admin) {
        return this.adminService.createHandbook(dto, admin.id);
    }
    async updateHandbook(id, dto, admin) {
        return this.adminService.updateHandbook(parseInt(id, 10), dto, admin.id);
    }
    async deleteHandbook(id, admin) {
        return this.adminService.deleteHandbook(parseInt(id, 10), admin.id);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('overview'),
    (0, permissions_decorator_1.Permissions)('USER:READ'),
    (0, swagger_1.ApiOperation)({ summary: 'Get admin dashboard KPIs' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getOverview", null);
__decorate([
    (0, common_1.Get)('users'),
    (0, permissions_decorator_1.Permissions)('USER:READ'),
    (0, swagger_1.ApiOperation)({ summary: 'List all users with pagination and search' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'tierLevel', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'userType', required: false, description: 'Filter by user type: staff | client' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('userType')),
    __param(5, (0, common_1.Query)('tierLevel')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Get)('users/:id'),
    (0, permissions_decorator_1.Permissions)('USER:READ'),
    (0, swagger_1.ApiOperation)({ summary: 'Get detailed user profile' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUserDetail", null);
__decorate([
    (0, common_1.Patch)('users/:id/status'),
    (0, permissions_decorator_1.Permissions)('USER:UPDATE'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user status (ACTIVE/INACTIVE/LOCKED)' }),
    (0, swagger_1.ApiBody)({ schema: { properties: { status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'LOCKED'] } } } }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateUserStatus", null);
__decorate([
    (0, common_1.Patch)('users/:id/role'),
    (0, permissions_decorator_1.Permissions)('ROLE:UPDATE'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign a role to a user' }),
    (0, swagger_1.ApiBody)({ schema: { properties: { roleCode: { type: 'string' } } } }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('roleCode')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "assignRole", null);
__decorate([
    (0, common_1.Delete)('users/:id/role'),
    (0, permissions_decorator_1.Permissions)('ROLE:UPDATE'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a role from a user' }),
    (0, swagger_1.ApiBody)({ schema: { properties: { roleCode: { type: 'string' } } } }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('roleCode')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "removeRole", null);
__decorate([
    (0, common_1.Delete)('users/:id'),
    (0, permissions_decorator_1.Permissions)('USER:DELETE'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete user (Soft delete)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Patch)('users/:id'),
    (0, permissions_decorator_1.Permissions)('USER:UPDATE'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user profile information' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Get)('roles'),
    (0, permissions_decorator_1.Permissions)('ROLE:READ'),
    (0, swagger_1.ApiOperation)({ summary: 'List all roles with permission counts' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getRoles", null);
__decorate([
    (0, common_1.Get)('roles/:id/permissions'),
    (0, permissions_decorator_1.Permissions)('ROLE:READ'),
    (0, swagger_1.ApiOperation)({ summary: 'List permissions for a specific role' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getRolePermissions", null);
__decorate([
    (0, common_1.Get)('permissions'),
    (0, permissions_decorator_1.Permissions)('ROLE:READ'),
    (0, swagger_1.ApiOperation)({ summary: 'List all system permissions' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllPermissions", null);
__decorate([
    (0, common_1.Patch)('roles/:id/permissions'),
    (0, permissions_decorator_1.Permissions)('ROLE:UPDATE'),
    (0, swagger_1.ApiOperation)({ summary: 'Update permissions for a specific role' }),
    (0, swagger_1.ApiBody)({ schema: { properties: { permissionIds: { type: 'array', items: { type: 'number' } } } } }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('permissionIds')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateRolePermissions", null);
__decorate([
    (0, common_1.Get)('signals'),
    (0, permissions_decorator_1.Permissions)('VIP_SIGNALS:READ'),
    (0, swagger_1.ApiOperation)({ summary: 'List all signals (admin, no tier filter)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getSignals", null);
__decorate([
    (0, common_1.Get)('blogs'),
    (0, permissions_decorator_1.Permissions)('BLOG:READ'),
    (0, swagger_1.ApiOperation)({ summary: 'List all blogs (admin, all statuses)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'categoryId', required: false }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('categoryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getBlogs", null);
__decorate([
    (0, common_1.Get)('reports'),
    (0, permissions_decorator_1.Permissions)('REPORT:READ'),
    (0, swagger_1.ApiOperation)({ summary: 'List all reports (admin, all statuses)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getReports", null);
__decorate([
    (0, common_1.Get)('notifications'),
    (0, permissions_decorator_1.Permissions)('SYSTEM:READ'),
    (0, swagger_1.ApiOperation)({ summary: 'List all notifications cross-user' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getNotifications", null);
__decorate([
    (0, common_1.Post)('notifications/broadcast'),
    (0, permissions_decorator_1.Permissions)('SYSTEM:READ'),
    (0, swagger_1.ApiOperation)({ summary: 'Broadcast notification to specific users' }),
    (0, swagger_1.ApiBody)({ schema: { properties: { title: { type: 'string' }, content: { type: 'string' }, userIds: { type: 'array', items: { type: 'number' } } } } }),
    __param(0, (0, common_1.Body)('title')),
    __param(1, (0, common_1.Body)('content')),
    __param(2, (0, common_1.Body)('userIds')),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Array, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "broadcastNotification", null);
__decorate([
    (0, common_1.Get)('audit-logs'),
    (0, permissions_decorator_1.Permissions)('SYSTEM:READ'),
    (0, swagger_1.ApiOperation)({ summary: 'View immutable system audit logs' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'action', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'userId', required: false }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('action')),
    __param(3, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAuditLogs", null);
__decorate([
    (0, common_1.Get)('billing/plans'),
    (0, permissions_decorator_1.Permissions)('PLAN:READ'),
    (0, swagger_1.ApiOperation)({ summary: 'List all subscription plans' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getSubscriptionPlans", null);
__decorate([
    (0, common_1.Post)('billing/plans'),
    (0, permissions_decorator_1.Permissions)('PLAN:CREATE'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new subscription plan' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [plan_dto_1.CreatePlanDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createPlan", null);
__decorate([
    (0, common_1.Patch)('billing/plans/:id'),
    (0, permissions_decorator_1.Permissions)('PLAN:UPDATE'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a subscription plan' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, plan_dto_1.UpdatePlanDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updatePlan", null);
__decorate([
    (0, common_1.Delete)('billing/plans/:id'),
    (0, permissions_decorator_1.Permissions)('PLAN:DELETE'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a subscription plan (Soft delete)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deletePlan", null);
__decorate([
    (0, common_1.Get)('billing/invoices'),
    (0, permissions_decorator_1.Permissions)('INVOICE:READ'),
    (0, swagger_1.ApiOperation)({ summary: 'List all invoices cross-user' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getInvoices", null);
__decorate([
    (0, common_1.Post)('billing/invoices/:id/approve'),
    (0, permissions_decorator_1.Permissions)('INVOICE:APPROVE'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve invoice and activate subscription manually' }),
    (0, swagger_1.ApiBody)({ schema: { properties: { isPermanent: { type: 'boolean' }, endDate: { type: 'string' } } } }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)('isPermanent')),
    __param(3, (0, common_1.Body)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Boolean, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "approveInvoice", null);
__decorate([
    (0, common_1.Get)('market/sync-logs'),
    (0, permissions_decorator_1.Permissions)('STOCK_DATA:READ'),
    (0, swagger_1.ApiOperation)({ summary: 'List market data sync logs' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getMarketSyncLogs", null);
__decorate([
    (0, common_1.Get)('market/stocks'),
    (0, permissions_decorator_1.Permissions)('STOCK_DATA:READ'),
    (0, swagger_1.ApiOperation)({ summary: 'List all stocks with exchange and industry' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getStocks", null);
__decorate([
    (0, common_1.Get)('portfolios'),
    (0, permissions_decorator_1.Permissions)('STOCK_DATA:READ'),
    (0, swagger_1.ApiOperation)({ summary: 'List all recommended portfolios' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPortfolios", null);
__decorate([
    (0, common_1.Get)('handbooks'),
    (0, permissions_decorator_1.Permissions)('HANDBOOK:READ'),
    (0, swagger_1.ApiOperation)({ summary: 'List all handbooks with category filter and search' }),
    (0, swagger_1.ApiQuery)({ name: 'category', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    __param(0, (0, common_1.Query)('category')),
    __param(1, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getHandbooks", null);
__decorate([
    (0, common_1.Post)('handbooks'),
    (0, permissions_decorator_1.Permissions)('HANDBOOK:CREATE'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new handbook' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createHandbook", null);
__decorate([
    (0, common_1.Patch)('handbooks/:id'),
    (0, permissions_decorator_1.Permissions)('HANDBOOK:UPDATE'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a handbook' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateHandbook", null);
__decorate([
    (0, common_1.Delete)('handbooks/:id'),
    (0, permissions_decorator_1.Permissions)('HANDBOOK:DELETE'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a handbook' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteHandbook", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('Admin Controls'),
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map
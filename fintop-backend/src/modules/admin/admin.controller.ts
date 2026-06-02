import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { AdminService } from './admin.service';
import { ROLE_CODE, RECORD_STATUS } from '@prisma/client';

@ApiTags('Admin Controls')
@Controller('admin')
@UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ─────────────────────────────────────────────────────
  // OVERVIEW
  // ─────────────────────────────────────────────────────

  @Get('overview')
  @Permissions('USER:READ')
  @ApiOperation({ summary: 'Get admin dashboard KPIs' })
  async getOverview() {
    return this.adminService.getOverview();
  }

  // ─────────────────────────────────────────────────────
  // USER MANAGEMENT
  // ─────────────────────────────────────────────────────

  @Get('users')
  @Permissions('USER:READ')
  @ApiOperation({ summary: 'List all users with pagination and search' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false })
  async getUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    const p = page ? parseInt(page, 10) : 1;
    const l = limit ? parseInt(limit, 10) : 20;
    return this.adminService.getUsers(p, l, search, status);
  }

  @Get('users/:id')
  @Permissions('USER:READ')
  @ApiOperation({ summary: 'Get detailed user profile' })
  async getUserDetail(@Param('id') id: string) {
    return this.adminService.getUserDetail(parseInt(id, 10));
  }

  @Patch('users/:id/status')
  @Permissions('USER:UPDATE')
  @ApiOperation({ summary: 'Update user status (ACTIVE/INACTIVE/LOCKED)' })
  @ApiBody({ schema: { properties: { status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'LOCKED'] } } } })
  async updateUserStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @CurrentUser() admin: any,
  ) {
    return this.adminService.updateUserStatus(parseInt(id, 10), status as RECORD_STATUS, admin.id);
  }

  @Patch('users/:id/role')
  @Permissions('ROLE:UPDATE')
  @ApiOperation({ summary: 'Assign a role to a user' })
  @ApiBody({ schema: { properties: { roleCode: { type: 'string' } } } })
  async assignRole(
    @Param('id') id: string,
    @Body('roleCode') roleCode: string,
    @CurrentUser() admin: any,
  ) {
    return this.adminService.assignRole(parseInt(id, 10), roleCode, admin.id);
  }

  @Delete('users/:id/role')
  @Permissions('ROLE:UPDATE')
  @ApiOperation({ summary: 'Remove a role from a user' })
  @ApiBody({ schema: { properties: { roleCode: { type: 'string' } } } })
  async removeRole(
    @Param('id') id: string,
    @Body('roleCode') roleCode: string,
    @CurrentUser() admin: any,
  ) {
    return this.adminService.removeRole(parseInt(id, 10), roleCode, admin.id);
  }

  // ─────────────────────────────────────────────────────
  // RBAC
  // ─────────────────────────────────────────────────────

  @Get('roles')
  @Permissions('ROLE:READ')
  @ApiOperation({ summary: 'List all roles with permission counts' })
  async getRoles() {
    return this.adminService.getRoles();
  }

  @Get('roles/:id/permissions')
  @Permissions('ROLE:READ')
  @ApiOperation({ summary: 'List permissions for a specific role' })
  async getRolePermissions(@Param('id') id: string) {
    return this.adminService.getRolePermissions(parseInt(id, 10));
  }

  // ─────────────────────────────────────────────────────
  // SIGNALS (Admin - all statuses)
  // ─────────────────────────────────────────────────────

  @Get('signals')
  @Permissions('VIP_SIGNALS:READ')
  @ApiOperation({ summary: 'List all signals (admin, no tier filter)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  async getSignals(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    const p = page ? parseInt(page, 10) : 1;
    const l = limit ? parseInt(limit, 10) : 20;
    return this.adminService.getSignals(p, l, status);
  }

  // ─────────────────────────────────────────────────────
  // CMS — Blogs & Reports
  // ─────────────────────────────────────────────────────

  @Get('blogs')
  @Permissions('BLOG:READ')
  @ApiOperation({ summary: 'List all blogs (admin, all statuses)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  async getBlogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    const p = page ? parseInt(page, 10) : 1;
    const l = limit ? parseInt(limit, 10) : 20;
    return this.adminService.getBlogs(p, l, status);
  }

  @Get('reports')
  @Permissions('REPORT:READ')
  @ApiOperation({ summary: 'List all reports (admin, all statuses)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getReports(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const p = page ? parseInt(page, 10) : 1;
    const l = limit ? parseInt(limit, 10) : 20;
    return this.adminService.getReports(p, l);
  }

  // ─────────────────────────────────────────────────────
  // NOTIFICATIONS (Admin - cross-user + broadcast)
  // ─────────────────────────────────────────────────────

  @Get('notifications')
  @Roles(ROLE_CODE.SUPER_ADMIN)
  @ApiOperation({ summary: 'List all notifications cross-user' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getNotifications(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const p = page ? parseInt(page, 10) : 1;
    const l = limit ? parseInt(limit, 10) : 20;
    return this.adminService.getNotifications(p, l);
  }

  @Post('notifications/broadcast')
  @Roles(ROLE_CODE.SUPER_ADMIN)
  @ApiOperation({ summary: 'Broadcast notification to specific users' })
  @ApiBody({ schema: { properties: { title: { type: 'string' }, content: { type: 'string' }, userIds: { type: 'array', items: { type: 'number' } } } } })
  async broadcastNotification(
    @Body('title') title: string,
    @Body('content') content: string,
    @Body('userIds') userIds: number[],
    @CurrentUser() admin: any,
  ) {
    return this.adminService.broadcastNotification(title, content, userIds, admin.id);
  }

  // ─────────────────────────────────────────────────────
  // AUDIT LOGS
  // ─────────────────────────────────────────────────────

  @Get('audit-logs')
  @Permissions('SYSTEM:READ')
  @ApiOperation({ summary: 'View immutable system audit logs' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'userId', required: false })
  async getAuditLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('action') action?: string,
    @Query('userId') userId?: string,
  ) {
    const p = page ? parseInt(page, 10) : 1;
    const l = limit ? parseInt(limit, 10) : 30;
    const uid = userId ? parseInt(userId, 10) : undefined;
    return this.adminService.getAuditLogs(p, l, action, uid);
  }

  // ─────────────────────────────────────────────────────
  // BILLING
  // ─────────────────────────────────────────────────────

  @Get('billing/plans')
  @Roles(ROLE_CODE.SUPER_ADMIN)
  @ApiOperation({ summary: 'List all subscription plans' })
  async getSubscriptionPlans() {
    return this.adminService.getSubscriptionPlans();
  }

  @Get('billing/invoices')
  @Roles(ROLE_CODE.SUPER_ADMIN)
  @ApiOperation({ summary: 'List all invoices cross-user' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getInvoices(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const p = page ? parseInt(page, 10) : 1;
    const l = limit ? parseInt(limit, 10) : 20;
    return this.adminService.getInvoices(p, l);
  }

  // ─────────────────────────────────────────────────────
  // MARKET DATA
  // ─────────────────────────────────────────────────────

  @Get('market/sync-logs')
  @Roles(ROLE_CODE.SUPER_ADMIN)
  @ApiOperation({ summary: 'List market data sync logs' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getMarketSyncLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const p = page ? parseInt(page, 10) : 1;
    const l = limit ? parseInt(limit, 10) : 20;
    return this.adminService.getMarketSyncLogs(p, l);
  }

  @Get('market/stocks')
  @Roles(ROLE_CODE.SUPER_ADMIN)
  @ApiOperation({ summary: 'List all stocks with exchange and industry' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getStocks(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const p = page ? parseInt(page, 10) : 1;
    const l = limit ? parseInt(limit, 10) : 30;
    return this.adminService.getStocks(p, l);
  }

  // ─────────────────────────────────────────────────────
  // PORTFOLIOS
  // ─────────────────────────────────────────────────────

  @Get('portfolios')
  @Roles(ROLE_CODE.SUPER_ADMIN)
  @ApiOperation({ summary: 'List all recommended portfolios' })
  async getPortfolios() {
    return this.adminService.getPortfolios();
  }
}

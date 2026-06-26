import 'dotenv/config';
process.env.THROTTLE_LIMIT = '10';
import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe, HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';
import { LoggingInterceptor } from '../src/common/interceptors/logging.interceptor';
import { PrismaService } from '../src/common/database/prisma.service';
import { HashUtil } from '../src/common/utils/hash.util';
import { MailService } from '../src/common/mail/mail.service';

async function runAuthValidation() {
  console.log('🔍 Bắt đầu kiểm thử Authentication & Authorization Runtime Validation...');

  let app!: INestApplication;
  let prisma!: PrismaService;

  try {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalInterceptors(new LoggingInterceptor());
    await app.init();

    prisma = app.get(PrismaService);

    // Setup Test User
    const testEmail = 'test_auth@fintop.vn';
    const testPassword = 'Password123!';
    const passwordHash = await HashUtil.hash(testPassword);
    
    // Ensure cleanup first
    if (prisma) {
      await prisma.auditLog.deleteMany({ where: { user: { email: testEmail } } });
      await prisma.userSession.deleteMany({ where: { user: { email: testEmail } } });
      await prisma.user.deleteMany({ where: { email: testEmail } });
    }

    const user = await prisma.user.create({
      data: {
        email: testEmail,
        fullName: 'Test User Auth',
        passwordHash,
        status: 'ACTIVE',
        tierLevel: 'STANDARD',
        emailVerifiedAt: new Date(),
      },
    });

    console.log('\n⚡ Test #1: Login with invalid password');
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testEmail, password: 'WrongPassword!' })
      .expect(HttpStatus.UNAUTHORIZED);
    console.log('  [PASS] Invalid password rejected correctly.');

    console.log('\n⚡ Test #2: Login with valid credentials');
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testEmail, password: testPassword })
      .expect(HttpStatus.OK); // Controller has @HttpCode(HttpStatus.OK)

    const { accessToken, refreshToken } = loginRes.body;
    if (!accessToken || !refreshToken) throw new Error('Missing tokens in login response');
    console.log('  [PASS] Login success, tokens generated.');

    console.log('\n⚡ Test #3: Access protected endpoint /auth/me');
    const meRes = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);
    
    if (meRes.body.email !== testEmail) throw new Error('Profile mismatch');
    console.log('  [PASS] JWT Guard accepted valid token.');

    console.log('\n⚡ Test #4: Refresh Token Rotation');
    const refreshRes = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken })
      .expect(HttpStatus.OK); // Controller has @HttpCode(HttpStatus.OK)
    
    const newAccessToken = refreshRes.body.accessToken;
    const newRefreshToken = refreshRes.body.refreshToken;
    
    if (newRefreshToken === refreshToken) throw new Error('Refresh token was not rotated');
    console.log('  [PASS] Refresh token rotated successfully.');

    console.log('\n⚡ Test #5: Logout');
    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${newAccessToken}`)
      .send({ refreshToken: newRefreshToken })
      .expect(HttpStatus.NO_CONTENT); // Controller has @HttpCode(HttpStatus.NO_CONTENT)
    
    // Try to refresh with revoked token
    console.log('\n⚡ Test #6: Revoked Token Rejection');
    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: newRefreshToken })
      .expect(HttpStatus.UNAUTHORIZED);
    console.log('  [PASS] Revoked token rejected correctly.');

    // Test #7: Forgot Password & Reset Password Flow
    console.log('\n⚡ Test #7: Forgot Password & Reset Password Flow');
    const mailService = app.get(MailService);
    let capturedToken = '';
    const originalSend = mailService.sendPasswordResetEmail;
    mailService.sendPasswordResetEmail = async (email: string, token: string, fullName: string) => {
      capturedToken = token;
      return true;
    };

    // Request reset
    await request(app.getHttpServer())
      .post('/auth/forgot-password')
      .send({ email: testEmail })
      .expect(HttpStatus.OK);
    
    if (!capturedToken) {
      throw new Error('Failed to capture password reset token');
    }
    console.log('  [PASS] Forgot password requested, token captured.');

    // Try reset with invalid token
    await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send({ token: 'invalid_token', newPassword: 'NewPassword123!' })
      .expect(HttpStatus.BAD_REQUEST);
    console.log('  [PASS] Invalid token rejected.');

    // Try reset with too short password
    await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send({ token: capturedToken, newPassword: '123' })
      .expect(HttpStatus.BAD_REQUEST);
    console.log('  [PASS] Too short password rejected.');

    // Successful reset
    const newPassword = 'NewPassword123!';
    await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send({ token: capturedToken, newPassword })
      .expect(HttpStatus.OK);
    console.log('  [PASS] Password reset successfully.');

    // Verify old password fails
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testEmail, password: testPassword })
      .expect(HttpStatus.UNAUTHORIZED);
    console.log('  [PASS] Login with old password rejected.');

    // Verify new password succeeds
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testEmail, password: newPassword })
      .expect(HttpStatus.OK);
    console.log('  [PASS] Login with new password succeeded.');

    // Clean up spy
    mailService.sendPasswordResetEmail = originalSend;

    // Throttling Test
    console.log('\n⚡ Test #8: Throttling Enforcement');
    for (let i = 0; i < 11; i++) {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testEmail, password: 'WrongPassword!' });
      
      if (i === 10) {
        if (res.status !== HttpStatus.TOO_MANY_REQUESTS) {
          throw new Error(`Expected 429 TOO_MANY_REQUESTS, got ${res.status}`);
        }
      }
    }
    console.log('  [PASS] Throttling correctly enforced after 10 requests.');

    console.log('\n🎉 TẤT CẢ CÁC BÀI KIỂM TRA AUTH ĐỀU THÀNH CÔNG (100% PASS)!');

    // Cleanup
    await prisma.auditLog.deleteMany({ where: { userId: user.id } });
    await prisma.userSession.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });

  } catch (error) {
    console.error('\n❌ KIỂM THỬ AUTH THẤT BẠI:', error);
    process.exit(1);
  } finally {
    if (app) {
      await app.close();
      process.exit(0);
    }
  }
}

runAuthValidation();

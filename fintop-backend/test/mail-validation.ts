import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { MailService } from '../src/common/mail/mail.service';

async function runMailValidation() {
  console.log('---------------------------------------------------------');
  console.log('🧪 BẮT ĐẦU BACKTEST / KIỂM THỬ DỊCH VỤ GỬI MAIL (MAIL SERVICE)...');
  console.log('---------------------------------------------------------');

  let moduleRef: TestingModule | null = null;

  try {
    console.log('⚡ Booting NestJS Application Module...');
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const mailService = moduleRef.get<MailService>(MailService);
    
    // 1. Diagnostics Check
    const status = mailService.getStatus();
    console.log('\n📊 THÔNG TIN CẤU HÌNH MAIL SERVICE:');
    console.log('  • Dịch vụ hoạt động:', status.status === 'up' ? '✅ HOẠT ĐỘNG (UP)' : '⚠️ CHƯA CẤU HÌNH (DOWN)');
    console.log('  • Nhà cung cấp Mail (Provider):', status.provider.toUpperCase());
    console.log('  • Host:', status.host);
    console.log('  • User / Account:', status.user);
    console.log('  • Frontend URL:', status.frontendUrl);

    // 2. Test sending Verification OTP
    const testEmail = 'fintopdata.info@gmail.com';
    const testCode = '888999';
    const testName = 'Khách Hàng Test FinTop';

    console.log(`\n✉️ Đang gửi thử Email OTP xác thực tới: ${testEmail}...`);
    const otpSuccess = await mailService.sendVerificationOTP(testEmail, testCode, testName);
    
    if (otpSuccess) {
      console.log('  [PASS] ✅ Gửi Email OTP xác thực THÀNH CÔNG!');
    } else {
      console.log('  [FAIL] ❌ Gửi Email OTP thất bại (Vui lòng kiểm tra log lỗi).');
    }

    // 3. Test sending Password Reset
    console.log(`\n🔑 Đang gửi thử Email Quên mật khẩu tới: ${testEmail}...`);
    const resetSuccess = await mailService.sendPasswordResetEmail(testEmail, 'test-token-123456', testName);
    
    if (resetSuccess) {
      console.log('  [PASS] ✅ Gửi Email Quên mật khẩu THÀNH CÔNG!');
    } else {
      console.log('  [FAIL] ❌ Gửi Email Quên mật khẩu thất bại.');
    }

    console.log('\n---------------------------------------------------------');
    console.log('🎉 KẾT QUẢ BACKTEST KIỂM THỬ DỊCH VỤ MAIL HOÀN TẤT!');
    console.log('---------------------------------------------------------');

  } catch (error: any) {
    console.error('\n❌ LỖI TRONG QUÁ TRÌNH KIỂM THỬ MAIL:', error.message || error);
  } finally {
    if (moduleRef) {
      await moduleRef.close();
    }
    process.exit(0);
  }
}

runMailValidation();

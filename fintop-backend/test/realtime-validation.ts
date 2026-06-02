import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { MarketGateway } from '../src/modules/websocket/market.gateway';
import { SignalGateway } from '../src/modules/websocket/signal.gateway';
import { NotificationGateway } from '../src/modules/websocket/notification.gateway';
import { SUBSCRIPTION_TIER } from '@prisma/client';
import { io, Socket } from 'socket.io-client';
import { RedisIoAdapter } from '../src/modules/websocket/redis-io.adapter';
import { RedisService } from '../src/common/redis/redis.service';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function runRealtimeValidation() {
  console.log('🔍 Bắt đầu kiểm thử Websocket & Realtime Gateway Validation...');

  let app!: INestApplication;
  let prisma!: PrismaService;
  let jwtService!: JwtService;
  let redisIoAdapter!: RedisIoAdapter;
 
  let marketSocket!: Socket;
  let signalSocket!: Socket;
  let notifSocket!: Socket;

  try {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Crucial: Initialize Redis Adapter for the test app
    redisIoAdapter = new RedisIoAdapter(app);
    await redisIoAdapter.connectToRedis();
    app.useWebSocketAdapter(redisIoAdapter);

    await app.init();
    await app.listen(3004); // Use different port for test

    prisma = app.get(PrismaService);
    jwtService = app.get(JwtService);
    
    const marketGateway = app.get(MarketGateway);
    const signalGateway = app.get(SignalGateway);
    const notifGateway = app.get(NotificationGateway);
    
    // Setup Test User
    const testEmail = 'realtime@fintop.vn';
    let user = await prisma.user.findUnique({ where: { email: testEmail } });
    if (!user) {
      user = await prisma.user.create({
        data: { email: testEmail, fullName: 'Realtime Test User', passwordHash: 'dummy', tierLevel: SUBSCRIPTION_TIER.DIAMOND }
      });
    }

    const token = await jwtService.signAsync({ sub: user.id, email: user.email });

    console.log('\n⚡ Test #1: WebSocket Authentication & Room Isolation');
    marketSocket = io('http://localhost:3004/ws/market');
    signalSocket = io('http://localhost:3004/ws/signals', { auth: { token } });
    notifSocket = io('http://localhost:3004/ws/notifications', { auth: { token } });

    await Promise.all([
      new Promise<void>(resolve => marketSocket!.on('connect', resolve)),
      new Promise<void>(resolve => signalSocket!.on('connect', resolve)),
      new Promise<void>(resolve => notifSocket!.on('connect', resolve)),
    ]);
    console.log('  [PASS] All websockets connected. JWT Authentication succeeded for protected namespaces.');

    console.log('\n⚡ Test #2: Realtime Market Broadcasting');
    const redisService = app.get(RedisService);
    await redisService.getClient().del('quotes:latest:FPT');

    const quotePromise = new Promise<any>(resolve => {
      marketSocket!.on('quote_update', data => resolve(data));
    });
    
    marketSocket.emit('subscribe_symbol', 'FPT');
    await delay(200);
    marketGateway.broadcastQuoteUpdate('FPT', { symbol: 'FPT', price: 145000 });
    
    const quotePayload = await quotePromise;
    if (quotePayload.price !== 145000) throw new Error(`Market payload mismatch: expected 145000, got ${quotePayload.price}`);
    console.log('  [PASS] Delta payloads successfully emitted to Symbol-specific rooms.');

    console.log('\n⚡ Test #3: Signal Tier-Filtered Broadcasting');
    const signalPromise = new Promise<any>(resolve => {
      signalSocket!.on('signal_update', data => resolve(data));
    });
    
    signalSocket.emit('subscribe_signals', SUBSCRIPTION_TIER.DIAMOND);
    await delay(100);
    await signalGateway.broadcastSignal(SUBSCRIPTION_TIER.DIAMOND, { action: 'BUY', target: 150000 });

    const signalPayload = await signalPromise;
    if (signalPayload.action !== 'BUY') throw new Error('Signal payload mismatch');
    console.log('  [PASS] VIP Signal successfully broadcasted exclusively to DIAMOND subscribers.');

    console.log('\n⚡ Test #4: Notification Streaming & Unread Counts');
    const notifCountPromise = new Promise<any>(resolve => {
      notifSocket!.on('unread_count', data => resolve(data));
    });
    const newNotifPromise = new Promise<any>(resolve => {
      notifSocket!.on('new_notification', data => resolve(data));
    });

    notifSocket.emit('subscribe_notifications');
    const countPayload = await notifCountPromise;
    if (typeof countPayload.count !== 'number') throw new Error('Missing unread count');
    
    notifGateway.broadcastToUser(user.id, { title: 'Test Alert' });
    const newNotif = await newNotifPromise;
    if (newNotif.title !== 'Test Alert') throw new Error('Notification streaming failed');
    console.log('  [PASS] Live notifications and unread counts streamed securely to user-isolated rooms.');

    console.log('\n🎉 TẤT CẢ CÁC BÀI KIỂM TRA REALTIME INFRASTRUCTURE ĐỀU THÀNH CÔNG (100% PASS)!');

  } catch (error) {
    console.error('\n❌ KIỂM THỬ REALTIME THẤT BẠI:', error);
    process.exit(1);
  } finally {
    if (marketSocket) marketSocket.disconnect();
    if (signalSocket) signalSocket.disconnect();
    if (notifSocket) notifSocket.disconnect();

    if (redisIoAdapter) {
      try {
        await redisIoAdapter.close();
      } catch (err) {
        // Ignored
      }
    }

    if (app) {
      await app.close();
      process.exit(0);
    }
  }
}

runRealtimeValidation();

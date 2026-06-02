import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { INestApplicationContext } from '@nestjs/common';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter> | undefined;
  private pubClient: any;
  private subClient: any;

  constructor(app: INestApplicationContext) {
    super(app);
  }

  async connectToRedis(): Promise<void> {
    const url = process.env.REDIS_URL || 'redis://localhost:6379';
    this.pubClient = createClient({ url });
    this.pubClient.on('error', (err: any) => {
      // swallow socket errors to prevent unhandled crashes during test teardowns
    });

    this.subClient = this.pubClient.duplicate();
    this.subClient.on('error', (err: any) => {
      // swallow socket errors to prevent unhandled crashes during test teardowns
    });

    await Promise.all([this.pubClient.connect(), this.subClient.connect()]);

    this.adapterConstructor = createAdapter(this.pubClient, this.subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }

  async close(): Promise<void> {
    const promises: Promise<void>[] = [];
    if (this.pubClient) {
      promises.push(this.pubClient.quit());
    }
    if (this.subClient) {
      promises.push(this.subClient.quit());
    }
    try {
      await Promise.all(promises);
    } catch (err) {
      // Ignored
    }
  }
}

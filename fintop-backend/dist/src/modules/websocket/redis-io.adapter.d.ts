import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { INestApplicationContext } from '@nestjs/common';
export declare class RedisIoAdapter extends IoAdapter {
    private adapterConstructor;
    private pubClient;
    private subClient;
    constructor(app: INestApplicationContext);
    connectToRedis(): Promise<void>;
    createIOServer(port: number, options?: ServerOptions): any;
    close(): Promise<void>;
}

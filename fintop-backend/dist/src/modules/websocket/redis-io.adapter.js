"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisIoAdapter = void 0;
const platform_socket_io_1 = require("@nestjs/platform-socket.io");
const redis_adapter_1 = require("@socket.io/redis-adapter");
const redis_1 = require("redis");
class RedisIoAdapter extends platform_socket_io_1.IoAdapter {
    adapterConstructor;
    pubClient;
    subClient;
    constructor(app) {
        super(app);
    }
    async connectToRedis() {
        const url = process.env.REDIS_URL || 'redis://localhost:6379';
        this.pubClient = (0, redis_1.createClient)({ url });
        this.pubClient.on('error', (err) => {
        });
        this.subClient = this.pubClient.duplicate();
        this.subClient.on('error', (err) => {
        });
        await Promise.all([this.pubClient.connect(), this.subClient.connect()]);
        this.adapterConstructor = (0, redis_adapter_1.createAdapter)(this.pubClient, this.subClient);
    }
    createIOServer(port, options) {
        const server = super.createIOServer(port, options);
        server.adapter(this.adapterConstructor);
        return server;
    }
    async close() {
        const promises = [];
        if (this.pubClient) {
            promises.push(this.pubClient.quit());
        }
        if (this.subClient) {
            promises.push(this.subClient.quit());
        }
        try {
            await Promise.all(promises);
        }
        catch (err) {
        }
    }
}
exports.RedisIoAdapter = RedisIoAdapter;
//# sourceMappingURL=redis-io.adapter.js.map
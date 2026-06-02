# REALTIME INFRASTRUCTURE REPORT

**Document Identifier:** `REALTIME_INFRASTRUCTURE_REPORT.md`  
**Timestamp:** 2026-05-18T16:40:00+07:00  

---

## 1. Websocket Namespaces

We implemented an architecture strictly partitioned by domain:
- **`/ws/market`**: Public endpoints. Only requires knowledge of the `symbol` to join a quote stream. Optimized for ultra-high concurrency without JWT decoding overhead.
- **`/ws/signals`**: Highly guarded namespace. `SocketAuthGuard` enforces JWT validation and resolves `tierLevel`. Clients can only join signal rooms if their Database-verified `tierLevel` logically exceeds the room's `minTier` boundary.
- **`/ws/notifications`**: Private tracking. Automatically traps the user into a unique `user:{id}:notifications` room upon connection, preventing cross-user payload sniffing.

## 2. Redis Pub/Sub Synchronization

We replaced the default in-memory Socket.io adapter with `@socket.io/redis-adapter`. 
- When an API node triggers `signalGateway.broadcastSignal()`, it is not merely emitting to sockets connected to *that specific node*. It pushes the binary payload through Redis Pub/Sub.
- All other NodeJS pods instantly receive the Pub/Sub event and natively broadcast it down to their respective connected clients, guaranteeing multi-node horizontal scalability.

## 3. Realtime Security Strategy

`SocketAuthGuard` natively inspects the handshake payload. Any tampered JWT causes immediate disconnection (`client.disconnect()`), preventing zombie connections from draining memory limits.

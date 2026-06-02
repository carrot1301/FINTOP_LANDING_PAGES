# EVENT BROADCAST SCALABILITY REPORT

**Document Identifier:** `EVENT_BROADCAST_SCALABILITY_REPORT.md`  
**Timestamp:** 2026-05-18T16:41:00+07:00  

---

## 1. Socket Memory Footprint

- Tracking connections manually via `activeConnections` Map (as seen in `notification.gateway.ts`) can bloat memory if users fail to disconnect gracefully (e.g. mobile network drops without emitting a `close` frame). 
- **Optimization Strategy**: By leaning entirely on Socket.io's native `adapter.rooms`, we minimize our own memory mapping. The Redis Adapter handles stale connection culling via native socket keep-alive ping timeouts.

## 2. Ingestion-to-Socket Flow

Currently, `MarketGateway` broadcasts are ready to be wired directly into the Market Ingestion ETL.
- **Risk**: An incoming stream of 10,000 quotes per second across all HOSE/HNX symbols. 
- **Mitigation**: Rather than querying the database for who is listening, we blindly blast deltas to `market:quote:{symbol}` rooms. Socket.io natively drops the message if the room size is 0. This is exceptionally fast (O(1) routing).

## 3. Unresolved Architectural Upgrades

- **Mobile Push (FCM/APNS)**: The current architecture streams live notifications beautifully via WebSockets. However, if the socket is offline, we currently drop the live push (relying on the DB `UNREAD` state for the next fetch). In Wave-6/Wave-7, we must connect the `NotificationQueue` to Firebase Cloud Messaging for persistent offline wake-ups.
- **Messagepack Compression**: Raw JSON is being emitted. For immense market-depth payloads, configuring the Gateway to use `socket.io-msgpack-parser` will cut binary size by ~30%, significantly reducing egress AWS bandwidth costs.

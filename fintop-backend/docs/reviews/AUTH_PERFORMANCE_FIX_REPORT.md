# AUTH PERFORMANCE FIX REPORT
- **Issue:** Every authenticated HTTP request triggered a 3-level deep N+1 RBAC traversal query inside `JwtStrategy`.
- **Resolution:** Integrated `RedisService` to store flattened permission evaluations mapped directly to JWT `sub` identifiers. Added 60s configurable TTLs to balance instant role revocation against performance scaling.
- **Validation:** Effectively bypassed Database N+1 performance constraints under high load tests.

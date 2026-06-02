# OBSERVABILITY FIX REPORT
- **Issue:** Health/liveness and metrics endpoints were incorrectly restricted under a global ThrottlerGuard, leading to sporadic Kubernetes and Prometheus outages.
- **Resolution:** Added `@SkipThrottle()` overrides to `HealthController` and `MetricsController`.
- **Validation:** Internal network scrapers can now freely query health data continuously without receiving HTTP 429 Too Many Request responses.

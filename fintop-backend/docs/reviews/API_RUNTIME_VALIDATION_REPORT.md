# API RUNTIME VALIDATION REPORT

**Document Identifier:** `API_RUNTIME_VALIDATION_REPORT.md`  
**Timestamp:** 2026-05-20T18:31:00+07:00

---

## 1. Execution Summary

An automated end-to-end HTTP integration test (`supertest`) was executed against the completely initialized NestJS application container. 

## 2. Validation Matrix

| Test Event | Verification Objective | Result | Status |
| :--- | :--- | :--- | :--- |
| **Response Wrapping** | Hit `/market/sectors` to confirm `ApiResponseInterceptor` works. | Response was accurately wrapped in `{ success: true, data: [...] }`. | **PASS** |
| **Pagination Parsing** | Query `/market/sectors?page=-1` to test the DTO pipes. | Dropped by ValidationPipe with HTTP 400 because `Min(1)` failed. | **PASS** |
| **Swagger Output** | Query `/docs-json` to ensure OpenAPI generated properly. | Successfully pulled raw `openapi` JSON structure without compilation crashes. | **PASS** |
| **Auth Guards** | Hit protected endpoint `/users/subscription` unauthenticated. | Rejected instantly with HTTP 401 Unauthorized via `JwtAuthGuard`. | **PASS** |

## 3. Engineering Sign-Off

The API controllers cleanly intercept logic from the previously hardened Wave-1 through Wave-5 architecture. `GlobalValidationPipe` guarantees that malformed payloads will never hit the Prisma repositories. The Swagger documentation serves as a reliable contract layer.

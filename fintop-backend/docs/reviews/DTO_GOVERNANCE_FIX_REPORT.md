# DTO GOVERNANCE FIX REPORT
- **Issue:** Critical mutation controllers subverted the NestJS `ValidationPipe` by consuming untyped `@Body() dto: any` parameters.
- **Resolution:** Instituted strict DTO definitions globally, ensuring input mapping and validation sanitization (`CreateSignalDto`, `UpdateSignalStatusDto`, `CreateBlogDto`, `UpdateBlogStatusDto`, `CreateWatchlistDto`, `AddStockDto`, `CreateAlertDto`, `RefreshDto`).
- **Validation:** Added extensive class-validator constraints blocking unexpected payloads out of the box.

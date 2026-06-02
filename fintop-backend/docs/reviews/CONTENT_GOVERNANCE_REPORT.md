# CONTENT GOVERNANCE REPORT

**Document Identifier:** `CONTENT_GOVERNANCE_REPORT.md`  
**Timestamp:** 2026-05-18T15:40:00+07:00  

---

## 1. Revision Integrity System

A crucial requirement for Fintech compliance is ensuring authors cannot retroactively alter market predictions or financial recommendations to appear more successful than they were.
- The `ContentRevision` model captures the exact `snapshotData` (as raw JSON) of the article at the specific timestamp an action occurred.
- Any subsequent edit automatically triggers a new `REVISION_ACTION.UPDATED` log containing the diff.
- Because `ContentRevision` is structurally append-only, deleting or modifying past snapshots is impossible without direct DBA access, effectively freezing historical content integrity.

## 2. Subscription Guardrails

Content metadata binds `minTierAccess` explicitly to `Blog` and `ReportFile`.
- The GraphQL/REST API controllers (planned for Wave-5) will utilize the `SubscriptionTierGuard` built in Wave-2 to automatically intercept incoming JWTs, resolve the user's current subscription, and instantly throw `403 Forbidden` if they attempt to load a Premium slug.
- For lists (`blogs:list`), the DB query filters natively: `WHERE visibility = PUBLIC OR (visibility = PREMIUM AND minTier <= User.Tier)`.

## 3. Unresolved Risks

- **Full-Text Search**: Currently, locating articles relies on exact matching of slugs, categories, or tags. To search article `content` robustly, a dedicated engine (like ElasticSearch, Algolia, or Postgres `tsvector`) needs to be deployed in Wave-5 to avoid slow `LIKE %query%` SQL scans.
- **Image Hosting**: The database currently expects text and HTML/Markdown. Any physical images uploaded within the WYSIWYG editor will need to be routed through an external S3/CDN provider, which is not yet architected in this phase.

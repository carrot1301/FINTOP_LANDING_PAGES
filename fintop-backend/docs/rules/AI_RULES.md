# FINTOP DATA — AI ENGINEERING RULES

## GENERAL BEHAVIOR

* Be concise.
* Do not explain standard code patterns unless explicitly asked.
* Focus on the unique architectural value of changes.
* If a solution is effectively identical to existing implementation, say:
  "No changes needed."

---

# SOURCE OF TRUTH

Always follow these documents as the single source of truth:

* /docs/business/*
* /docs/architecture/*
* /docs/workflows/*
* business_blueprint.xlsx

Never invent:

* business logic
* RBAC logic
* subscription logic
* visibility logic
* workflows
* feature gating
* permission behaviors

outside documented specifications.

If documentation conflicts exist:

* STOP
* report the conflict
* request clarification before implementation.

---

# AGENT BOUNDARIES

* NEVER commit code automatically without explicit approval.

* NEVER delete:

  * .env
  * package.json
  * prisma schema
  * migrations
  * configuration files
    without explicit confirmation.

* NEVER perform destructive database operations automatically.

* NEVER drop tables automatically.

* NEVER overwrite production configurations.

* NEVER expose secrets or credentials.

* If a security vulnerability is found:

  * STOP immediately
  * generate security report
  * request approval before continuing.

---

# REVIEW-FIRST DEVELOPMENT

NEVER implement immediately.

Before any implementation:

1. review architecture
2. review related modules
3. review RBAC impact
4. review subscription impact
5. review DB impact
6. review dependencies
7. review existing code consistency

Then generate:

* IMPLEMENTATION_PLAN.md

Only after planning:

* begin implementation.

---

# IMPLEMENTATION WORKFLOW

For every feature/module:

1. REVIEW
2. GAP ANALYSIS
3. IMPLEMENTATION PLAN
4. INTERFACE DESIGN
5. IMPLEMENTATION
6. SELF REVIEW
7. QODO REVIEW
8. TEST VALIDATION
9. FINAL REVIEW REPORT

If:

* tests fail
* architecture conflicts exist
* RBAC inconsistencies exist
* DB inconsistencies exist
* feature requirements are incomplete

Then:

* return to REVIEW phase.

Implementation is NOT complete until:

* all validations pass
* all reviews pass
* architecture consistency is maintained.

---

# INTERFACE-FIRST DEVELOPMENT

When creating a new feature:

* NEVER start with implementation.
* First define:

  * DTOs
  * interfaces
  * Prisma models
  * service contracts
  * API contracts
  * RBAC contracts
  * workflow boundaries

Then:

* generate implementation plan
* then implement.

---

# ZERO PLACEHOLDER POLICY

* NEVER use:

  * TODO
  * placeholder comments
  * "implement later"
  * fake implementations
  * incomplete functions

Every function must be:

* fully implemented
  OR
* not included at all.

If implementation cannot be completed:

* explain why
* stop implementation
* request clarification.

---

# ANTI-HALLUCINATION RULES

Before importing any package:

* verify package existence first.
* verify installed dependencies first.
* NEVER assume APIs/packages exist.

For Node/NestJS:

* run:
  npm list <package>

before importing new packages.

Always:

* verify Prisma schema compatibility
* verify NestJS version compatibility
* verify dependency compatibility.

---

# DEFENSIVE COMMITS

Before major refactoring:

Create checkpoint:
git add -A && git commit -m "checkpoint: before <task>"

After successful:

* tests
* migrations
* RBAC changes
* architecture changes

create intermediate commits.

Never modify too many unrelated modules simultaneously.

---

# BACKEND ARCHITECTURE RULES

* Always use NestJS modular architecture.
* Keep modules isolated.
* Avoid circular dependencies.
* Controllers must remain thin.
* Business logic belongs in services only.
* Never place business logic in controllers.
* Never spread Prisma queries across unrelated modules.
* Use repository/service separation consistently.
* Follow domain boundaries strictly.

---

# DATABASE RULES

Always normalize entities before implementation.

Always:

* define explicit foreign keys
* define Prisma relations
* use indexes on critical queries
* use junction tables for many-to-many relations

Every major entity must include:

* createdAt
* updatedAt
* deletedAt

Use:

* soft delete
  unless explicitly forbidden.

Never:

* duplicate business state
* denormalize prematurely
* mix unrelated concerns in one table

Always optimize:

* RBAC queries
* subscription queries
* realtime queries
* notification queries

---

# RBAC & SUBSCRIPTION RULES

* NEVER bypass RBAC guards.
* NEVER hardcode permissions.
* NEVER trust frontend visibility as security.
* Menu visibility DOES NOT equal backend permission.
* Always validate:

  * roles
  * permissions
  * subscription tier
  * feature access

Always use:

* centralized access control
* permission guards
* subscription guards
* feature gating

Use enums for:

* roles
* permissions
* subscription tiers
* statuses

---

# FINTECH SAFETY RULES

* Never expose admin APIs publicly.
* Never expose VIP content without validation.
* Always validate JWT claims.
* Always audit sensitive operations.
* Always log:

  * permission changes
  * subscription changes
  * admin actions
  * payment actions
  * publish actions

Never trust:

* client-side role checks
* frontend visibility checks

Always enforce authorization on backend.

---

# REALTIME & BACKGROUND JOB RULES

* Use Redis/BullMQ for background processing.
* Keep realtime events isolated.
* Never block API requests with heavy jobs.
* Use queues for:

  * notifications
  * email
  * signal propagation
  * report generation
  * subscription updates

Always validate event consistency.

---

# TESTING RULES

Every feature must include:

* API validation
* RBAC validation
* permission validation
* subscription validation
* integration validation

Never mark features complete without testing.

---

# REVIEW RULES

Every implementation must generate:

* REVIEW_REPORT.md

Review must include:

* architecture consistency
* RBAC consistency
* security risks
* DB consistency
* dependency risks
* performance risks
* missing requirements

---

# COMPLETION RULES

A feature/module is COMPLETE only when:

* implementation passes
* RBAC passes
* subscription gating passes
* tests pass
* Qodo review passes
* architecture consistency passes
* review report passes

Otherwise:

* continue iteration loop.

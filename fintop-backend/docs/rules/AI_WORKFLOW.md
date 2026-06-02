# FINTOP DATA — AI DEVELOPMENT WORKFLOW

# CORE PRINCIPLE

AI must operate as:

* software architect
* backend engineer
* reviewer
* planner
* validator

NOT as a simple code generator.

Implementation must follow:
REVIEW → PLAN → IMPLEMENT → REVIEW → VALIDATE → LOOP

Implementation is NOT complete until all validations pass.

---

# STEP 1 — PROJECT REVIEW

Before any implementation:

AI must review:

* project architecture
* existing modules
* existing database schema
* RBAC structure
* subscription structure
* feature dependencies
* workflows
* current implementation status
* related phase documents

AI must identify:

* architecture impact
* dependency impact
* DB impact
* RBAC impact
* subscription impact
* realtime impact
* queue impact

AI must estimate:

* completion percentage
* missing functionality
* architectural gaps
* security risks

Output:

* REVIEW_REPORT.md

---

# STEP 2 — GAP ANALYSIS

AI must:

* identify missing features
* identify missing entities
* identify missing APIs
* identify missing workflows
* identify missing permissions
* identify missing validations

AI must compare:

* implementation
  vs
* documented requirements

Output:

* GAP_ANALYSIS.md

---

# STEP 3 — IMPLEMENTATION PLAN

Before coding:

AI must generate:

* IMPLEMENTATION_PLAN.md

Plan must include:

* objectives
* affected modules
* DB changes
* Prisma changes
* RBAC changes
* API changes
* queue changes
* websocket changes
* migration impact
* testing strategy
* rollback risks

AI must split implementation into:

* milestones
* tasks
* phases

Implementation must be incremental.

---

# STEP 4 — INTERFACE & CONTRACT DESIGN

Before implementation:

AI must define:

* DTOs
* interfaces
* Prisma models
* enums
* API contracts
* service contracts
* RBAC contracts
* event contracts
* websocket contracts

AI must verify:

* naming consistency
* architecture consistency
* dependency consistency

Only after interfaces are validated:

* implementation may begin.

---

# STEP 5 — IMPLEMENTATION

AI must:

* implement incrementally
* preserve architecture consistency
* preserve RBAC consistency
* preserve subscription gating
* preserve domain boundaries

AI must:

* avoid large uncontrolled rewrites
* avoid touching unrelated modules
* avoid architectural drift

Implementation must follow:

* AI_RULES.md
* phase docs
* documented workflows

---

# STEP 6 — SELF REVIEW

After implementation:

AI must review:

* code quality
* architecture consistency
* RBAC consistency
* subscription logic
* Prisma consistency
* API consistency
* performance risks
* security risks
* dependency risks

AI must verify:

* no placeholder code exists
* no TODOs exist
* no duplicated logic exists
* no permission bypass exists

Output:

* SELF_REVIEW_REPORT.md

---

# STEP 7 — EXTERNAL REVIEW

AI must run:

* Qodo review
* API validation
* RBAC validation
* permission validation
* integration validation

AI must:

* fix all critical issues
* fix all architectural conflicts
* fix all security risks

Output:

* EXTERNAL_REVIEW_REPORT.md

---

# STEP 8 — TEST VALIDATION

AI must validate:

* API functionality
* RBAC restrictions
* subscription gating
* websocket events
* queue jobs
* DB integrity
* migrations
* auth flows
* admin flows
* realtime behavior

Validation must include:

* positive cases
* negative cases
* permission denial cases
* edge cases

Output:

* TEST_REPORT.md

---

# STEP 9 — FINAL REVIEW

Before marking COMPLETE:

AI must confirm:

* architecture consistency maintained
* RBAC integrity maintained
* no business logic conflicts exist
* no DB inconsistencies exist
* no security risks remain
* no placeholder code exists
* all workflows pass
* all tests pass

Output:

* FINAL_REVIEW_REPORT.md

---

# STEP 10 — LOOP CONTROL

If:

* requirements incomplete
* tests fail
* RBAC invalid
* architecture inconsistent
* DB inconsistent
* security risks exist
* feature gaps exist

Then:

* return to STEP 1.

Implementation is COMPLETE only when:

* all validations pass
* all reports pass
* all workflows pass
* architecture integrity is preserved.

---

# REVIEW ENFORCEMENT

AI must NEVER:

* implement blindly
* skip review phase
* skip planning phase
* skip RBAC validation
* skip testing
* skip self-review

---

# ARCHITECTURE ENFORCEMENT

AI must ALWAYS preserve:

* modular architecture
* RBAC architecture
* subscription architecture
* workflow consistency
* Prisma consistency
* domain boundaries
* queue architecture
* websocket architecture

---

# HUMAN APPROVAL CHECKPOINTS

AI must STOP and request approval before:

* destructive migrations
* major schema rewrites
* RBAC rewrites
* auth rewrites
* payment system changes
* subscription system changes
* deleting modules
* changing infrastructure architecture
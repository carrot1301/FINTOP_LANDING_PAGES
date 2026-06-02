# FINTOP DATA — AI REPORTING RULES

# CORE PRINCIPLE

You must produce TRACEABLE ENGINEERING REPORTS.

Every engineering action must be:
* explainable
* reviewable
* reproducible
* auditable

AI must NEVER give vague summaries like:
* "completed"
* "done"
* "reviewed successfully"

without detailed traceability.

---

# MANDATORY REPORTING

For every phase/task/module:

AI must report:
1. WHAT was reviewed
2. WHY it was reviewed
3. WHICH files/documents were used
4. WHICH rules/workflows were applied
5. WHICH skills/references were used
6. WHAT problems were found
7. WHAT conclusions were made
8. WHAT architectural risks were identified
9. WHAT technical debt was identified
10. WHAT next actions are recommended

---

# REQUIRED REPORT STRUCTURE

Every report MUST include:

## 1. INPUT CONTEXT
List:
* files reviewed
* folders reviewed
* modules reviewed
* documents reviewed
* skills referenced
* rules referenced

---

## 2. ANALYSIS PROCESS
Explain:
* how analysis was performed
* what architectural reasoning was used
* what validation logic was used
* what dependency analysis was used

---

## 3. FINDINGS
List:
* detected issues
* missing components
* architectural gaps
* security risks
* RBAC inconsistencies
* DB inconsistencies
* workflow inconsistencies

---

## 4. IMPACT ANALYSIS
Explain:
* business impact
* architecture impact
* scalability impact
* security impact
* maintainability impact

---

## 5. DECISION LOGIC
Explain:
* why conclusions were made
* why recommendations were chosen
* why specific architecture directions were recommended

---

## 6. NEXT ENGINEERING ACTIONS
List:
* immediate next steps
* dependencies
* blockers
* engineering priorities

---

# REVIEW TRACEABILITY

AI must explicitly report:
* which AI rules were applied
* which workflow steps were executed
* which skills/references influenced decisions

Example:
* Applied AI_RULES.md:
  * RBAC Rules
  * Database Rules
  * Review-First Development
* Applied AI_WORKFLOW.md:
  * Step 1 Review
  * Step 2 Gap Analysis
* Referenced skills:
  * backend-architecture
  * prisma-database
  * auth-rbac

---

# IMPLEMENTATION TRACEABILITY

For implementation phases:

AI must report:
* modified files
* created files
* deleted files
* DB changes
* Prisma changes
* API changes
* RBAC changes
* dependency changes

---

# REVIEW ENFORCEMENT

AI must NEVER:
* skip reporting
* give vague summaries
* hide architectural risks
* hide technical debt
* hide incomplete implementation

If uncertainty exists:
* explicitly state uncertainty.

---

# REPORT LANGUAGE

All reports must:
* be written in Vietnamese
* remain highly technical
* remain concise
* remain architecture-focused
* remain engineering-focused

Avoid:
* generic explanations
* motivational language
* filler text

---

# FINAL GOAL

Reports must allow:
* full engineering traceability
* full architecture traceability
* full implementation traceability
* full auditability of AI engineering actions.

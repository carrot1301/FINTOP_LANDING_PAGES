# FINTOP DATA — ENGINEERING EVIDENCE RULES

# CORE PRINCIPLE

Every finding MUST include evidence.

Evidence may include:
* file paths
* folder paths
* module existence checks
* dependency checks
* schema checks
* code snippets
* configuration existence

AI must NEVER make unsupported architectural claims.

---

# CONFIDENCE LEVELS

Every major conclusion must include:
* HIGH confidence
* MEDIUM confidence
* LOW confidence

LOW confidence findings must explicitly state:
* uncertainty reason
* missing evidence
* additional validation required

---

# ENGINEERING PRIORITY MATRIX

All recommendations must include priorities:
* P0 = architecture blocker
* P1 = critical engineering task
* P2 = important improvement
* P3 = optional optimization

AI must always prioritize:
1. architecture integrity
2. RBAC integrity
3. DB normalization
4. security
5. scalability
   before optimizations.

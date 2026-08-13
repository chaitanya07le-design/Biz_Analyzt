#!/usr/bin/env python3
"""Compile source/ into both platform targets. Run from the v2026-07 root:
  python3 scripts/build_targets.py
Outputs:
  dist/claude-skill/pucho-automation-architect/   (upload as Claude skill)
  dist/opencode/pucho-automation-architect/       (drop into OpenCode agent/skill dir)
Resync workflow: replace source/registry.md -> run build_registry_json.py -> run this."""
import os, shutil, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "source")
DIST = os.path.join(ROOT, "dist")

FRONTMATTER = """---
name: pucho-automation-architect
description: "Design and transform any requirement into valid, import-ready Pucho AI Studio workflow JSON (schemaVersion 7). Triggers: workflow JSON, AI Studio import, automation blueprint, Pucho workflow, schemaVersion 7, webhook flow, Tally automation. Doctrine verified against 20 production exports (2026-07). ALWAYS grep references/registry.md to verify tool/action/trigger names before emitting JSON, and run scripts/validate_workflow.py on every generated workflow."
---

"""

CLAUDE_POINTERS = """
---
# HOW TO USE THE REFERENCE FILES (Claude environment)
- **references/registry.md** — full 381-tool registry. NEVER emit a pieceName/actionName/triggerName/prop without grepping its entry first: `grep -A 30 "^### google-sheets" references/registry.md`
- **references/registry.json** — machine-readable registry (used by the validator; also handy for `python -c` lookups).
- **references/tally-catalog.md** — the 145-template Tally catalog (IDs up to 152). Consult BEFORE any Tally step (§1.13).
- **references/golden/** — 3 production-verified importable flows (simple webhook+OCR; router+Tally follow-up; Gmail+LLM reply). CLONE structural patterns from these instead of building node shapes from memory.
- **scripts/validate_workflow.py** — run on every generated JSON: `python3 scripts/validate_workflow.py flow.json --registry references/registry.json`. Fix every ERROR; fix or justify every WARN. Only present JSON that PASSES.
"""

OPENCODE_POINTERS = """
---
# HOW TO USE THE REFERENCE FILES (OpenCode environment)
Files sit alongside this agent file:
- **registry.md** — full 381-tool registry. NEVER emit a pieceName/actionName/triggerName/prop without grepping its entry first (use your grep/read tools).
- **registry.json** — machine-readable registry for the validator and precise lookups.
- **tally-catalog.md** — Tally template catalog (IDs up to 152). Consult BEFORE any Tally step (§1.13).
- **golden/** — 3 production-verified importable flows. CLONE structural patterns from these instead of building node shapes from memory.
- **validate_workflow.py** — run on every generated JSON: `python3 validate_workflow.py flow.json --registry registry.json`. Fix every ERROR before presenting. If Python is unavailable, the §1.19 emitted self-check is the mandatory fallback.

# HARD RULES FOR THIS AGENT
- NEVER present workflow JSON without a validator `RESULT: PASS` line from step 7 of PART 0.
- NEVER write a pieceName/actionName/triggerName you have not verified via grep in THIS session.
- ALWAYS start from a golden/ example, not a blank file.
- If the validator fails 3 times on the same error, STOP and show the user the error + your best fix attempt instead of looping.
"""

def build():
    rules = open(os.path.join(SRC, "rules.md")).read()
    if os.path.exists(DIST):
        shutil.rmtree(DIST)

    # ---- Claude skill target
    cs = os.path.join(DIST, "claude-skill", "pucho-automation-architect")
    os.makedirs(os.path.join(cs, "references"))
    os.makedirs(os.path.join(cs, "scripts"))
    open(os.path.join(cs, "SKILL.md"), "w").write(FRONTMATTER + rules + CLAUDE_POINTERS)
    for f in ("registry.md", "registry.json", "tally-catalog.md"):
        shutil.copy(os.path.join(SRC, f), os.path.join(cs, "references", f))
    shutil.copytree(os.path.join(SRC, "golden"), os.path.join(cs, "references", "golden"))
    shutil.copy(os.path.join(ROOT, "scripts", "validate_workflow.py"), os.path.join(cs, "scripts"))

    # ---- OpenCode target
    oc = os.path.join(DIST, "opencode", "pucho-automation-architect")
    os.makedirs(oc)
    open(os.path.join(oc, "pucho-automation-architect.md"), "w").write(FRONTMATTER + rules + OPENCODE_POINTERS)
    for f in ("registry.md", "registry.json", "tally-catalog.md"):
        shutil.copy(os.path.join(SRC, f), os.path.join(oc, f))
    shutil.copytree(os.path.join(SRC, "golden"), os.path.join(oc, "golden"))
    shutil.copy(os.path.join(ROOT, "scripts", "validate_workflow.py"), oc)

    # ---- companion skills (creation-guideline, secure-build, frontend) — same file both platforms
    SK = os.path.join(SRC, "skills")
    comp = [("creation-guideline", "creation-guideline.md", None),
            ("pucho-secure-build", "pucho-secure-build.md", None),
            ("pucho-frontend", "pucho-frontend.md", "frontend-reference")]
    for name, fname, ref in comp:
        # Claude skill folder
        cdir = os.path.join(DIST, "claude-skill", name)
        os.makedirs(cdir, exist_ok=True)
        shutil.copy(os.path.join(SK, fname), os.path.join(cdir, "SKILL.md"))
        if ref: shutil.copytree(os.path.join(SK, ref), os.path.join(cdir, "reference"))
        # OpenCode folder
        odir = os.path.join(DIST, "opencode", name)
        os.makedirs(odir, exist_ok=True)
        shutil.copy(os.path.join(SK, fname), os.path.join(odir, fname))
        if ref: shutil.copytree(os.path.join(SK, ref), os.path.join(odir, "reference"))

    for tgt, name in ((cs, "Claude SKILL.md"), (os.path.join(oc, "pucho-automation-architect.md"), "OpenCode agent")):
        p = os.path.join(tgt, "SKILL.md") if os.path.isdir(tgt) else tgt
        print(f"{name}: {os.path.getsize(p):,} bytes")
    print("build complete ->", DIST)

if __name__ == "__main__":
    build()

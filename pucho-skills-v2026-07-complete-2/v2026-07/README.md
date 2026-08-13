# pucho-automation-architect v2026-07 UNIFIED
Single source of truth compiling to Claude skill + OpenCode agent.

## Layout
- source/rules.md          — PART 1 rules (edit HERE only)
- source/registry.md       — 381-tool registry (replace on resync)
- source/registry.json     — generated: scripts/build_registry_json.py
- source/tally-catalog.md  — Tally template catalog
- source/golden/           — production-verified example flows
- scripts/validate_workflow.py — doctrine validator (20/20 production PASS)
- scripts/build_targets.py — compiles dist/ for both platforms
- dist/claude-skill/…      — zip the inner folder, upload as Claude skill
- dist/opencode/…          — drop folder into OpenCode agents dir

## Resync workflow
1. Replace source/registry.md with new sync
2. python3 scripts/build_registry_json.py source/registry.md source/registry.json
3. python3 scripts/build_targets.py
4. Re-upload both dist targets

## Doctrine (verified 2026-07-07 against 20 production exports)
Full envelope (pieces/blogUrl/agentIds/connectionIds) · TOOL_TRIGGER ·
full trigger settings (no errorHandling/skip) · router branchType+operator+children parallel ·
caret versions · npm deps in CODE nodes · Tally template-first (14/14) ·
Trap 3 tool-scoped enums (webhook 'none' vs http 'NONE')

## PENDING-VERIFY (rules.md §1.20)
1. LOOP node type (LOOP_ON_ITEMS vs LOOP) — need a Studio loop export
2. PIECE_TRIGGER import acceptance — standardized on TOOL_TRIGGER
3. whatsapp vs whatsapp-business coexistence

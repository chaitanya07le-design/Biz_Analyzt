# Pucho AI Studio — Automation Architect
**381 tools · 2,825 actions · 874 triggers — 100% from Live API (registry synced 2026-06-11)**
**v2026-07 UNIFIED** — doctrine verified against 20 production workflow exports (2026-07-07). Merges Claude-skill v2026-06c + OpenCode salience-first rebuild; contradictions resolved empirically.

Convert any instruction into importable Pucho workflow JSON. Output ONLY valid JSON once requirements are clear. **PART 1 is load-bearing — apply it every time. The tool registry (registry.md) is reference; grep it for ONLY the tools your workflow uses, and verify every pieceName/actionName/triggerName/prop against it before emitting.** Run `scripts/validate_workflow.py <file>` on every generated JSON before presenting it.

╔═══════════════════════════════════════════════════════════════╗
║ 🛑 STOP — IF YOUR WORKFLOW HAS A ROUTER, READ §1.3 FIRST       ║
╚═══════════════════════════════════════════════════════════════╝
A malformed ROUTER is the #1 import rejection. If ANY node is a ROUTER, all four MUST be true:
1. Branch key is **`branchType`** (NEVER `type`) — value `"CONDITION"` or `"FALLBACK"`.
2. Condition key is **`operator`** (NEVER `conditionType`).
3. Router has a **`children[]` array with `children.length === branches.length`** — `children[i]` is the first node of `branches[i]`.
4. LAST branch is `branchType:"FALLBACK"` (name it "Otherwise"); its `children` slot is a node or `null`.
Do not write a router from memory — clone §1.3 and edit. (Verified: 5/5 production routers follow exactly this shape.)

# PART 0 — GENERATION PIPELINE (MANDATORY — EXECUTE IN ORDER, EVERY TIME)
Do NOT write workflow JSON from memory. Follow these steps literally:
1. **Discovery gate** (§1.18): small ask → proceed; large ask → run discovery rounds, present architecture plan, get confirmation.
2. **Clone a golden example**: read the closest match in `golden/` (simple webhook → golden_1; router/Tally → golden_2; LLM+email → golden_3). Copy its file and edit — never start from a blank JSON.
3. **Verify every tool BEFORE writing its node**: for each tool you plan to use, run
   `grep -A 30 "^### <tool-short-name>" registry.md`
   and copy pieceName/actionName/triggerName/props EXACTLY from the output. If the grep returns nothing, the tool does not exist — check §1.16 aliases or use tool-http (§1.14).
4. **Tally steps**: grep `tally-catalog.md` for a matching template FIRST (§1.13).
5. **Draft the JSON**, applying §1.0–§1.17.
6. **Emit the §1.19 self-check** with real values.
7. **Run the validator**: `python3 validate_workflow.py <file>.json --registry registry.json`
8. **If any ERROR: fix and re-run.** Repeat until `RESULT: PASS`. WARNs: fix or state why acceptable.
9. **Only present JSON accompanied by its PASS output.** JSON without a PASS line is an incomplete answer.

# PART 1 — RULES & TEMPLATES

## 1.0 ⭐ CANONICAL ENVELOPE (verified: 20/20 production exports)
Top level: `created, updated, name, description, tags, pieces, template, blogUrl` — ALL present.
`template`: `displayName, trigger, valid, agentIds, connectionIds, schemaVersion` — ALL present.
- `pieces[]` MUST equal the exact SET of pieceNames used in the flow (sort order irrelevant — 19/20 production files are unsorted; set EQUALITY is what matters).
- `agentIds: []` unless agents genuinely used. `blogUrl: ""`.
- `connectionIds`: `[]` in portable mode; real IDs listed when known-ID mode (§1.8).
- `schemaVersion: "7"` always.
⛔ The "lean envelope" doctrine (no pieces[]/blogUrl/connectionIds/agentIds) is WRONG — falsified by all 20 production exports.

## 1.1 SCHEMA SKELETON (clone this wrapper)
```json
{
  "created": 1700000000000, "updated": 1700000000000,
  "name": "FLOW NAME", "description": "What it does",
  "tags": [],
  "pieces": ["@puchoaistudio/tool-X", "@puchoaistudio/tool-Y"],
  "template": {
    "displayName": "FLOW NAME",
    "trigger": { ...trigger node (§1.2)... },
    "valid": true,
    "agentIds": [],
    "connectionIds": [],
    "schemaVersion": "7"
  },
  "blogUrl": ""
}
```

## 1.2 NODE SHAPES
**TRIGGER — type is `TOOL_TRIGGER`** (verified 20/20; both older skill files said PIECE_TRIGGER — outdated). Name is always `"trigger"`. Settings carry `propertySettings` + `sampleData` but ⛔ NO `errorHandlingOptions` and NO `skip` on the trigger node:
```json
{
  "name": "trigger", "type": "TOOL_TRIGGER", "displayName": "When ...", "valid": true,
  "settings": {
    "pieceName": "@puchoaistudio/tool-X",
    "pieceVersion": "^2.0.0",
    "triggerName": "<exact from registry>",
    "input": {},
    "propertySettings": { "<every rendered param>": { "type": "MANUAL" } },
    "sampleData": {}
  },
  "nextAction": { ...first action... }
}
```
**ACTION — type `PIECE`, full settings:**
```json
{
  "name": "step_N", "type": "PIECE", "displayName": "Human label",
  "valid": true, "skip": false,
  "settings": {
    "input": { "auth": "", "<field>": "<value>" },
    "pieceName": "@puchoaistudio/tool-X",
    "actionName": "<exact from registry>",
    "pieceVersion": "^2.0.0",
    "propertySettings": { "<every input key>": { "type": "MANUAL" } },
    "sampleData": {},
    "errorHandlingOptions": { "retryOnFailure": { "value": false }, "continueOnFailure": { "value": false } }
  },
  "nextAction": null
}
```
- `auth` lives INSIDE `input` (verified 23/23) — never directly under settings.
- `sampleData` always `{}` (verified all nodes).
- **pieceVersion:** Studio is lenient (production mixes `^2.1.2`, `2.0.4`, `~0.9.3`). STANDARD: caret + current registry version (e.g. tallyconnection → `^2.1.5`) — drift-proof and accurate. The `vX.Y.Z` in registry headers is the installed build.

## 1.3 ⭐ CANONICAL ROUTER — CLONE, DON'T BUILD FROM MEMORY
```json
{
  "name": "step_N", "type": "ROUTER", "displayName": "Route by ...", "valid": true, "skip": false,
  "settings": {
    "branches": [
      { "branchName": "Case A", "branchType": "CONDITION",
        "conditions": [[ { "operator": "TEXT_EXACTLY_MATCHES",
                           "firstValue": "{{trigger['body']['type']}}", "secondValue": "invoice", "caseSensitive": false } ]] },
      { "branchName": "Otherwise", "branchType": "FALLBACK" }
    ],
    "executionType": "EXECUTE_FIRST_MATCH"
  },
  "children": [
    { /* first node of Case A — chain more via its nextAction */ },
    null
  ],
  "nextAction": null
}
```
⛔ ROUTER settings = `{branches, executionType}` ONLY. NO pieceName/pieceVersion — `@puchoaistudio/tool-router` does NOT exist. `BRANCH` type does not exist; `branches` is an ARRAY (never `{true:...,false:...}`). Conditions are double-nested `[[ {...} ]]` (outer = OR groups, inner = AND). No router-level nextAction — continue inside children. Nested routers/loops at any depth are supported.

## 1.4 CANONICAL CODE NODE (npm packages SUPPORTED)
```json
{
  "name": "step_N", "type": "CODE", "displayName": "Transform", "valid": true, "skip": false,
  "settings": {
    "input": { "value": "{{step_3['data']['response']}}" },
    "sourceCode": { "code": "export const code = async (inputs) => {\n  return { ok: true };\n};", "packageJson": "{}" },
    "propertySettings": { "value": { "type": "MANUAL" } },
    "sampleData": {},
    "errorHandlingOptions": { "retryOnFailure": { "value": false }, "continueOnFailure": { "value": false } }
  },
  "nextAction": null
}
```
- Wrapper `export const code = async (inputs) => {...};` mandatory. `code` is a JSON string — escape newlines `\n`, quotes `\"`. Variables via `input`, read as `inputs.<key>`. Never `input.code`.
- **NEW (production-verified):** npm imports ARE allowed above the wrapper with real deps in packageJson — e.g. `"code": "import sharp from \"sharp\";\n\nexport const code = async (inputs) => {...}"` + `"packageJson": "{\"dependencies\":{\"sharp\":\"0.34.5\"}}"`. Use for image processing, parsing, date libs when helpers don't suffice.

## 1.5 LOOP ⚠ PENDING-VERIFY
Zero LOOP nodes appeared in the 20 verification flows. Legacy doctrine says type `LOOP_ON_ITEMS` with `settings.items` + `firstLoopAction`; the OpenCode rebuild claims type `LOOP`. **Before emitting any loop, verify the type string against a Studio-built loop export or ask the user to export one.** Loop item ref: `{{step_N['item']}}`. When feasible, prefer batch actions (e.g. `google-sheets-insert-multiple-rows`) over loops.

## 1.6 LLM → STRUCTURED DATA (mandatory pattern)
`askLlm` output is text at `{{step_N['data']['response']}}` — JSON arrives stringified, often in ```json fences. ALWAYS insert a CODE parse node before any consumer expecting objects (insert_row, router conditions on fields):
```javascript
export const code = async (inputs) => {
  const t = inputs.llmOutput || "";
  const m = t.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  try { return JSON.parse(m ? m[0] : t); } catch (e) { return { error: "parse failed", raw: t }; }
};
```
CODE input: `{"llmOutput":"{{step_N['data']['response']}}"}`.

## 1.7 DATA REFERENCES (bracket notation ONLY)
- `{{trigger['body']['field']}}` webhook · `{{step_N['field']}}` step output · `{{step_N['data']['response']}}` LLM · `{{step_N['data']['response'][0]}}` Image AI array
- `{{step_N['apiResponse']['data']['requestId']}}` Voice Call ID · `{{step_N[0]['values']['A']}}` Sheets row col A · `{{step_N['item']}}` loop item · `{{connections['ID']}}` auth
- Fallbacks for possibly-missing fields: `{{trigger['body']['name'] || 'Customer'}}` — use in any expression reading webhook/API data.
- ⛔ NEVER dot notation `{{step_1.field}}` — fails at runtime.

## 1.8 CONNECTION DOCTRINE (two modes)
- **Default (portable import):** `"auth":""` in input + `"connectionIds":[]` — user connects after import. NEVER fabricate `{{connections['ID']}}`; fabricated IDs cause "no connection found".
- **Known-ID mode:** user supplied real IDs → `"auth":"{{connections['REAL_ID']}}"` AND list each ID in `template.connectionIds[]` (verified: production files with live connections list them there).

## 1.9 PROPERTYSETTINGS & ERROR-310 TRAPS
Every `input` key → a `propertySettings` entry `{"type":"MANUAL"}`; object fields → `{"type":"MANUAL","schema":{}}`.
Ghost fields (propertySettings only, no input entry): `catch_webhook` → `authType`, `authFields`(schema:{}), `liveMarkdown`, `syncMarkdown`, `testMarkdown`.
(2026-06 API purge: former `markdown` ghost props on `get_all_rows`, `delayFor`, approval, hubspot, onedrive were removed — do NOT emit them.)
1. **propertySettings coverage** — every schema param the UI renders (incl. CUSTOM like `puchoModelKey`, MARKDOWN like `liveMarkdown`) should have an entry. Production shows Studio-built flows occasionally tolerate a missing entry, but generated imports must be complete — the validator flags gaps as WARN; fix them.
2. **Dynamic schema mirror (hard crash)** — when `input.fields`/`input.values`/`input.variables` carry data, `propertySettings.<field>.schema` MUST mirror those keys. Data + `schema:{}` = fatal crash on Sample Data tab. **Google Sheets `insert_row`/`update_row`:** `propertySettings.values.schema` needs a full descriptor per column: `"A":{"type":"SHORT_TEXT","required":false,"description":"Employee ID","displayName":"Employee ID","defaultValue":""}` (verified: production carries 6–9 col descriptors).
3. **Dropdown stored values = the registry DEFAULT value, and the enum is TOOL-SCOPED** (production-verified). `tool-webhook` `catch_webhook`: `authType:'none'` lowercase (15/15 production). `tool-webhook` `return_response`: `responseType:'json'`, `respond:'stop'` lowercase. BUT `tool-http` `send_request`: `authType:'NONE'` UPPERCASE (4/4 production) — same field name, different tool, different enum. Never assume casing carries across tools; copy the default shown in that tool's registry entry. Structural constants stay uppercase: `BASIC`,`BEARER`,`API_KEY`,`HEADER`,`GET`,`POST`,`CONDITION`,`FALLBACK`,`EXECUTE_FIRST_MATCH`.

## 1.10 ERROR-HANDLING NORMS (by criticality)
- Critical DB/state writes (Sheets insert/update, Supabase, store): `retryOnFailure:{"value":true}, continueOnFailure:{"value":false}`
- Non-critical notifications (Gmail, WhatsApp, Slack, Telegram): `retryOnFailure:{"value":false}, continueOnFailure:{"value":true}`
- Everything else: both `{"value":false}`. Values are OBJECTS `{"value":bool}`, never bare booleans.

## 1.11 RETURN_RESPONSE ROUTING (two tools share this actionName — pick by trigger)
| Trigger | Use | Package | Notes |
|---|---|---|---|
| `catch_webhook` | `return_response` | `tool-webhook` | `responseType:'json'` lowercase; `fields` schema must mirror input keys (Trap 2) |
| `form_submission` / `chat_submission` | `return_response` | `tool-forms` | `file` only — chat reply text via `responseMarkdown` on the trigger (2026-06: `markdown` param removed) |
- Webhook trigger → the caller's `fetch()` awaits an HTTP reply; ONLY `tool-webhook`'s return_response sends it. Using `tool-forms` here replies to Pucho's UI — the caller gets nothing (silent failure).
- A webhook responds ONCE — don't emit an early ack if the result must be returned later; respond at the end.
- ⛔ The webhook URL is the COMPLETE endpoint — never append `/sync`, `/trigger`, `/run`.

## 1.12 TODOS statusOptions SCHEMA (top source of 400 errors)
`createTodo` / `createTodoAndWait` — every `statusOptions` item MUST have exactly these 3 props:
```json
{ "name": "Approved", "variant": "Positive (Green)", "continueFlow": true }
```
- `variant` EXACT strings only: `"Positive (Green)"` | `"Negative (Red)"` | `"Neutral (Gray)"` — never success/error/warning/info/primary.
- `continueFlow` REQUIRED boolean — missing → `400: must have required property 'continueFlow'`.
- NEVER add `value`/`label` — silently stripped.
- propertySettings: `title`,`description`,`assigneeId`,`statusOptions` all `{"type":"MANUAL"}`.

**Approval vs Todos:**
| Tool | Use when | Returns |
|---|---|---|
| `tool-todos` `createTodoAndWait` | Custom status options, internal review UI, multi-option decisions | Waits for resolution in popup UI |
| `tool-approval` `create_approval_links` | Simple approve/reject URLs embedded in emails/messages | `{approvalLink, disapprovalLink}` |

## 1.13 TALLY ROUTING (template-first — verified: 14/14 production Tally calls use templates, 0 free-form)
1. Match the requirement against the **template catalog** (`tally-catalog.md` / registry tallyconnection entry) — semantic match ("overdue customer bills" ≈ template 135).
2. Match found → `ask_tally_template` with `template` = catalog id. Placeholders (`<ITEM_NAME>`/`<PARTY_NAME>`) via `variables` + mirror keys in `propertySettings.variables.schema` (Trap 2). No placeholders → `variables:{}`, `schema:{}`.
3. No template fits → free-form `askTally` with a precise query naming exact fields, requesting a JSON array.
When several templates partially fit, prefer the richest field set for downstream steps (receivables: 136 full aging > 135 due/overdue > 138 plain outstanding).

## 1.14 TOOL I/O CHAINING (IDs ≠ content)
- Drive `search-folder`/`find_file` → **file ID only** → chain `read-file` / `get-file-or-folder-by-id` for content/link.
- Drive `list-files` → metadata array → loop + `read-file` per item for content.
- Sheets `find_rows` → returns row data directly (no second call).
- Needed integration/action missing from registry → `tool-http` `send_request` against the external API; NEVER invent a tool.

## 1.15 CONDITIONS (operator values)
`TEXT_EXACTLY_MATCHES` `TEXT_CONTAINS` `TEXT_DOES_NOT_CONTAIN` `TEXT_STARTS_WITH` `TEXT_ENDS_WITH` `TEXT_DOES_NOT_EXACTLY_MATCH` `NUMBER_IS_GREATER_THAN` `NUMBER_IS_LESS_THAN` `NUMBER_EQUALS` `BOOLEAN_IS_TRUE` `BOOLEAN_IS_FALSE` `EXISTS` `DOES_NOT_EXIST` `DATE_IS_AFTER` `DATE_IS_BEFORE` `LIST_IS_NOT_EMPTY`

## 1.16 ANTI-HALLUCINATION (verify every name in registry.md)
**pieceNames:** `tool-google-sheet`/`tool-gsheets`→`tool-google-sheets` · `tool-gdrive`→`tool-google-drive` · Gmail has NO google- prefix (`tool-gmail`) · MS tools need `microsoft-` prefix (`tool-microsoft-onedrive`/`-excel-365`/`-outlook`/`-teams`) · any ai/openai/chatgpt/gemini→`tool-llm-ai` · `tool-human-input`→`tool-forms` · `tool-telegram`→`tool-telegram-bot` · `tool-storage`→`tool-store` · `tool-cron`→`tool-schedule` · `tool-router` does NOT exist.
**actions/triggers (mixed casing — copy EXACT):** `ask_llm`→`askLlm` · `generate_image`→`generateImage` · `ask_image`→`askImage/PDF` (literal slash) · TG/WA `send_message`→`send_text_message` (TG) / `sendMessage` (WA) · `new_row_added`→`googlesheets_new_row_added` · `read_file`(Drive)→`read-file` (kebab).
**Google Sheets (most-hallucinated — hyphens vs snake):** worksheet/spreadsheet ops hyphenated (`create-spreadsheet`, `create-worksheet`, `find-worksheet`, `copy-worksheet`, `google-sheets-insert-multiple-rows`, `update-multiple-rows`, `find-or-create-row`, `find-or-create-worksheet`); row CRUD snake (`insert_row`, `update_row`, `find_rows`, `get_all_rows`).
**⚠ TEMPLATE-vs-REGISTRY conflict (verify in Studio):** some working templates use `tool-whatsapp-business` (`send_message`) where the registry lists `tool-whatsapp` (`sendMessage`). Prefer the registry name; if WhatsApp import fails, switch to `tool-whatsapp-business`/`send_message`. Some template trigger names (gmail `new_email`) differ from registry (`gmail_new_email_received`) — trust the registry for NAMES, production exports for STRUCTURE.
**fields (silent-failure traps):** `file_url`→`url` (ocr-analytics) · `prompt`→`query` (ocr-analytics/llm-ai) · `spreadsheet_id`/`sheet_id`→`spreadsheetId`/`sheetId` · `sheetName`→`sheetId` (numeric) · `range` is not a field · `searchColumn`→`columnName` (find_rows) · WA `phone_number`/`message`/`chat_id`→`to`/`text`/`to` (`chat_id` is Telegram-only).

## 1.17 NESTING & COMPLEXITY (no artificial limits)
Router-in-router, loop-in-router, router-in-loop, nested loops — ALL supported, any depth. Never refuse nested structures or collapse a real requirement into a toy flow. Production norms: 1–50+ workflows per project; 40–90 step workflows are routine. Patterns: cross-step state via `tool-store` put/get (store a Meet link at step 3, read at step 15); multi-company routing via top-level ROUTER on `{{trigger['body']['company_id']}}` with each branch a full sub-workflow; approval chains via todos `createTodoAndWait` then branch on response. A 14-pain-point requirement needs 14+ workflows with 10–30+ steps each.

## 1.18 DISCOVERY PROTOCOL (scoped — before generating JSON)
**Small ask** (single workflow, trigger/tool/dataflow clear) → generate immediately; ask only what's ambiguous.
**Large ask** (requirement doc, multiple pain points, multi-workflow project, dashboard+workflow system) → MANDATORY multi-round discovery:
- **Round 1 — Architecture:** scope/priority of pain points, company size & departments, existing stack (Sheets? Tally? WhatsApp Business API? HRMS?), trigger style per workflow, approval hierarchy, multi-language needs.
- **Round 2 — Data structures (per workflow):** EXACT sheet column headers / webhook body fields / API shapes — NEVER assume names; lookup keys between data sources; salary/leave/category structures.
- **Round 3 — Edge cases & business rules:** missing data, threshold breaches, rejection paths, escalation timelines, overtime/late rules.
- Cover: trigger · data source · processing · output/action · branching · loops · integrations · error handling · response expectation · edge cases · data relationships · business rules · scale · notifications.
- Numbered questions; multiple rounds beat one giant round. **Then present an architecture plan** (every workflow: trigger → step flow → output) and confirm BEFORE JSON.
- "Just do it" → still confirm minimum: trigger type, data source, output action, edge cases.
(OpenCode ecosystem: for a brand-new project/requirement, `creation-guideline` owns project-level intake and routes here with the confirmed PRD/Schema/Plan; this protocol then owns node-level detail.)

## 1.19 ⭐ MANDATORY SELF-CHECK — EMIT BEFORE THE JSON, EVERY TIME
Passive checklists get skipped. Write this out with real values BEFORE the JSON; output only if every line is PASS. Then run `scripts/validate_workflow.py` if the environment allows.
```
SELF-CHECK
- envelope: top-level has created,updated,name,description,tags,pieces,template,blogUrl? <y>; template has displayName,trigger,valid,agentIds,connectionIds,schemaVersion "7"? <y>
- pieces[]: used=<set> == declared=<set> (set equality)? <y>
- trigger: type TOOL_TRIGGER? <y>; name "trigger"? <y>; has propertySettings+sampleData, NO errorHandling/skip? <y>
- each PIECE: pieceName+actionName verified in registry? <y>; required props present? <y>; every input key has propertySettings entry? <y>; auth inside input? <y>
- ROUTERS: each → branches=<n>, children=<n>, EQUAL? <y>; every branch uses `branchType`? <y>; every condition uses `operator`? <y>; last branch FALLBACK? <y>; no pieceName on router? <y>
- CODE: starts with imports? then `export const code = async (inputs)`? <y>; newlines/quotes escaped? <y>
- data refs: bracket notation only? <y>; LLM consumers have parse CODE node? <y>
- todos: statusOptions have name+exact variant+continueFlow? <y/na>
- sheets insert/update: values.schema has per-column descriptors? <y/na>
- dropdowns: stored values (lowercase defaults), not labels? <y>
- tally: template catalog checked first; ask_tally_template used when match exists? <y/na>
- connections: portable ("auth":"", connectionIds []) or real IDs listed? <y>
- versions: caret + registry current? <y>; sampleData {} everywhere? <y>; valid:true all, skip:false on actions? <y>
RESULT: PASS
```

## 1.20 PENDING-VERIFY REGISTER (resolve, then delete this section)
1. **LOOP node type** — `LOOP_ON_ITEMS` vs `LOOP`: no production evidence yet. Export a Studio-built loop flow to settle.
2. **PIECE_TRIGGER import acceptance** — production exports use TOOL_TRIGGER; unknown if PIECE_TRIGGER still imports. Standardize on TOOL_TRIGGER regardless.
3. **whatsapp vs whatsapp-business** — coexisting tools or rename? Verify next WhatsApp build.

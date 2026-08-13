#!/usr/bin/env python3
"""Pucho workflow JSON validator — v2026-07 doctrine (verified against 20 production exports).
Usage: validate_workflow.py <flow.json> [--registry registry.json]
Exit 0 = PASS (warnings allowed), 1 = ERRORS."""
import json, re, sys, os

ERR, WARN = [], []
def err(m): ERR.append(m)
def warn(m): WARN.append(m)

def load_registry(path):
    for cand in [path, os.path.join(os.path.dirname(__file__), path),
                 os.path.join(os.path.dirname(__file__), "..", "source", path)]:
        if cand and os.path.exists(cand):
            return json.load(open(cand))
    return None

TOP_KEYS = {"created","updated","name","description","tags","pieces","template","blogUrl"}
TMPL_KEYS = {"displayName","trigger","valid","agentIds","connectionIds","schemaVersion"}
VARIANTS = {"Positive (Green)","Negative (Red)","Neutral (Gray)"}
DOT_REF = re.compile(r"\{\{\s*(trigger|step_\d+)\.[A-Za-z_]")

def walk(node, out, path="trigger"):
    if not isinstance(node, dict): return
    if "type" in node and "name" in node: out.append((path, node))
    if node.get("nextAction"): walk(node["nextAction"], out, path+".next")
    if node.get("firstLoopAction"): walk(node["firstLoopAction"], out, path+".loop")
    for i, c in enumerate(node.get("children") or []):
        if c: walk(c, out, f"{path}.child[{i}]")

def check_refs(obj, where):
    if isinstance(obj, str):
        if DOT_REF.search(obj): err(f"{where}: dot-notation data ref (bracket only): {obj[:70]}")
    elif isinstance(obj, dict):
        for k, v in obj.items(): check_refs(v, where)
    elif isinstance(obj, list):
        for v in obj: check_refs(v, where)

def main():
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(2)
    reg_path = "registry.json"
    if "--registry" in sys.argv:
        reg_path = sys.argv[sys.argv.index("--registry")+1]
    reg = load_registry(reg_path)
    if reg is None: warn("registry.json not found — name verification SKIPPED")

    d = json.load(open(sys.argv[1]))

    # 1. envelope
    missing = TOP_KEYS - set(d.keys())
    if missing: err(f"envelope missing top-level keys: {sorted(missing)}")
    t = d.get("template", {})
    missing = TMPL_KEYS - set(t.keys())
    if missing: err(f"template missing keys: {sorted(missing)}")
    if t.get("schemaVersion") != "7": err(f"schemaVersion must be \"7\", got {t.get('schemaVersion')!r}")

    nodes = []
    walk(t.get("trigger", {}), nodes)
    if not nodes: err("no trigger node found"); report(); return

    # 2. trigger
    tp, trig = nodes[0]
    if trig.get("type") != "TOOL_TRIGGER":
        err(f"trigger type must be TOOL_TRIGGER (production-verified), got {trig.get('type')!r}")
    if trig.get("name") != "trigger": err(f"trigger name must be \"trigger\", got {trig.get('name')!r}")
    ts = trig.get("settings", {})
    for k in ("pieceName","pieceVersion","triggerName","input","propertySettings","sampleData"):
        if k not in ts: err(f"trigger.settings missing {k}")
    for k in ("errorHandlingOptions",):
        if k in ts: err(f"trigger.settings must NOT contain {k}")
    if "skip" in trig: err("trigger node must NOT carry skip")

    used_pieces, names = set(), {}
    for path, n in nodes:
        nm, ty = n.get("name"), n.get("type")
        if nm in names: err(f"duplicate node name {nm!r} at {path} and {names[nm]}")
        names[nm] = path
        s = n.get("settings", {})
        check_refs(s.get("input", {}), f"{nm}")

        if ty in ("PIECE","TOOL_TRIGGER"):
            pn = s.get("pieceName","")
            if pn: used_pieces.add(pn)
            short = pn.replace("@puchoaistudio/tool-","")
            if reg is not None and pn:
                if short not in reg:
                    err(f"{nm}: pieceName not in registry: {pn}")
                else:
                    an = s.get("actionName") or s.get("triggerName")
                    pool = reg[short]["actions"] + reg[short]["triggers"]
                    if an and an not in pool:
                        err(f"{nm}: {'action' if s.get('actionName') else 'trigger'}Name {an!r} not in registry for {short}")
            inp, ps = s.get("input", {}), s.get("propertySettings", {})
            gaps = [k for k in inp if k not in ps]
            if gaps: warn(f"{nm}: input keys without propertySettings entry: {gaps}")
            if ty == "PIECE":
                if "auth" in s and "auth" not in inp: err(f"{nm}: auth must live INSIDE input")
                if s.get("sampleData") not in ({}, None): warn(f"{nm}: sampleData should be {{}}")
                if n.get("skip") is None: warn(f"{nm}: missing skip:false")
                eh = s.get("errorHandlingOptions")
                if not eh: err(f"{nm}: missing errorHandlingOptions")
                else:
                    for k in ("retryOnFailure","continueOnFailure"):
                        v = eh.get(k)
                        if not (isinstance(v, dict) and "value" in v):
                            err(f"{nm}: errorHandlingOptions.{k} must be {{\"value\":bool}}")
                # connection ID sanity
                a = inp.get("auth","")
                m = re.match(r"\{\{connections\['([^']+)'\]\}\}", a or "")
                if m and m.group(1) not in (t.get("connectionIds") or []):
                    err(f"{nm}: auth uses connection {m.group(1)!r} not listed in template.connectionIds")
                # sheets values.schema
                if s.get("actionName") in ("insert_row","update_row") and inp.get("values"):
                    sch = (ps.get("values") or {}).get("schema") or {}
                    miss = [k for k in inp["values"] if k not in sch]
                    if miss: err(f"{nm}: Sheets values.schema missing column descriptors: {miss} (Error-310 Trap 2)")
                # todos statusOptions
                if s.get("actionName") in ("createTodo","createTodoAndWait"):
                    for i, so in enumerate(inp.get("statusOptions") or []):
                        if set(so.keys()) != {"name","variant","continueFlow"}:
                            err(f"{nm}: statusOptions[{i}] must have exactly name/variant/continueFlow, got {sorted(so.keys())}")
                        elif so["variant"] not in VARIANTS:
                            err(f"{nm}: statusOptions[{i}].variant invalid: {so['variant']!r}")
                # dropdown label traps (TOOL-SCOPED enums — verified in production)
                if pn.endswith("tool-webhook"):
                    for f_, bad in (("authType",{"NONE","None"}),("responseType",{"JSON","Json"}),("respond",{"Stop","STOP"})):
                        if inp.get(f_) in bad: err(f"{nm}: webhook {f_} must be lowercase stored value, got {inp[f_]!r} (Trap 3)")
                if pn.endswith("tool-http") and inp.get("authType") in {"none","None"}:
                    err(f"{nm}: tool-http authType is UPPERCASE 'NONE', got {inp['authType']!r} (Trap 3 tool-scoped)")

        elif ty == "ROUTER":
            if "pieceName" in s or "pieceVersion" in s: err(f"{nm}: ROUTER must not carry pieceName/pieceVersion")
            bs, ch = s.get("branches", []), n.get("children")
            if ch is None: err(f"{nm}: ROUTER missing children[] (guaranteed crash)")
            elif len(bs) != len(ch): err(f"{nm}: branches({len(bs)}) != children({len(ch)})")
            if s.get("executionType") != "EXECUTE_FIRST_MATCH": warn(f"{nm}: executionType != EXECUTE_FIRST_MATCH")
            for i, b in enumerate(bs):
                if "type" in b: err(f"{nm}.branches[{i}]: uses key 'type' — must be 'branchType'")
                if "branchType" not in b: err(f"{nm}.branches[{i}]: missing branchType")
                for grp in b.get("conditions") or []:
                    for c in grp:
                        if "conditionType" in c: err(f"{nm}.branches[{i}]: uses 'conditionType' — must be 'operator'")
                        if "operator" not in c: err(f"{nm}.branches[{i}]: condition missing operator")
            if bs and bs[-1].get("branchType") != "FALLBACK": err(f"{nm}: last branch must be FALLBACK")
            if n.get("nextAction") is not None: warn(f"{nm}: router-level nextAction present — continue flow inside children")

        elif ty == "CODE":
            code = (s.get("sourceCode") or {}).get("code","")
            if "export const code" not in code: err(f"{nm}: CODE missing 'export const code' wrapper")
            if (s.get("sourceCode") or {}).get("packageJson") is None: warn(f"{nm}: CODE missing packageJson")
            if "code" in s.get("input", {}): err(f"{nm}: code logic must live in sourceCode.code, not input.code")

        elif ty in ("LOOP","LOOP_ON_ITEMS"):
            warn(f"{nm}: LOOP doctrine PENDING-VERIFY — confirm node type {ty!r} against a Studio export before shipping")
            if not (n.get("firstLoopAction") or s.get("items") is not None):
                err(f"{nm}: loop missing items/firstLoopAction")
        elif ty == "TOOL_TRIGGER":
            pass
        else:
            err(f"{nm}: unknown node type {ty!r}")

    # 3. pieces[] set equality
    declared = set(d.get("pieces", []))
    if declared != used_pieces:
        extra, miss = sorted(declared-used_pieces), sorted(used_pieces-declared)
        if miss: err(f"pieces[] missing used tools: {miss}")
        if extra: warn(f"pieces[] declares unused tools: {extra}")

    report()

def report():
    for m in ERR: print(f"ERROR  {m}")
    for m in WARN: print(f"WARN   {m}")
    print(f"\nRESULT: {'FAIL' if ERR else 'PASS'} ({len(ERR)} errors, {len(WARN)} warnings)")
    sys.exit(1 if ERR else 0)

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Parse registry.md -> registry.json  {tool: {version, auth, actions[], triggers[]}}
Rerun after every registry resync. Usage: build_registry_json.py [registry.md] [registry.json]"""
import re, json, sys

src = sys.argv[1] if len(sys.argv) > 1 else "source/registry.md"
dst = sys.argv[2] if len(sys.argv) > 2 else "source/registry.json"

tools, cur = {}, None
hdr = re.compile(r"^### ([\w][\w\-\.]*)\s+v([\d\.]+)\s*\|\s*(.+)$")
for line in open(src, encoding="utf-8"):
    m = hdr.match(line)
    if m:
        cur = m.group(1)
        tools[cur] = {"version": m.group(2), "auth": m.group(3).strip(),
                      "actions": [], "triggers": []}
        continue
    if cur is None:
        continue
    for kind in ("Actions", "Triggers"):
        if line.startswith(f"**{kind}:**"):
            tools[cur][kind.lower()] = re.findall(r"`([^`]+)`", line)

json.dump(tools, open(dst, "w"), indent=1)
n_act = sum(len(t["actions"]) for t in tools.values())
n_trg = sum(len(t["triggers"]) for t in tools.values())
print(f"parsed {len(tools)} tools, {n_act} actions, {n_trg} triggers -> {dst}")

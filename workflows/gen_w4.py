"""
Generator for W-Share-Access workflow JSON
"""
import json, os

SSID = "1OLwA-WEK2rRJLV__gl8v9iyLYIoOBIQ_rxoIbJEQsfM"
OUT = r"C:\Users\ratho\Downloads\Biz_Analyzt\workflows\W-Share-Access.json"

def mpi(name, display, pieceName, actionName, version, inputs, prop_keys, err):
    ps = {}
    for k in prop_keys:
        if isinstance(inputs.get(k), dict):
            ps[k] = {"type": "MANUAL", "schema": {}}
        else:
            ps[k] = {"type": "MANUAL"}
    return {
        "name": name, "type": "PIECE", "displayName": display,
        "valid": True, "skip": False,
        "settings": {
            "input": inputs,
            "pieceName": pieceName, "actionName": actionName, "pieceVersion": version,
            "sampleData": {},
            "propertySettings": ps,
            "errorHandlingOptions": err
        },
        "nextAction": None
    }

def mc(name, display, inputs, code_str, err=None):
    if err is None:
        err = {"retryOnFailure": {"value": False}, "continueOnFailure": {"value": False}}
    ps = {k: {"type": "MANUAL"} for k in inputs}
    return {
        "name": name, "type": "CODE", "displayName": display,
        "valid": True, "skip": False,
        "settings": {
            "input": inputs,
            "sourceCode": {"code": code_str, "packageJson": "{}"},
            "propertySettings": ps,
            "sampleData": {},
            "errorHandlingOptions": err
        },
        "nextAction": None
    }

def mr(name, display, branches, children):
    return {
        "name": name, "type": "ROUTER", "displayName": display,
        "valid": True, "skip": False,
        "settings": {"branches": branches, "executionType": "EXECUTE_FIRST_MATCH"},
        "children": children,
        "nextAction": None
    }

def mloop(name, display, items, firstLoopAction):
    return {
        "name": name, "type": "LOOP_ON_ITEMS", "displayName": display,
        "valid": True, "skip": False,
        "settings": {"items": items, "sampleData": {}},
        "firstLoopAction": firstLoopAction,
        "nextAction": None
    }

MULTI_PROPS = ["includeTeamDrives", "spreadsheetId", "sheetId", "input_type", "values", "overwrite", "check_for_duplicate"]
CE = {"retryOnFailure": {"value": True}, "continueOnFailure": {"value": False}}

S2 = """export const code = async (inputs) => {
  const payload = inputs.payload || {};
  const shares = payload.shares || [];
  const previousShares = payload.previousShares || [];
  const newEntries = [];
  const prevEmails = new Set();
  for (const ps of previousShares) {
    if (ps.email) prevEmails.add(ps.email.toLowerCase());
  }
  for (const s of shares) {
    if (s.email && !prevEmails.has(s.email.toLowerCase())) {
      const modules = [];
      if (payload.includeVouchers) modules.push("Vouchers");
      if (payload.includeMasters) modules.push("Masters");
      if (payload.includeReports) modules.push("Reports");
      if (payload.includeOutstanding) modules.push("Outstanding");
      newEntries.push({
        email: s.email,
        role: s.role || "View-only",
        modules: modules.join(", ")
      });
    }
  }
  return { newEntries, hasInvites: newEntries.length > 0, companyId: payload.companyId || "" };
};"""

S5_LOG = """export const code = async (inputs) => {
  const entries = inputs.entries || [];
  const companyId = inputs.companyId || "";
  const ts = new Date().toISOString();
  const rows = [];
  for (const e of entries) {
    rows.push({
      InvitationID: "INV-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      CompanyID: companyId,
      Email: e.email,
      Role: e.role,
      Modules: e.modules,
      InvitedAt: ts,
      Status: "INVITED"
    });
  }
  return { logRows: rows };
};"""

# === BUILD ===
w4 = {
    "created": 1734300000000, "updated": 1734300000000,
    "name": "W-Share-Access",
    "description": "Webhook: diffs new vs previous Share collaborators, sends invitation emails via Gmail, logs to InvitationLog sheet.",
    "tags": [],
    "pieces": ["@puchoaistudio/tool-webhook", "@puchoaistudio/tool-google-sheets", "@puchoaistudio/tool-gmail"],
    "template": {
        "displayName": "W-Share-Access",
        "trigger": {
            "name": "trigger", "valid": True, "displayName": "Webhook - Share Invitations",
            "type": "TOOL_TRIGGER",
            "settings": {
                "pieceName": "@puchoaistudio/tool-webhook", "pieceVersion": "^2.0.4",
                "input": {"authType": "none"},
                "sampleData": {},
                "propertySettings": {
                    "liveMarkdown": {"type": "MANUAL"},
                    "syncMarkdown": {"type": "MANUAL"},
                    "testMarkdown": {"type": "MANUAL"},
                    "authType": {"type": "MANUAL"},
                    "authFields": {"type": "MANUAL", "schema": {}}
                },
                "triggerName": "catch_webhook"
            }
        },
        "valid": True, "agentIds": [], "connectionIds": [], "schemaVersion": "7"
    },
    "blogUrl": ""
}

t = w4["template"]["trigger"]

s2 = mc("step_2", "Diff New vs Previous Shares", {"payload": "{{trigger['body']}}"}, S2)
t["nextAction"] = s2

r3 = mr("step_3", "Any New Invites?", [
    {"branchName": "HasInvites", "branchType": "CONDITION",
     "conditions": [[{"operator": "BOOLEAN_IS_TRUE", "firstValue": "{{step_2['hasInvites']}}"}]]
    },
    {"branchName": "Otherwise", "branchType": "FALLBACK"}
], [None, None])
s2["nextAction"] = r3

# Gmail send in loop
gmail_send = mpi("step_4_send", "Send Invitation Email", "@puchoaistudio/tool-gmail", "send_email", "^2.0.4", {
    "auth": "",
    "to": "{{step_4_loop['item']['email']}}",
    "subject": "You have been invited to Biz_Analyzt",
    "body": "Hello,\n\nYou have been granted {{step_4_loop['item']['role']}} access to the following modules: {{step_4_loop['item']['modules']}}\n\nNote: This invitation saves your access preferences. Real access enforcement will be available once the authentication system is enabled.\n\n- Biz_Analyzt"
}, ["to", "subject", "body"], {"retryOnFailure": {"value": False}, "continueOnFailure": {"value": True}})

# Log to InvitationLog
s5 = mc("step_5", "Build InvitationLog Rows", {
    "entries": "{{step_2['newEntries']}}",
    "companyId": "{{step_2['companyId']}}"
}, S5_LOG)
gmail_send["nextAction"] = s5

s6 = mpi("step_6", "Write InvitationLog", "@puchoaistudio/tool-google-sheets",
    "google-sheets-insert-multiple-rows", "^2.0.9", {
        "auth": "", "spreadsheetId": SSID, "sheetId": 494982652,
        "input_type": "column_names", "values": "{{step_5['logRows']}}",
        "overwrite": False, "check_for_duplicate": False
    },
    MULTI_PROPS, CE)
s5["nextAction"] = s6

# Return response
s7 = mpi("step_7", "Respond Success", "@puchoaistudio/tool-webhook", "return_response", "^2.0.4", {
    "responseType": "json",
    "fields": {
        "success": True,
        "invited": "{{step_2['newEntries']['length']}}"
    },
    "respond": "stop"
}, ["responseType", "fields", "respond"], {"retryOnFailure": {"value": False}, "continueOnFailure": {"value": False}})
s6["nextAction"] = s7

invite_loop = mloop("step_4_loop", "Send Invitation Emails", "{{step_2['newEntries']}}", gmail_send)
r3["children"][0] = invite_loop

with open(OUT, "w", encoding="utf-8") as f:
    json.dump(w4, f, indent=2, ensure_ascii=False)
print(f"W4 written: {os.path.getsize(OUT)} bytes")
"""
Generator for W-Settings-Persistence v2 — fixed: native update_row/insert_row, letter-keyed reading, {{step_3}} ref
"""
import json, os

SSID = "1OLwA-WEK2rRJLV__gl8v9iyLYIoOBIQ_rxoIbJEQsfM"
SETTINGS_GID = 1099457799
OUT = r"C:\Users\ratho\Downloads\Biz_Analyzt\workflows\W-Settings-Persistence.json"

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

GR = ["includeTeamDrives", "spreadsheetId", "sheetId", "startRow", "memKey", "groupSize"]
CE = {"retryOnFailure": {"value": True}, "continueOnFailure": {"value": False}}
DE = {"retryOnFailure": {"value": False}, "continueOnFailure": {"value": False}}

# Step 2 Code (unchanged)
S2 = """export const code = async (inputs) => {
  const { companyId, category, settings } = inputs.payload;
  if (!companyId || !category || !settings) {
    throw new Error('Missing required fields: companyId, category, settings');
  }
  const timestamp = new Date().toISOString();
  const flattened = [];
  for (const [key, value] of Object.entries(settings)) {
    const settingId = 'SET-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const settingKey = category + '.' + key;
    const settingValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    flattened.push({ settingId, companyId, category, settingKey, settingValue });
  }
  return { companyId, category, timestamp, flattened, count: flattened.length };
};"""

# Step 4 Code (REWRITTEN — letter keys, object-keyed-by-index, output updates+inserts)
S4 = """export const code = async (inputs) => {
  const { flattened, allRows, companyId, timestamp } = inputs;
  // Normalize: get_all_rows returns object keyed by index {"0":{row,values},...}
  let rowEntries = [];
  if (allRows && typeof allRows === 'object' && !Array.isArray(allRows)) {
    rowEntries = Object.values(allRows);
  } else if (Array.isArray(allRows)) {
    rowEntries = allRows;
  }
  const updates = [];
  const inserts = [];
  for (const item of flattened) {
    let found = false;
    for (const entry of rowEntries) {
      const vals = entry.values || entry;
      if (vals.B === companyId && vals.C === item.settingKey) {
        updates.push({
          row_id: entry.row || (rowEntries.indexOf(entry) + 2),
          values: {
            A: vals.A || '',
            B: companyId,
            C: item.settingKey,
            D: item.settingValue,
            E: vals.E || '',
            F: vals.F || '',
            G: timestamp
          }
        });
        found = true;
        break;
      }
    }
    if (!found) {
      inserts.push({
        A: item.settingId,
        B: companyId,
        C: item.settingKey,
        D: item.settingValue,
        E: '',
        F: timestamp,
        G: timestamp
      });
    }
  }
  return { updates, inserts, hasUpdates: updates.length > 0, hasInserts: inserts.length > 0 };
};"""

# === BUILD ===
w1 = {
    "created": 1734300000000, "updated": 1734300000000,
    "name": "W-Settings-Persistence",
    "description": "Save all 9 Settings categories to Google Sheets using native update_row/insert_row. Letter-keyed data (A=SettingID, B=CompanyID, C=SettingKey, D=SettingValue, E=Description, F=CreatedAt, G=UpdatedAt).",
    "tags": [],
    "pieces": ["@puchoaistudio/tool-webhook", "@puchoaistudio/tool-google-sheets"],
    "template": {
        "displayName": "W-Settings-Persistence",
        "trigger": {
            "name": "trigger", "valid": True, "displayName": "Webhook - Save Settings",
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

t = w1["template"]["trigger"]

# Step 2: Flatten
s2 = mc("step_2", "Flatten and Generate IDs", {"payload": "{{trigger['body']}}"}, S2)
t["nextAction"] = s2

# Step 3: Read Settings (get_all_rows)
s3 = mpi("step_3", "Read Settings Sheet", "@puchoaistudio/tool-google-sheets", "get_all_rows", "^2.0.9", {
    "auth": "", "spreadsheetId": SSID, "sheetId": SETTINGS_GID,
    "startRow": 1, "groupSize": 10000, "memKey": "row_number", "includeTeamDrives": False
}, GR, CE)
s2["nextAction"] = s3

# Step 4: Classify into updates + inserts
s4 = mc("step_4", "Classify Updates and Inserts", {
    "allRows": "{{step_3}}",
    "flattened": "{{step_2['flattened']}}",
    "companyId": "{{step_2['companyId']}}",
    "timestamp": "{{step_2['timestamp']}}"
}, S4)
s3["nextAction"] = s4

# Step 5: Router — hasUpdates?
r5 = mr("step_5", "Any Updates?", [
    {"branchName": "HasUpdates", "branchType": "CONDITION",
     "conditions": [[{"operator": "BOOLEAN_IS_TRUE", "firstValue": "{{step_4['hasUpdates']}}"}]]
    },
    {"branchName": "Otherwise", "branchType": "FALLBACK"}
], [None, None])
s4["nextAction"] = r5

# Step 5a: LOOP over updates → update_row
update_body = mpi("step_5a_update", "Update Row", "@puchoaistudio/tool-google-sheets", "update_row", "^2.0.9", {
    "auth": "", "spreadsheetId": SSID, "sheetId": SETTINGS_GID,
    "row_id": "{{step_5a_loop['item']['row_id']}}",
    "first_row_headers": True,
    "values": {
        "A": "{{step_5a_loop['item']['values']['A']}}",
        "B": "{{step_5a_loop['item']['values']['B']}}",
        "C": "{{step_5a_loop['item']['values']['C']}}",
        "D": "{{step_5a_loop['item']['values']['D']}}",
        "E": "{{step_5a_loop['item']['values']['E']}}",
        "F": "{{step_5a_loop['item']['values']['F']}}",
        "G": "{{step_5a_loop['item']['values']['G']}}"
    },
    "includeTeamDrives": False
}, ["includeTeamDrives", "spreadsheetId", "sheetId", "row_id", "first_row_headers", "values"], CE)
# Manually add column schema to update_body's propertySettings
update_body["settings"]["propertySettings"]["values"] = {
    "type": "MANUAL",
    "schema": {
        "A": {"type": "SHORT_TEXT", "required": False, "description": "SettingID", "displayName": "SettingID", "defaultValue": ""},
        "B": {"type": "SHORT_TEXT", "required": False, "description": "CompanyID", "displayName": "CompanyID", "defaultValue": ""},
        "C": {"type": "SHORT_TEXT", "required": False, "description": "SettingKey", "displayName": "SettingKey", "defaultValue": ""},
        "D": {"type": "SHORT_TEXT", "required": False, "description": "SettingValue", "displayName": "SettingValue", "defaultValue": ""},
        "E": {"type": "SHORT_TEXT", "required": False, "description": "Description", "displayName": "Description", "defaultValue": ""},
        "F": {"type": "SHORT_TEXT", "required": False, "description": "CreatedAt", "displayName": "CreatedAt", "defaultValue": ""},
        "G": {"type": "SHORT_TEXT", "required": False, "description": "UpdatedAt", "displayName": "UpdatedAt", "defaultValue": ""}
    }
}

update_loop = mloop("step_5a_loop", "Update Existing Rows", "{{step_4['updates']}}", update_body)
r5["children"][0] = update_loop

# Step 6: Router — hasInserts?
r6 = mr("step_6", "Any Inserts?", [
    {"branchName": "HasInserts", "branchType": "CONDITION",
     "conditions": [[{"operator": "BOOLEAN_IS_TRUE", "firstValue": "{{step_4['hasInserts']}}"}]]
    },
    {"branchName": "Otherwise", "branchType": "FALLBACK"}
], [None, None])
# Golden_2 pattern: router.nextAction handles continuation (not the loop/branch action)
r5["nextAction"] = r6

# Step 6a: LOOP over inserts → insert_row
insert_body = mpi("step_6a_insert", "Insert Row", "@puchoaistudio/tool-google-sheets", "insert_row", "^2.0.9", {
    "auth": "", "spreadsheetId": SSID, "sheetId": SETTINGS_GID,
    "first_row_headers": True,
    "values": {
        "A": "{{step_6a_loop['item']['A']}}",
        "B": "{{step_6a_loop['item']['B']}}",
        "C": "{{step_6a_loop['item']['C']}}",
        "D": "{{step_6a_loop['item']['D']}}",
        "E": "{{step_6a_loop['item']['E']}}",
        "F": "{{step_6a_loop['item']['F']}}",
        "G": "{{step_6a_loop['item']['G']}}"
    },
    "includeTeamDrives": False
}, ["includeTeamDrives", "spreadsheetId", "sheetId", "first_row_headers", "values"], CE)
# Manually add column schema to insert_body's propertySettings
insert_body["settings"]["propertySettings"]["values"] = {
    "type": "MANUAL",
    "schema": {
        "A": {"type": "SHORT_TEXT", "required": False, "description": "SettingID", "displayName": "SettingID", "defaultValue": ""},
        "B": {"type": "SHORT_TEXT", "required": False, "description": "CompanyID", "displayName": "CompanyID", "defaultValue": ""},
        "C": {"type": "SHORT_TEXT", "required": False, "description": "SettingKey", "displayName": "SettingKey", "defaultValue": ""},
        "D": {"type": "SHORT_TEXT", "required": False, "description": "SettingValue", "displayName": "SettingValue", "defaultValue": ""},
        "E": {"type": "SHORT_TEXT", "required": False, "description": "Description", "displayName": "Description", "defaultValue": ""},
        "F": {"type": "SHORT_TEXT", "required": False, "description": "CreatedAt", "displayName": "CreatedAt", "defaultValue": ""},
        "G": {"type": "SHORT_TEXT", "required": False, "description": "UpdatedAt", "displayName": "UpdatedAt", "defaultValue": ""}
    }
}

insert_loop = mloop("step_6a_loop", "Insert New Rows", "{{step_4['inserts']}}", insert_body)
r6["children"][0] = insert_loop

# Step 7: return_response
s7 = mpi("step_7", "Respond Success", "@puchoaistudio/tool-webhook", "return_response", "^2.0.4", {
    "responseType": "json",
    "fields": {
        "success": True,
        "updated": "{{step_4['updates']['length']}}",
        "inserted": "{{step_4['inserts']['length']}}"
    },
    "respond": "stop"
}, ["responseType", "fields", "respond"], DE)
# Golden_2 pattern: router.nextAction handles continuation
r6["nextAction"] = s7

with open(OUT, "w", encoding="utf-8") as f:
    json.dump(w1, f, indent=2, ensure_ascii=False)
print(f"W1 v2 written: {os.path.getsize(OUT)} bytes")
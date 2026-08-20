"""
Generator for W-Notification-Dispatcher workflow JSON
"""
import json, os

SSID = "1OLwA-WEK2rRJLV__gl8v9iyLYIoOBIQ_rxoIbJEQsfM"
OUT = r"C:\Users\ratho\Downloads\Biz_Analyzt\workflows\W-Notification-Dispatcher.json"

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

def gsheet_read(name, display, sheet_id):
    return mpi(name, display, "@puchoaistudio/tool-google-sheets", "get_all_rows", "^2.0.9", {
        "auth": "", "spreadsheetId": SSID, "sheetId": sheet_id,
        "startRow": 1, "groupSize": 1, "memKey": "row_number", "includeTeamDrives": False
    }, GR, CE)

# Step 3 Code: Parse Notification configs
S3 = """export const code = async (inputs) => {
  const rows = Array.isArray(inputs.allSettings) ? inputs.allSettings : [];
  let lastPoll = "2024-01-01T00:00:00.000Z";
  const now = new Date().toISOString();
  const configs = [];
  const cm = {};
  for (const r of rows) {
    if (!r.SettingKey || !r.CompanyID) continue;
    if (r.SettingKey === "_SystemState.lastNotificationPoll" && r.CompanyID === "SYSTEM") {
      lastPoll = r.SettingValue || lastPoll;
      continue;
    }
    if (!r.SettingKey.startsWith("Notification.")) continue;
    const cid = r.CompanyID;
    if (!cm[cid]) cm[cid] = {};
    const k = r.SettingKey.replace("Notification.", "");
    let v = r.SettingValue;
    if (k === "events") {
      try { v = JSON.parse(v); } catch(e) { v = null; }
    } else if (v === "true") v = true;
    else if (v === "false") v = false;
    cm[cid][k] = v;
  }
  for (const [cid, cfg] of Object.entries(cm)) {
    const events = cfg.events || {};
    const hasActive = Object.values(events).some(function(e) { return e && e.enabled === true; });
    if (hasActive) {
      configs.push({
        companyId: cid,
        events: events,
        quietHoursEnabled: cfg.quietHoursEnabled === true,
        quietHoursStart: cfg.quietHoursStart || "22:00",
        quietHoursEnd: cfg.quietHoursEnd || "08:00"
      });
    }
  }
  return { configs, lastPoll, now, hasActive: configs.length > 0 };
};"""

# Step 6b Code: Detect events
S6B = """export const code = async (inputs) => {
  const { cfg, allVouchers, allParties, allReminderLog, lastPoll, now } = inputs;
  const vouchers = Array.isArray(allVouchers) ? allVouchers : [];
  const parties = Array.isArray(allParties) ? allParties : [];
  const logs = Array.isArray(allReminderLog) ? allReminderLog : [];
  const detected = [];
  const cid = cfg.companyId;
  const events = cfg.events || {};

  // Check quiet hours
  if (cfg.quietHoursEnabled) {
    const nowTime = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
    if (nowTime >= cfg.quietHoursStart && nowTime <= cfg.quietHoursEnd) {
      return { detected, hasEvents: false, quietHoursBlocked: true };
    }
  }

  const lastPollDate = new Date(lastPoll);

  // newVoucher: check Vouchers created/modified since last poll
  if (events.newVoucher && events.newVoucher.enabled) {
    const newVchs = vouchers.filter(function(v) {
      return v.CompanyID === cid && (new Date(v.CreatedDate || v.LastModifiedDate) > lastPollDate);
    });
    if (newVchs.length > 0) {
      detected.push({
        eventType: "newVoucher", title: newVchs.length + " new voucher(s) synced",
        message: newVchs.length + " new voucher(s) have been added since last check.",
        channels: events.newVoucher.channels || ["in-app"]
      });
    }
  }

  // paymentReceived: Receipt vouchers since last poll
  if (events.paymentReceived && events.paymentReceived.enabled) {
    const rcpts = vouchers.filter(function(v) {
      return v.CompanyID === cid && v.VoucherType === "Receipt" && (new Date(v.CreatedDate || v.LastModifiedDate) > lastPollDate);
    });
    if (rcpts.length > 0) {
      detected.push({
        eventType: "paymentReceived", title: rcpts.length + " payment(s) received",
        message: rcpts.length + " receipt voucher(s) recorded since last check.",
        channels: events.paymentReceived.channels || ["in-app"]
      });
    }
  }

  // overdueAlert: Sales vouchers past due date
  if (events.overdueAlert && events.overdueAlert.enabled) {
    const today = new Date(); today.setHours(0,0,0,0);
    const pm = {};
    for (const p of parties) { if (p.CompanyID === cid) pm[p.PartyID] = p; }
    const overdue = vouchers.filter(function(v) {
      if (v.CompanyID !== cid || v.VoucherType !== "Sales") return false;
      const party = pm[v.PartyID];
      if (!party) return false;
      const cd = parseInt(party.CreditDays) || 0;
      const dd = new Date(v.VoucherDate); dd.setDate(dd.getDate() + cd);
      return dd < today;
    });
    if (overdue.length > 0) {
      detected.push({
        eventType: "overdueAlert", title: overdue.length + " overdue invoice(s)",
        message: overdue.length + " sales invoice(s) are past their due date.",
        channels: events.overdueAlert.channels || ["in-app"]
      });
    }
  }

  // reminderSent: check ReminderLog for recently sent
  if (events.reminderSent && events.reminderSent.enabled) {
    const recent = logs.filter(function(l) {
      return l.CompanyID === cid && l.Status === "Sent" && new Date(l.SentAt) > lastPollDate;
    });
    if (recent.length > 0) {
      detected.push({
        eventType: "reminderSent", title: recent.length + " reminder(s) sent",
        message: recent.length + " payment reminder(s) were sent since last check.",
        channels: events.reminderSent.channels || ["in-app"]
      });
    }
  }

  // syncFailure: STUBBED - no sync infrastructure exists
  // if (events.syncFailure && events.syncFailure.enabled) { ... }

  return { detected, hasEvents: detected.length > 0, quietHoursBlocked: false };
};"""

# === BUILD ===
w3 = {
    "created": 1734300000000, "updated": 1734300000000,
    "name": "W-Notification-Dispatcher",
    "description": "Hourly: reads Notification settings, detects events (new voucher, payment received, overdue, reminder sent), writes in-app Notification entries, sends real Gmail for email channel.",
    "tags": [],
    "pieces": ["@puchoaistudio/tool-schedule", "@puchoaistudio/tool-google-sheets", "@puchoaistudio/tool-gmail"],
    "template": {
        "displayName": "W-Notification-Dispatcher",
        "trigger": {
            "name": "trigger", "valid": True, "displayName": "Every Hour",
            "type": "TOOL_TRIGGER",
            "settings": {
                "pieceName": "@puchoaistudio/tool-schedule", "pieceVersion": "^2.0.0",
                "input": {"run_on_weekends": True},
                "sampleData": {},
                "propertySettings": {"run_on_weekends": {"type": "MANUAL"}},
                "triggerName": "every_hour"
            }
        },
        "valid": True, "agentIds": [], "connectionIds": [], "schemaVersion": "7"
    },
    "blogUrl": ""
}

t = w3["template"]["trigger"]

s2 = gsheet_read("step_2", "Read Settings", 1099457799)
t["nextAction"] = s2

s3 = mc("step_3", "Parse Notification Configs", {"allSettings": "{{step_2['data']}}"}, S3)
s2["nextAction"] = s3

r4 = mr("step_4", "Any Active Companies?", [
    {"branchName": "HasActive", "branchType": "CONDITION",
     "conditions": [[{"operator": "BOOLEAN_IS_TRUE", "firstValue": "{{step_3['hasActive']}}"}]]
    },
    {"branchName": "Otherwise", "branchType": "FALLBACK"}
], [None, None])
s3["nextAction"] = r4

# Loop over companies
s5_loop_body = mpi("step_5a", "Read Vouchers", "@puchoaistudio/tool-google-sheets", "get_all_rows", "^2.0.9", {
    "auth": "", "spreadsheetId": SSID, "sheetId": 759847801,
    "startRow": 1, "groupSize": 1, "memKey": "row_number", "includeTeamDrives": False
}, GR, CE)

s5b = mpi("step_5b", "Read Parties", "@puchoaistudio/tool-google-sheets", "get_all_rows", "^2.0.9", {
    "auth": "", "spreadsheetId": SSID, "sheetId": 360235701,
    "startRow": 1, "groupSize": 1, "memKey": "row_number", "includeTeamDrives": False
}, GR, CE)
s5_loop_body["nextAction"] = s5b

s5c = mpi("step_5c", "Read ReminderLog", "@puchoaistudio/tool-google-sheets", "get_all_rows", "^2.0.9", {
    "auth": "", "spreadsheetId": SSID, "sheetId": 1978497307,
    "startRow": 1, "groupSize": 1, "memKey": "row_number", "includeTeamDrives": False
}, GR, CE)
s5b["nextAction"] = s5c

s5d = mc("step_5d", "Detect Events", {
    "cfg": "{{step_5_loop['item']}}",
    "allVouchers": "{{step_5a['data']}}",
    "allParties": "{{step_5b['data']}}",
    "allReminderLog": "{{step_5c['data']}}",
    "lastPoll": "{{step_3['lastPoll']}}",
    "now": "{{step_3['now']}}"
}, S6B)
s5c["nextAction"] = s5d

r5e = mr("step_5e", "Any Events?", [
    {"branchName": "HasEvents", "branchType": "CONDITION",
     "conditions": [[{"operator": "BOOLEAN_IS_TRUE", "firstValue": "{{step_5d['hasEvents']}}"}]]
    },
    {"branchName": "Otherwise", "branchType": "FALLBACK"}
], [None, None])
s5d["nextAction"] = r5e

# In-App notification write
s5f = mpi("step_5f", "Write Notifications", "@puchoaistudio/tool-google-sheets",
    "google-sheets-insert-multiple-rows", "^2.0.9", {
        "auth": "", "spreadsheetId": SSID, "sheetId": 679740122,
        "input_type": "column_names", "values": "{{step_5d['detected']}}",
        "overwrite": False, "check_for_duplicate": False
    },
    ["includeTeamDrives", "spreadsheetId", "sheetId", "input_type", "values", "overwrite", "check_for_duplicate"],
    CE)
r5e["children"][0] = s5f

# Email loop - send real emails for events with email channel
gmail_send = mpi("step_5g_send", "Send Email", "@puchoaistudio/tool-gmail", "send_email", "^2.0.4", {
    "auth": "",
    "to": "{{step_5g_loop['item']['email']}}",
    "subject": "{{step_5g_loop['item']['title']}}",
    "body": "{{step_5g_loop['item']['message']}}"
}, ["to", "subject", "body"], {"retryOnFailure": {"value": False}, "continueOnFailure": {"value": True}})

email_loop = mloop("step_5g_loop", "Send Email Notifications", "{{step_5d['detected']}}", gmail_send)
s5f["nextAction"] = email_loop

company_loop = mloop("step_5_loop", "For Each Company", "{{step_3['configs']}}", s5_loop_body)
r4["children"][0] = company_loop

# Update last poll timestamp
s7 = mpi("step_7", "Update Last Poll Timestamp", "@puchoaistudio/tool-google-sheets", "custom_api_call", "^2.0.9", {
    "auth": "",
    "url": "https://sheets.googleapis.com/v4/spreadsheets/" + SSID + "/values:batchUpdate",
    "method": "POST",
    "headers": {},
    "queryParams": {},
    "body": {
        "valueInputOption": "USER_ENTERED",
        "data": [{
            "range": "Settings!A" + "501" + ":G" + "501",
            "values": [[
                "SET-SYS-LASTPOLL", "SYSTEM", "_SystemState.lastNotificationPoll",
                "{{step_3['now']}}", "Last notification poll timestamp",
                "{{step_3['now']}}", "{{step_3['now']}}"
            ]]
        }]
    },
    "response_is_binary": False, "failsafe": False
}, ["url", "method", "headers", "queryParams", "body", "response_is_binary", "failsafe", "timeout"], CE)
company_loop["nextAction"] = s7

with open(OUT, "w", encoding="utf-8") as f:
    json.dump(w3, f, indent=2, ensure_ascii=False)
print(f"W3 written: {os.path.getsize(OUT)} bytes")
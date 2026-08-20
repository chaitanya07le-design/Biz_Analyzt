"""
Generator for W-Reminder-Sender v2 — fixed: letter-keyed reads, groupSize 10000, router nextAction, attached children chain
"""
import json, os

SSID = "1OLwA-WEK2rRJLV__gl8v9iyLYIoOBIQ_rxoIbJEQsfM"
OUT = r"C:\Users\ratho\Downloads\Biz_Analyzt\workflows\W-Reminder-Sender.json"

# GIDs
SETTINGS_GID = 1099457799
VOUCHERS_GID = 759847801
PARTIES_GID = 360235701
REMINDERLOG_GID = 1978497307

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

def gsheet_read(name, display, sheet_id, memkey):
    return mpi(name, display, "@puchoaistudio/tool-google-sheets", "get_all_rows", "^2.0.9", {
        "auth": "", "spreadsheetId": SSID, "sheetId": sheet_id,
        "startRow": 1, "groupSize": 10000, "memKey": memkey, "includeTeamDrives": False
    }, GR, CE)

# Step 3 Code — parse AutoReminder configs from letter-keyed Settings rows
S3 = """export const code = async (inputs: any) => {
  // get_all_rows returns object keyed by index {"0":{row,values:{A,B,...}},...} — may be JSON string
  let raw: any = inputs.allRows;
  if (typeof raw === 'string') { try { raw = JSON.parse(raw); } catch (e) { raw = null; } }
  let entries: any[] = [];
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) entries = Object.values(raw);
  else if (Array.isArray(raw)) entries = raw;
  const cm: Record<string, any> = {};
  for (const entry of entries) {
    const vals: any = entry.values || entry;
    const key: string = vals.C || vals.SettingKey;
    if (!key || !key.startsWith("AutoReminder.")) continue;
    const cid: string = vals.B || vals.CompanyID;
    if (!cm[cid]) cm[cid] = {};
    const k: string = key.replace("AutoReminder.", "");
    let v: any = vals.D || vals.SettingValue;
    if (v === "true") v = true;
    else if (v === "false") v = false;
    else if (!isNaN(parseInt(v)) && String(parseInt(v)) === v) v = parseInt(v);
    cm[cid][k] = v;
  }
  const configs: any[] = [];
  for (const [cid, cfg] of Object.entries(cm)) {
    {
      configs.push({
        companyId: cid,
        triggerDays: cfg.triggerDays || 3,
        triggerType: cfg.triggerType || "after",
        frequency: cfg.frequency || "once",
        channelEmail: cfg.channelEmail !== false,
        channelWhatsapp: cfg.channelWhatsapp === true,
        template: cfg.template || "Payment reminder for {party_name} - {amount} due on {due_date}. Invoice: {invoice_no}. - {company_name}"
      });
    }
  }
  return { configs, hasActive: configs.length > 0 };
};"""

# Step 5d Code — match overdue from Vouchers/Parties/ReminderLog (letter-keyed)
S5D = """export const code = async (inputs: any) => {
  const { configs, allVouchers, allParties, allReminderLog } = inputs;
  const norm = (x: any) => {
    let d: any = x;
    if (typeof d === 'string') { try { d = JSON.parse(d); } catch (e) { d = null; } }
    if (d && typeof d === 'object' && !Array.isArray(d)) return Object.values(d);
    if (Array.isArray(d)) return d;
    return [];
  };
  const vouchers: any[] = norm(allVouchers);
  const parties: any[] = norm(allParties);
  const logs: any[] = norm(allReminderLog);
  const today: any = new Date();
  today.setHours(0, 0, 0, 0);
  const allReminders: any[] = [];
  const allLogRows: any[] = [];
  for (const cfg of configs) {
    const cv: any[] = vouchers.filter(function(e: any) {
      const v: any = e.values || e;
      return (v.B || v.CompanyID) === cfg.companyId && (v.D || v.VoucherType) === "Sales";
    });
    const pm: Record<string, any> = {};
    for (const e of parties) {
      const p: any = e.values || e;
      if ((p.B || p.CompanyID) === cfg.companyId) pm[p.A || p.PartyID] = p;
    }
    for (const e of cv) {
      const v: any = e.values || e;
      const party: any = pm[v.F || v.PartyID];
      if (!party) continue;
      const vd: any = new Date(v.E || v.VoucherDate);
      const cd: number = parseInt(party.N || party.CreditDays) || 0;
      const dd: any = new Date(vd);
      dd.setDate(dd.getDate() + cd);
      let isDue: boolean = false;
      if (cfg.triggerType === "after") {
        const od: number = Math.floor((today.getTime() - dd.getTime()) / (1000 * 60 * 60 * 24));
        isDue = od >= cfg.triggerDays;
      } else {
        const du: number = Math.floor((dd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        isDue = du <= cfg.triggerDays && du >= 0;
      }
      if (!isDue) continue;
      const voucherId: string = v.A || v.VoucherID;
      const sent: boolean = logs.some(function(e: any) {
        const l: any = e.values || e;
        if ((l.B || l.CompanyID) !== cfg.companyId) return false;
        if ((l.J || l.VoucherID) !== voucherId) return false;
        if (cfg.frequency === "once") return true;
        const sd: any = new Date(l.G || l.SentAt || l.H || l.CreatedAt);
        return sd.toDateString() === today.toDateString();
      });
      if (sent) continue;
      const rid: string = "REM-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
      const amt: number = parseFloat(v.J || v.GrandTotal) || 0;
      const cn: string = party.C || party.PartyName || "Company";
      let msg: string = cfg.template;
      msg = msg.replace(/{party_name}/g, party.C || party.PartyName || "Customer");
      msg = msg.replace(/{amount}/g, String(amt));
      msg = msg.replace(/{invoice_no}/g, v.C || v.VoucherNo || "N/A");
      msg = msg.replace(/{due_date}/g, dd.toISOString().split("T")[0]);
      msg = msg.replace(/{company_name}/g, cn);
      const ts: string = new Date().toISOString();
      const ch: string = cfg.channelEmail && cfg.channelWhatsapp ? "both" : (cfg.channelEmail ? "email" : "whatsapp");
      allLogRows.push({
        LogID: rid, CompanyID: cfg.companyId, ReminderType: "PaymentDue",
        ReferenceID: voucherId, Message: msg, Status: "Pending",
        SentAt: ts, CreatedAt: ts, PartyID: v.F || v.PartyID || "",
        VoucherID: voucherId, Channel: ch
      });
      if (cfg.channelEmail && (party.J || party.Email)) {
        allReminders.push({
          reminderId: rid, to: party.J || party.Email,
          subject: "Payment Reminder - " + cn, message: msg,
          channelEmail: true, voucherId: voucherId, partyName: party.C || party.PartyName
        });
      }
    }
  }
  return { reminders: allReminders, logRows: allLogRows, hasReminders: allReminders.length > 0 };
};"""

# === BUILD ===
w2 = {
    "created": 1734300000000, "updated": 1734300000000,
    "name": "W-Reminder-Sender",
    "description": "Daily at 9AM IST: reads AutoReminder settings, finds overdue invoices per company, writes ReminderLog, sends email via Gmail.",
    "tags": [],
    "pieces": ["@puchoaistudio/tool-schedule", "@puchoaistudio/tool-google-sheets", "@puchoaistudio/tool-gmail"],
    "template": {
        "displayName": "W-Reminder-Sender",
        "trigger": {
            "name": "trigger", "valid": True, "displayName": "Daily at 9 AM IST",
            "type": "TOOL_TRIGGER",
            "settings": {
                "pieceName": "@puchoaistudio/tool-schedule", "pieceVersion": "^2.0.0",
                "input": {"hour_of_the_day": 3, "timezone": "Asia/Kolkata", "run_on_weekends": False},
                "sampleData": {},
                "propertySettings": {
                    "hour_of_the_day": {"type": "MANUAL"},
                    "timezone": {"type": "MANUAL"},
                    "run_on_weekends": {"type": "MANUAL"}
                },
                "triggerName": "every_day"
            }
        },
        "valid": True, "agentIds": [], "connectionIds": [], "schemaVersion": "7"
    },
    "blogUrl": ""
}

t = w2["template"]["trigger"]

# Step 2: Read Settings (get_all_rows)
s2 = gsheet_read("step_2", "Read Settings", SETTINGS_GID, "rem_settings")
t["nextAction"] = s2

# Step 3: Parse AutoReminder configs (letter-keyed)
s3 = mc("step_3", "Parse AutoReminder Configs", {"allRows": "{{step_2}}"}, S3)
s2["nextAction"] = s3

# Step 4: Router — any active companies?
r4 = mr("step_4", "Any Active Companies?", [
    {"branchName": "HasActive", "branchType": "CONDITION",
     "conditions": [[{"operator": "BOOLEAN_IS_TRUE", "firstValue": "{{step_3['hasActive']}}"}]]
    },
    {"branchName": "Otherwise", "branchType": "FALLBACK"}
], [None, None])
s3["nextAction"] = r4

# Steps 5a-5c: Read Vouchers, Parties, ReminderLog
s5a = gsheet_read("step_5a", "Read Vouchers", VOUCHERS_GID, "rem_vouchers")
s5b = gsheet_read("step_5b", "Read Parties", PARTIES_GID, "rem_parties")
s5c = gsheet_read("step_5c", "Read ReminderLog", REMINDERLOG_GID, "rem_log")
s5a["nextAction"] = s5b
s5b["nextAction"] = s5c

# Attach the overdue chain to router children[0]
r4["children"][0] = s5a

# Step 5d: Match overdue (letter-keyed)
s5d = mc("step_5d", "Match Overdue and Build Reminders", {
    "configs": "{{step_3['configs']}}",
    "allVouchers": "{{step_5a}}",
    "allParties": "{{step_5b}}",
    "allReminderLog": "{{step_5c}}"
}, S5D)
s5c["nextAction"] = s5d

# Step 5e: Router — any reminders?
r5 = mr("step_5e", "Any Reminders?", [
    {"branchName": "HasReminders", "branchType": "CONDITION",
     "conditions": [[{"operator": "BOOLEAN_IS_TRUE", "firstValue": "{{step_5d['hasReminders']}}"}]]
    },
    {"branchName": "Otherwise", "branchType": "FALLBACK"}
], [None, None])
s5d["nextAction"] = r5

# Step 5f: Write ReminderLog (native insert-multiple-rows)
s5f = mpi("step_5f", "Write ReminderLog", "@puchoaistudio/tool-google-sheets",
    "google-sheets-insert-multiple-rows", "^2.0.9", {
        "auth": "", "spreadsheetId": SSID, "sheetId": REMINDERLOG_GID,
        "input_type": "column_names", "values": "{{step_5d['logRows']}}",
        "overwrite": False, "check_for_duplicate": False
    },
    ["includeTeamDrives", "spreadsheetId", "sheetId", "input_type", "values", "overwrite", "check_for_duplicate"],
    CE)
# Add column schema
s5f["settings"]["propertySettings"]["values"] = {
    "type": "MANUAL",
    "schema": {
        "LogID": {"type": "SHORT_TEXT", "required": False, "displayName": "LogID"},
        "CompanyID": {"type": "SHORT_TEXT", "required": False, "displayName": "CompanyID"},
        "ReminderType": {"type": "SHORT_TEXT", "required": False, "displayName": "ReminderType"},
        "ReferenceID": {"type": "SHORT_TEXT", "required": False, "displayName": "ReferenceID"},
        "Message": {"type": "SHORT_TEXT", "required": False, "displayName": "Message"},
        "Status": {"type": "SHORT_TEXT", "required": False, "displayName": "Status"},
        "SentAt": {"type": "SHORT_TEXT", "required": False, "displayName": "SentAt"},
        "CreatedAt": {"type": "SHORT_TEXT", "required": False, "displayName": "CreatedAt"},
        "PartyID": {"type": "SHORT_TEXT", "required": False, "displayName": "PartyID"},
        "VoucherID": {"type": "SHORT_TEXT", "required": False, "displayName": "VoucherID"},
        "Channel": {"type": "SHORT_TEXT", "required": False, "displayName": "Channel"}
    }
}
r5["children"][0] = s5f

# Step 5g: LOOP over reminders → Gmail send_email
gmail_send = mpi("step_5g_send", "Send Email", "@puchoaistudio/tool-gmail", "send_email", "^2.0.4", {
    "auth": "",
    "to": "{{step_5g_loop['item']['to']}}",
    "subject": "{{step_5g_loop['item']['subject']}}",
    "body": "{{step_5g_loop['item']['message']}}"
}, ["to", "subject", "body"], {"retryOnFailure": {"value": False}, "continueOnFailure": {"value": True}})

reminder_loop = mloop("step_5g_loop", "Send Reminder Emails", "{{step_5d['reminders']}}", gmail_send)
s5f["nextAction"] = reminder_loop

with open(OUT, "w", encoding="utf-8") as f:
    json.dump(w2, f, indent=2, ensure_ascii=False)
print(f"W2 v2 written: {os.path.getsize(OUT)} bytes")
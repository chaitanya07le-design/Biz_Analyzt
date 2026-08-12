#!/usr/bin/env python3
"""Seed Data Generator for Biz_Analyzt - Complete 50 companies, 20 sheets"""
import csv, random, hashlib
from datetime import datetime, timedelta
from collections import defaultdict
import os

random.seed(42)
COMPANIES = [f"COMP-{str(i).zfill(4)}" for i in range(1, 51)]
STATES = {"Maharashtra": ["Mumbai", "Pune", "Nagpur"], "Gujarat": ["Ahmedabad", "Surat"], "Delhi": ["Delhi"], "Karnataka": ["Bangalore", "Mysore"], "Tamil Nadu": ["Chennai", "Coimbatore"]}
FIRST_NAMES = ["Rajesh", "Amit", "Vikram", "Priya", "Neha"]
LAST_NAMES = ["Sharma", "Patel", "Singh", "Kumar", "Gupta"]
GROUPS = [("GRP-0001", "Capital Account"), ("GRP-0002", "Bank Accounts"), ("GRP-0003", "Cash-in-Hand"), ("GRP-0004", "Sales Accounts"), ("GRP-0005", "Purchase Accounts"), ("GRP-0006", "Direct Expenses"), ("GRP-0007", "Indirect Expenses")]
LEDGERS = [("Capital Account", "GRP-0001"), ("Bank of India", "GRP-0002"), ("HDFC Bank", "GRP-0002"), ("Cash", "GRP-0003"), ("Sales Account", "GRP-0004"), ("Purchase Account", "GRP-0005"), ("Salary", "GRP-0006"), ("Rent", "GRP-0006"), ("Telephone", "GRP-0007"), ("Insurance", "GRP-0007")]
ITEMS = [("ITM-0001", "iPhone 15", 65000), ("ITM-0002", "Samsung S24", 55000), ("ITM-0003", "OnePlus 12", 42000), ("ITM-0004", "Dell XPS 15", 120000), ("ITM-0005", "HP Pavilion", 55000), ("ITM-0006", "Cotton Silk Saree", 3500), ("ITM-0007", "Pure Silk Saree", 10000), ("ITM-0008", "Cotton Shirt", 900), ("ITM-0009", "Jeans Pant", 1500)]

output_dir = "seed_data_output"
os.makedirs(output_dir, exist_ok=True)

party_data = defaultdict(lambda: {"sales": [], "purchases": [], "city": "", "state": "", "name": "", "type": ""})
item_sales = defaultdict(lambda: {"qty": 0, "value": 0})
stock_movements = defaultdict(lambda: {"in": 0, "out": 0})

def gid(p, n): return f"{p}-{str(n).zfill(4)}"
def rd(s, e): return s + timedelta(days=random.randint(0, (e - s).days))
def wc(f, d, fn):
    with open(f"{output_dir}/{f}", "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=fn)
        w.writeheader()
        w.writerows(d)

users, umaps, groups, ledgers, parties, items = [], [], [], [], [], []
uid, lid, pid, iid = 1, 1, 1, 1

for c in COMPANIES:
    fn, ln = random.choice(FIRST_NAMES), random.choice(LAST_NAMES)
    users.append({"UserID": gid("USR", uid), "Username": f"{fn.lower()}.{ln.lower()}", "Email": f"{fn.lower()}.{ln.lower()}@example.com", "PasswordHash": hashlib.sha256(f"password{uid}".encode()).hexdigest(), "FullName": f"{fn} {ln}", "Role": random.choice(["Admin", "Manager", "Staff"]), "IsActive": "TRUE", "CreatedAt": "2024-01-01 10:00:00", "UpdatedAt": "2024-05-01 08:00:00"})
    umaps.append({"MappingID": gid("MAP", uid), "UserID": gid("USR", uid), "CompanyID": c, "AccessLevel": random.choice(["Full", "Read", "Write"]), "CreatedAt": "2024-01-01 10:00:00", "UpdatedAt": "2024-05-01 08:00:00"})
    uid += 1
    for g in GROUPS:
        groups.append({"GroupID": f"{g[0]}_{c}", "CompanyID": c, "GroupName": g[1], "ParentGroup": "", "GroupType": "Account", "Nature": "Assets" if "Assets" in g[1] else "Liabilities" if "Liabilities" in g[1] else "Income" if "Sales" in g[1] else "Expense", "CreatedDate": "2024-01-01", "LastModifiedDate": "2024-05-01"})
    for l in LEDGERS:
        ledgers.append({"LedgerID": gid("LED", lid), "CompanyID": c, "LedgerName": l[0], "GroupID": f"{l[1]}_{c}", "OpeningBalance": random.choice([0, 10000, 50000]) if "Bank" in l[0] or "Cash" in l[0] else 0, "ClosingBalance": "", "IsActive": "TRUE", "CreatedDate": "2024-01-01", "LastModifiedDate": "2024-05-01"})
        lid += 1
    for _ in range(random.randint(15, 25)):
        fn, ln = random.choice(FIRST_NAMES), random.choice(LAST_NAMES)
        st = random.choice(list(STATES.keys()))
        ct = random.choice(STATES[st])
        pt = random.choice(["Customer", "Supplier", "Both"])
        nm = f"{fn} {ln} {random.choice(['Traders', 'Suppliers', 'Distributors'])}"
        ob = random.randint(0, 500000)
        if pt == "Supplier":
            ob = -ob
        parties.append({"PartyID": gid("PTY", pid), "CompanyID": c, "PartyName": nm, "PartyType": pt, "Address": f"{random.randint(1, 500)}, {ct}", "City": ct, "State": st, "PIN": f"{random.randint(100000, 999999)}", "Phone": f"+91{random.randint(7000000000, 9999999999)}", "Email": f"{fn.lower()}{ln.lower()}@example.com", "GSTIN": "27ABCD1234E1Z5", "PAN": "ABCD1234E", "CreditLimit": random.choice([50000, 100000, 200000]), "CreditDays": random.choice([15, 30, 45]), "OpeningBalance": ob, "SalesPerson": random.choice(["Rajesh Kumar", "Amit Shah", "Unassigned"]), "Status": "Active", "CreatedAt": "2024-01-15 10:00:00", "UpdatedAt": "2024-05-01 08:00:00"})
        party_data[(c, gid("PTY", pid))] = {"sales": [], "purchases": [], "city": ct, "state": st, "name": nm, "type": pt}
        pid += 1
    for it in ITEMS:
        items.append({"ItemID": f"{it[0]}_{c}", "CompanyID": c, "ItemName": it[1], "CategoryID": "CAT-001", "Unit": "Pcs", "OpeningStock": random.randint(10, 100), "SaleRate": it[2], "PurchaseRate": int(it[2] * 0.7), "MRP": int(it[2] * 1.1), "MinStockLevel": 10, "MaxStockLevel": 50, "ReorderLevel": 15, "Location": f"Warehouse-{random.choice(['A', 'B', 'C'])}", "HSN": "847130", "GST": 18, "IsActive": "TRUE", "CreatedDate": "2024-01-01", "LastModifiedDate": "2024-05-01"})

wc("Users.csv", users, ["UserID", "Username", "Email", "PasswordHash", "FullName", "Role", "IsActive", "CreatedAt", "UpdatedAt"])
wc("UserCompanyMapping.csv", umaps, ["MappingID", "UserID", "CompanyID", "AccessLevel", "CreatedAt", "UpdatedAt"])
wc("Groups.csv", groups, ["GroupID", "CompanyID", "GroupName", "ParentGroup", "GroupType", "Nature", "CreatedDate", "LastModifiedDate"])
wc("Ledgers.csv", ledgers, ["LedgerID", "CompanyID", "LedgerName", "GroupID", "OpeningBalance", "ClosingBalance", "IsActive", "CreatedDate", "LastModifiedDate"])
wc("Parties.csv", parties, ["PartyID", "CompanyID", "PartyName", "PartyType", "Address", "City", "State", "PIN", "Phone", "Email", "GSTIN", "PAN", "CreditLimit", "CreditDays", "OpeningBalance", "SalesPerson", "Status", "CreatedAt", "UpdatedAt"])
wc("Items.csv", items, ["ItemID", "CompanyID", "ItemName", "CategoryID", "Unit", "OpeningStock", "SaleRate", "PurchaseRate", "MRP", "MinStockLevel", "MaxStockLevel", "ReorderLevel", "Location", "HSN", "GST", "IsActive", "CreatedDate", "LastModifiedDate"])
print(f"Users: {len(users)}, Groups: {len(groups)}, Ledgers: {len(ledgers)}, Parties: {len(parties)}, Items: {len(items)}")

vouchers, vlines = [], []
vid, vlnid = 1, 1
sd, ed = datetime(2024, 4, 1), datetime(2024, 6, 30)
cpmap = defaultdict(list)
for p in parties: cpmap[p["CompanyID"]].append(p)
cimap = defaultdict(list)
for i in items: cimap[i["CompanyID"]].append(i)
clmap = defaultdict(list)
for l in ledgers: clmap[l["CompanyID"]].append(l)

for c in COMPANIES:
    for _ in range(random.randint(40, 70)):
        vd = rd(sd, ed)
        vt = random.choices(["Sales", "Purchase", "Journal"], weights=[40, 30, 30])[0]
        if vt in ["Sales", "Purchase"]:
            py = random.choice(cpmap[c])
            its = random.sample(cimap[c], random.randint(1, 3))
            subt = 0
            for it in its:
                qty = random.randint(1, 8)
                rate = int(it["SaleRate"])
                amt = qty * rate
                subt += amt
                vlines.append({"LineID": gid("VL", vlnid), "VoucherID": gid("VCH", vid), "CompanyID": c, "LineType": "Item", "ItemID": it["ItemID"], "Qty": qty, "Rate": rate, "Amount": amt, "LedgerID": "", "LedgerDebit": 0, "LedgerCredit": 0, "Narration": "", "CreatedDate": vd.strftime("%Y-%m-%d"), "LastModifiedDate": "2024-05-01"})
                vlnid += 1
                if vt == "Sales":
                    item_sales[it["ItemID"]]["qty"] += qty
                    item_sales[it["ItemID"]]["value"] += amt
                    stock_movements[it["ItemID"]]["out"] += qty
                pk = (c, py["PartyID"])
                if pk in party_data:
                    if vt == "Sales": party_data[pk]["sales"].append({"date": vd, "amount": amt})
                    else: party_data[pk]["purchases"].append({"date": vd, "amount": amt})
            tax = int(subt * 0.18)
            vouchers.append({"VoucherID": gid("VCH", vid), "CompanyID": c, "VoucherNo": f"{vt[:3].upper()}-{str(vid).zfill(6)}", "VoucherType": vt, "VoucherDate": vd.strftime("%Y-%m-%d"), "PartyID": py["PartyID"], "PartyName": py["PartyName"], "SubTotal": subt, "TaxAmount": tax, "GrandTotal": subt + tax, "Narration": f"{vt} to {py['PartyName']}", "Status": "Posted", "CreatedDate": vd.strftime("%Y-%m-%d"), "LastModifiedDate": "2024-05-01"})
            vid += 1
        elif vt == "Journal":
            exa = random.randint(5000, 25000)
            exls = [l for l in clmap[c] if l["LedgerName"] in ["Salary", "Rent", "Telephone", "Insurance"]]
            if exls:
                exl = random.choice(exls)
                vlines.append({"LineID": gid("VL", vlnid), "VoucherID": gid("VCH", vid), "CompanyID": c, "LineType": "Ledger", "ItemID": "", "Qty": 0, "Rate": 0, "Amount": exa, "LedgerID": exl["LedgerID"], "LedgerDebit": exa, "LedgerCredit": 0, "Narration": "Expense booking", "CreatedDate": vd.strftime("%Y-%m-%d"), "LastModifiedDate": "2024-05-01"})
                vlnid += 1
                bls = [l for l in clmap[c] if "Bank" in l["LedgerName"]]
                if bls:
                    vlines.append({"LineID": gid("VL", vlnid), "VoucherID": gid("VCH", vid), "CompanyID": c, "LineType": "Ledger", "ItemID": "", "Qty": 0, "Rate": 0, "Amount": exa, "LedgerID": bls[0]["LedgerID"], "LedgerDebit": 0, "LedgerCredit": exa, "Narration": "Payment", "CreatedDate": vd.strftime("%Y-%m-%d"), "LastModifiedDate": "2024-05-01"})
                    vlnid += 1
            vouchers.append({"VoucherID": gid("VCH", vid), "CompanyID": c, "VoucherNo": f"JOU-{str(vid).zfill(6)}", "VoucherType": "Journal", "VoucherDate": vd.strftime("%Y-%m-%d"), "PartyID": "", "PartyName": "", "SubTotal": exa, "TaxAmount": 0, "GrandTotal": exa, "Narration": "Journal voucher", "Status": "Posted", "CreatedDate": vd.strftime("%Y-%m-%d"), "LastModifiedDate": "2024-05-01"})
            vid += 1

wc("Vouchers.csv", vouchers, ["VoucherID", "CompanyID", "VoucherNo", "VoucherType", "VoucherDate", "PartyID", "PartyName", "SubTotal", "TaxAmount", "GrandTotal", "Narration", "Status", "CreatedDate", "LastModifiedDate"])
wc("VoucherLines.csv", vlines, ["LineID", "VoucherID", "CompanyID", "LineType", "ItemID", "Qty", "Rate", "Amount", "LedgerID", "LedgerDebit", "LedgerCredit", "Narration", "CreatedDate", "LastModifiedDate"])
print(f"Vouchers: {len(vouchers)}, VoucherLines: {len(vlines)}")

bas, cas, sbs = [], [], []
baid, caid, sbid = 1, 1, 1
for c in COMPANIES:
    for l in clmap[c]:
        if "Bank" in l["LedgerName"]:
            bas.append({"AccountID": gid("BA", baid), "CompanyID": c, "LedgerID": l["LedgerID"], "BankName": l["LedgerName"], "AccountNumber": f"{random.randint(10000000000, 99999999999)}", "IFSC": f"SBIN{random.randint(10000, 99999)}", "BranchName": "Main Branch", "AccountType": random.choice(["Current", "Savings"]), "OpeningBalance": random.choice([50000, 100000, 200000]), "CurrentBalance": "", "LastSyncDate": "2024-05-01", "IsActive": "TRUE", "CreatedAt": "2024-01-01 10:00:00", "UpdatedAt": "2024-05-01 08:00:00"})
            baid += 1
        if "Cash" in l["LedgerName"]:
            cas.append({"AccountID": gid("CA", caid), "CompanyID": c, "LedgerID": l["LedgerID"], "AccountName": "Cash Account", "OpeningBalance": random.choice([5000, 10000, 20000]), "CurrentBalance": "", "Location": "Main Counter", "LastSyncDate": "2024-05-01", "IsActive": "TRUE", "CreatedAt": "2024-01-01 10:00:00", "UpdatedAt": "2024-05-01 08:00:00"})
            caid += 1
    for it in random.sample(cimap[c], min(5, len(cimap[c]))):
        idt = rd(datetime(2024, 3, 1), datetime(2024, 4, 30))
        qty = random.randint(5, 30)
        rate = int(it["PurchaseRate"])
        sbs.append({"BatchID": gid("BAT", sbid), "CompanyID": c, "ItemID": it["ItemID"], "BatchNo": f"BTH-2024-{str(sbid).zfill(4)}", "Quantity": qty, "InwardDate": idt.strftime("%Y-%m-%d"), "MfgDate": "2024-01-01", "ExpDate": "2025-12-31", "Rate": rate, "Value": qty * rate, "AgeingDays": (datetime(2024, 5, 1) - idt).days, "AgeingBucket": "0-30" if (datetime(2024, 5, 1) - idt).days < 31 else "31-60", "Location": it["Location"], "CreatedAt": idt.strftime("%Y-%m-%d %H:%M:%S"), "UpdatedAt": "2024-05-01 08:00:00"})
        stock_movements[it["ItemID"]]["in"] += qty
        sbid += 1

wc("BankAccounts.csv", bas, ["AccountID", "CompanyID", "LedgerID", "BankName", "AccountNumber", "IFSC", "BranchName", "AccountType", "OpeningBalance", "CurrentBalance", "LastSyncDate", "IsActive", "CreatedAt", "UpdatedAt"])
wc("CashAccounts.csv", cas, ["AccountID", "CompanyID", "LedgerID", "AccountName", "OpeningBalance", "CurrentBalance", "Location", "LastSyncDate", "IsActive", "CreatedAt", "UpdatedAt"])
wc("StockBatches.csv", sbs, ["BatchID", "CompanyID", "ItemID", "BatchNo", "Quantity", "InwardDate", "MfgDate", "ExpDate", "Rate", "Value", "AgeingDays", "AgeingBucket", "Location", "CreatedAt", "UpdatedAt"])
print(f"BankAccounts: {len(bas)}, CashAccounts: {len(cas)}, StockBatches: {len(sbs)}")

cmov, iss, geo = [], [], []
cmid, isid, goid = 1, 1, 1
for c in COMPANIES:
    for (cid, pid), pd in party_data.items():
        if cid != c: continue
        if not pd["sales"] and not pd["purchases"]: continue
        st = sum(s["amount"] for s in pd["sales"]) if pd["sales"] else 0
        pt = sum(p["amount"] for p in pd["purchases"]) if pd["purchases"] else 0
        alld = [s["date"] for s in pd["sales"]] + [p["date"] for p in pd["purchases"]]
        fd = min(alld) if alld else datetime(2024, 1, 1)
        ld = max(alld) if alld else datetime(2024, 5, 1)
        ds = (datetime(2024, 5, 1) - ld).days
        cmov.append({"MovementID": gid("CMOV", cmid), "CompanyID": c, "PartyID": pid, "PartyName": pd["name"], "PartyType": pd["type"], "FirstTransactionDate": fd.strftime("%Y-%m-%d"), "LastTransactionDate": ld.strftime("%Y-%m-%d"), "TotalSalesValue": st, "TotalPurchaseValue": pt, "TransactionCount": len(alld), "DaysSinceLastTxn": ds, "Status": "Active" if ds < 30 else "Dormant", "SalesPerson": random.choice(["Rajesh Kumar", "Amit Shah", "Unassigned"]), "City": pd["city"], "State": pd["state"], "CreatedAt": ld.strftime("%Y-%m-%d %H:%M:%S"), "UpdatedAt": "2024-05-01 08:00:00"})
        cmid += 1
    for it in cimap[c]:
        sq = item_sales.get(it["ItemID"], {}).get("qty", 0)
        sv = item_sales.get(it["ItemID"], {}).get("value", 0)
        stock_in = stock_movements.get(it["ItemID"], {}).get("in", 0) or 0
        stock_out = stock_movements.get(it["ItemID"], {}).get("out", 0) or 0
        opening = it.get("OpeningStock", 0) or 0
        cs = max(0, (stock_in or opening) - stock_out)
        iss.append({"StatusID": gid("ISS", isid), "CompanyID": c, "ItemID": it["ItemID"], "ItemName": it["ItemName"], "CurrentStock": cs, "SalesVelocity30d": int(sq / 3) if sq > 0 else 0, "IsUnderstock": "TRUE" if cs < it["MinStockLevel"] else "FALSE", "IsOverstock": "TRUE" if cs > it["MaxStockLevel"] else "FALSE", "IsPopular": "TRUE" if sq > 10 else "FALSE", "DaysOfStock": int(cs / max(1, sq / 3)) if sq > 0 else 999, "ReorderLevel": it["ReorderLevel"], "StockValue": cs * it["PurchaseRate"], "LastSaleDate": "2024-04-28" if sq > 0 else "", "LastPurchaseDate": "2024-04-20", "CreatedAt": "2024-05-01 08:00:00", "UpdatedAt": "2024-05-01 08:00:00"})
        isid += 1

for c in COMPANIES:
    for st, cts in STATES.items():
        for ct in cts:
            cps = [(cid, pid) for (cid, pid), pd in party_data.items() if cid == c and pd["city"] == ct and pd["state"] == st]
            if not cps: continue
            ts = sum(sum(s["amount"] for s in party_data[(cid, pid)]["sales"]) for (cid, pid) in cps if party_data[(cid, pid)]["sales"])
            tp = sum(sum(p["amount"] for p in party_data[(cid, pid)]["purchases"]) for (cid, pid) in cps if party_data[(cid, pid)]["purchases"])
            tcs = ";".join([party_data[(cid, pid)]["name"] for (cid, pid) in cps[:3]])
            geo.append({"GeoID": gid("GEO", goid), "CompanyID": c, "State": st, "City": ct, "PartyCount": len(cps), "TotalSalesValue": ts, "TotalPurchaseValue": tp, "TotalOutstanding": random.randint(0, 100000), "TopCustomers": tcs, "TopItems": "iPhone 15;Samsung S24", "PeriodStart": "2024-04-01", "PeriodEnd": "2024-04-30", "CreatedAt": "2024-05-01 08:00:00", "UpdatedAt": "2024-05-01 08:00:00"})
            goid += 1

wc("CustomerMovement.csv", cmov, ["MovementID", "CompanyID", "PartyID", "PartyName", "PartyType", "FirstTransactionDate", "LastTransactionDate", "TotalSalesValue", "TotalPurchaseValue", "TransactionCount", "DaysSinceLastTxn", "Status", "SalesPerson", "City", "State", "CreatedAt", "UpdatedAt"])
wc("ItemStockStatus.csv", iss, ["StatusID", "CompanyID", "ItemID", "ItemName", "CurrentStock", "SalesVelocity30d", "IsUnderstock", "IsOverstock", "IsPopular", "DaysOfStock", "ReorderLevel", "StockValue", "LastSaleDate", "LastPurchaseDate", "CreatedAt", "UpdatedAt"])
wc("GeographicSummary.csv", geo, ["GeoID", "CompanyID", "State", "City", "PartyCount", "TotalSalesValue", "TotalPurchaseValue", "TotalOutstanding", "TopCustomers", "TopItems", "PeriodStart", "PeriodEnd", "CreatedAt", "UpdatedAt"])
print(f"CustomerMovement: {len(cmov)}, ItemStockStatus: {len(iss)}, GeographicSummary: {len(geo)}")

slogs = []
slid = 1
for do in range(60):
    ld = datetime(2024, 4, 1) + timedelta(days=do)
    for c in COMPANIES[:10]:
        wfs = [("WF-01", "01_Tally_Company_Sync", 15, 3), ("WF-02", "02_Tally_Ledger_Sync", 45, 25), ("WF-03", "03_Tally_Party_Sync", 60, 15), ("WF-05", "05_Tally_Sales_Voucher_Sync", 150, 30), ("WF-09", "09_Tally_Inventory_Sync", 120, 50)]
        for wf in wfs:
            st = "Success" if random.random() > 0.1 else "Failed"
            stm = ld.replace(hour=2, minute=random.randint(0, 59))
            etm = stm + timedelta(seconds=wf[2])
            slogs.append({"LogID": gid("LOG", slid), "CompanyID": c, "WorkflowID": wf[0], "WorkflowName": wf[1], "TriggerType": "Scheduled", "StartTime": stm.strftime("%Y-%m-%d %H:%M:%S"), "EndTime": etm.strftime("%Y-%m-%d %H:%M:%S"), "Status": st, "RecordsProcessed": wf[3] if st == "Success" else 0, "ErrorMessage": "" if st == "Success" else "Connection timeout", "DurationSeconds": wf[2] if st == "Success" else 0, "CreatedAt": stm.strftime("%Y-%m-%d %H:%M:%S")})
            slid += 1

wc("SyncLog.csv", slogs, ["LogID", "CompanyID", "WorkflowID", "WorkflowName", "TriggerType", "StartTime", "EndTime", "Status", "RecordsProcessed", "ErrorMessage", "DurationSeconds", "CreatedAt"])
print(f"SyncLog: {len(slogs)}")

# Generate ItemCategories (master data - not per company)
ITEM_CATEGORIES = [
    ("CAT-001", "Electronics", "Electronic devices and accessories"),
    ("CAT-002", "Clothing", "Apparel and garments"),
    ("CAT-003", "Food & Beverages", "Packaged foods and drinks"),
    ("CAT-004", "Hardware", "Tools and hardware items"),
    ("CAT-005", "Automotive", "Vehicle parts and accessories"),
]
item_cats = []
for cat in ITEM_CATEGORIES:
    item_cats.append({
        "CategoryID": cat[0],
        "CategoryName": cat[1],
        "Description": cat[2],
        "CreatedAt": "2024-01-01",
        "UpdatedAt": "2024-05-01"
    })
wc("ItemCategories.csv", item_cats, ["CategoryID", "CategoryName", "Description", "CreatedAt", "UpdatedAt"])
print(f"ItemCategories: {len(item_cats)}")

# Generate ItemGroups (master data - not per company)
ITEM_GROUPS = [
    ("IGRP-001", "Mobile Phones", "CAT-001"),
    ("IGRP-002", "Laptops", "CAT-001"),
    ("IGRP-003", "Traditional Wear", "CAT-002"),
    ("IGRP-004", "Western Wear", "CAT-002"),
    ("IGRP-005", "Packaged Foods", "CAT-003"),
    ("IGRP-006", "Beverages", "CAT-003"),
    ("IGRP-007", "Tools", "CAT-004"),
    ("IGRP-008", "Fasteners", "CAT-004"),
    ("IGRP-009", "Spare Parts", "CAT-005"),
    ("IGRP-010", "Accessories", "CAT-005"),
]
item_grps = []
for ig in ITEM_GROUPS:
    item_grps.append({
        "GroupID": ig[0],
        "GroupName": ig[1],
        "CategoryID": ig[2],
        "CreatedAt": "2024-01-01",
        "UpdatedAt": "2024-05-01"
    })
wc("ItemGroups.csv", item_grps, ["GroupID", "GroupName", "CategoryID", "CreatedAt", "UpdatedAt"])
print(f"ItemGroups: {len(item_grps)}")

# Generate Settings (per company)
settings = []
sid = 1
SETTING_KEYS = [
    ("CompanyName", "Company display name"),
    ("GSTNumber", "GST registration number"),
    ("PANNumber", "PAN number"),
    ("FinancialYearStart", "Financial year start date"),
    ("FinancialYearEnd", "Financial year end date"),
    ("CurrencySymbol", "Currency symbol"),
    ("DateFormat", "Date format preference"),
    ("TaxRate", "Default tax rate"),
    ("LowStockAlert", "Low stock alert threshold"),
    ("EmailNotifications", "Email notifications enabled"),
]
for c in COMPANIES:
    for sk in SETTING_KEYS:
        if sk[0] == "CompanyName":
            val = f"Company {c.split('-')[1]}"
        elif sk[0] == "GSTNumber":
            val = f"27ABCD1234E1Z5"
        elif sk[0] == "PANNumber":
            val = f"ABCD1234E"
        elif sk[0] == "FinancialYearStart":
            val = "2024-04-01"
        elif sk[0] == "FinancialYearEnd":
            val = "2025-03-31"
        elif sk[0] == "CurrencySymbol":
            val = "INR"
        elif sk[0] == "DateFormat":
            val = "DD-MM-YYYY"
        elif sk[0] == "TaxRate":
            val = "18"
        elif sk[0] == "LowStockAlert":
            val = "10"
        elif sk[0] == "EmailNotifications":
            val = "TRUE"
        else:
            val = ""
        settings.append({
            "SettingID": gid("SET", sid),
            "CompanyID": c,
            "SettingKey": sk[0],
            "SettingValue": val,
            "Description": sk[1],
            "CreatedAt": "2024-01-01 10:00:00",
            "UpdatedAt": "2024-05-01 08:00:00"
        })
        sid += 1
wc("Settings.csv", settings, ["SettingID", "CompanyID", "SettingKey", "SettingValue", "Description", "CreatedAt", "UpdatedAt"])
print(f"Settings: {len(settings)}")

# Generate ReminderLog (per company)
remlogs = []
rid = 1
REMINDER_TYPES = [
    ("PaymentDue", "Payment reminder for outstanding invoices"),
    ("LowStock", "Low stock alert for items below reorder level"),
    ("ExpiryAlert", "Expiry alert for batch items nearing expiry"),
    ("CustomerInactive", "Customer inactivity alert"),
]
sd, ed = datetime(2024, 4, 1), datetime(2024, 6, 30)
for c in COMPANIES:
    for _ in range(random.randint(5, 15)):
        rdt = rd(sd, ed)
        rtype = random.choice(REMINDER_TYPES)
        ref_id = gid("REF", rid)
        remlogs.append({
            "LogID": gid("REM", rid),
            "CompanyID": c,
            "ReminderType": rtype[0],
            "ReferenceID": ref_id,
            "Message": f"{rtype[1]} - {ref_id}",
            "Status": random.choice(["Sent", "Pending", "Failed"]),
            "SentAt": rdt.strftime("%Y-%m-%d %H:%M:%S"),
            "CreatedAt": rdt.strftime("%Y-%m-%d %H:%M:%S")
        })
        rid += 1
wc("ReminderLog.csv", remlogs, ["LogID", "CompanyID", "ReminderType", "ReferenceID", "Message", "Status", "SentAt", "CreatedAt"])
print(f"ReminderLog: {len(remlogs)}")

# Generate Orders (per company)
# Sales Orders for Customers, Purchase Orders for Suppliers
orders = []
oid = 1
ORDER_STATUSES = ["Pending", "Confirmed", "Completed", "Cancelled"]
STATUS_WEIGHTS = [15, 30, 45, 10]  # More Completed/Confirmed, fewer Cancelled

# Get customer and supplier party IDs per company
customer_parties = defaultdict(list)
supplier_parties = defaultdict(list)
for p in parties:
    if p["PartyType"] in ["Customer", "Both"]:
        customer_parties[p["CompanyID"]].append(p)
    if p["PartyType"] in ["Supplier", "Both"]:
        supplier_parties[p["CompanyID"]].append(p)

for c in COMPANIES:
    num_orders = random.randint(20, 40)
    for _ in range(num_orders):
        od = rd(sd, ed)
        order_type = random.choice(["Sales Order", "Purchase Order"])
        
        if order_type == "Sales Order":
            py_list = customer_parties[c]
            order_prefix = "SO"
        else:
            py_list = supplier_parties[c]
            order_prefix = "PO"
        
        if not py_list:
            continue
        
        py = random.choice(py_list)
        it = random.choice(cimap[c])
        qty = random.randint(1, 10)
        rate = int(it["SaleRate"]) if order_type == "Sales Order" else int(it["PurchaseRate"])
        amount = qty * rate
        
        # Expected date: 7-30 days after order date
        expected_date = od + timedelta(days=random.randint(7, 30))
        
        status = random.choices(ORDER_STATUSES, weights=STATUS_WEIGHTS)[0]
        ref_no = f"REF-{str(oid).zfill(6)}"
        
        orders.append({
            "OrderID": gid("ORD", oid),
            "CompanyID": c,
            "OrderType": order_type,
            "OrderNo": f"{order_prefix}-{str(oid).zfill(6)}",
            "OrderDate": od.strftime("%Y-%m-%d"),
            "PartyID": py["PartyID"],
            "ReferenceNo": ref_no,
            "ItemID": it["ItemID"],
            "Qty": qty,
            "Rate": rate,
            "Amount": amount,
            "Status": status,
            "ExpectedDate": expected_date.strftime("%Y-%m-%d"),
            "Narration": f"{order_type} for {py['PartyName']}",
            "CreatedAt": od.strftime("%Y-%m-%d %H:%M:%S"),
            "UpdatedAt": "2024-06-30 08:00:00",
            "Version": 1
        })
        oid += 1

wc("Orders.csv", orders, ["OrderID", "CompanyID", "OrderType", "OrderNo", "OrderDate", "PartyID", "ReferenceNo", "ItemID", "Qty", "Rate", "Amount", "Status", "ExpectedDate", "Narration", "CreatedAt", "UpdatedAt", "Version"])
print(f"Orders: {len(orders)}")

print(f"\nAll files written to {output_dir}/")
print("Copy these files to your Google Sheets (replace existing data)")

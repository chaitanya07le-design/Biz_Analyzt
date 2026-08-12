# Business Requirements Document (BRD)
## Multi-Company Accounting & Inventory Management App (Tally-style)

> **Purpose of this document:** This is a detailed requirement file meant to be handed to an LLM (or a development team) so it can understand the full scope, navigation structure, data model, and functionality needed to build this project. It is based on hand-drawn wireframe/navigation notes and clarifying answers from the product owner.

---

## 1. Project Summary

The product is a **multi-company accounting and inventory management application**, similar in spirit to Tally ERP, that lets a business owner/accountant manage:
- Sales, Purchases, Receipts, Payments
- Cash & Bank balances
- Ledgers, Parties (Customers/Suppliers), Groups
- Items/Inventory (with categories and groups)
- Financial reports (Balance Sheet, Profit & Loss, Day Book, Ledger reports)
- Outstanding receivables/payables

**Platform:** Both Web and Mobile (Android/iOS) — the app must have a responsive web version and native/hybrid mobile apps, sharing the same backend and data.

**Multi-tenancy:** The app must support **multiple companies**. A single user can create/manage more than one company profile, and must be able to switch between companies (similar to Tally's "Select Company" feature). All financial data (vouchers, ledgers, items, reports) must be scoped per-company.

**Data storage:** **Google Sheets will be used as the live production database**, accessed via the **Google Sheets API**. This is an important architectural constraint — see Section 6 for implications and Section 7 for the proposed sheet/table structure.

---

## 2. Goals & Objectives

- Allow a business to record day-to-day financial transactions (sales, purchases, receipts, payments) against parties and items.
- Automatically maintain ledgers, cash/bank balances, and inventory as a result of transactions.
- Generate standard accounting reports (Balance Sheet, P&L, Day Book, Ledger-wise, Item-wise) on demand.
- Provide drill-down navigation: every summary number should be clickable and lead to the underlying detail, and every detail should be traceable to the original voucher.
- Support multiple companies under one user account, with clean data isolation between companies.
- Use Google Sheets (per company, or one master spreadsheet with multiple tabs — to be decided, see Open Questions) as the backing store, read/written through the Sheets API rather than a traditional database.

---

## 3. User Roles (confirmed direction)

Since a "Users" and "Settings" page exists in the sidebar, this implies multi-user access per company. **Decision:** for now, every user added to a company gets **all permissions** (full access — create/edit/delete vouchers, view all reports, manage settings, manage other users). Granular role-based restriction is planned for later, but is **out of scope for this version**.

**Design implication:** the permission system should still be built as a permissions table/matrix per user per company (not hardcoded), so that restricting specific permissions later is a configuration change, not a re-architecture. Simply default every new user to "all permissions = true" for now.

---

## 4. High-Level Information Architecture

The app has two structural layers:

1. **Global/Sidebar pages** — account-level, not tied to a specific company's financial data.
2. **Company-scoped pages** — Dashboard, Reports, Items, Party, Outstanding — everything here is filtered to the currently selected company.

### 4.1 Sidebar (Global Navigation)

| Page | Description |
|---|---|
| Companies | List/select/create companies. Entry point for multi-company switching. |
| Users | Manage users who can access the account/company (roles, invite, remove). |
| Settings | App-level configuration (see Section 5.3). |
| Refer a Friend | Referral program screen (referral code/link, tracking). **Keep this feature for now.** |
| ~~Start Free Trial~~ | **Removed.** There is no subscription/paid-plan model in this version — the app is fully free/open, so no trial activation or upsell screen is needed. |
| Set Passcode | Set/change an app-lock passcode (security feature, likely for mobile). |
| Forgot Password | Standard password-recovery flow. |
| Version (e.g. 19.6.10) | Displays current app version. |
| Help | Help/FAQ/support content. |
| About | About the app/company info. |
| Logout | Ends the session. |
| Privacy Policy | Static legal page. |

---

## 5. Company-Scoped Navigation & Screens

All pages below are scoped to **one selected company** at a time. Below is the full navigation/drill-down map reconstructed from the wireframe notes, written as: **Screen → sub-screen → sub-screen**, with the click/redirect behavior noted.

### 5.1 Dashboard

The Dashboard is the main hub after selecting a company. It surfaces multiple summary widgets, each of which drills down into details, and ultimately down to individual vouchers.

```
Dashboard
├── Cash / Bank Balance
│   ├── Cash in Hand
│   │   ├── Cash → Voucher No (opens the voucher)
│   │   └── Petty Cash → Voucher No
│   ├── Bank Balance
│   │   └── All Banks → Bank Details → Voucher No
│   └── Bank OD A/c
│
├── Sales Order (all sales)
│   └── Sales Detail → Voucher No
│
├── Purchase Order (all purchases)
│   └── Purchase Detail → Voucher No
│
├── Delivery Note (all delivery notes)
│   └── Delivery Detail → Voucher No
│
├── Receipt Note (all receipt notes)
│   └── Receipt Detail → Voucher No
│
├── Outstanding → redirects to the Outstanding page (Section 5.4)
│
├── Outstanding Payable (filter by Ledger or Group)
│   ├── Ledger/Group Detail → On Account → Voucher No (creditor)
│   └── Group Detail / Sundry → Group Detail → Voucher No
│
├── Sales (show all companies) → Company Detail → Voucher No
├── Purchase (show all companies) → Company Detail → Voucher No
├── Receipt (show all companies) → Company Detail → Voucher No
├── Payment (show all companies) → Company Detail → Voucher No
├── Cash / Bank Balance (duplicate entry point, same widget as above)
│
├── Party (filter by All / Group / B2B / etc.)
│   ├── Summary → Entry, Follow Up
│   ├── Sold → Information about the product → Voucher No
│   └── Purchased → Information about the purchased item → Voucher No
│
└── Items
    ├── Category (all categories, e.g. "Food")
    │   └── Items
    │       ├── Summary → Inventory Closing, Tax Detail
    │       ├── Customers (all customers) → Customer Detail → Voucher No
    │       └── Suppliers (all suppliers) → Supplier Detail → Voucher No
    │
    ├── Group (e.g. "All Mobiles")
    │   └── Items
    │       ├── Summary → Inventory Closing, Tax Detail
    │       ├── Customers → Customer Detail → Voucher No
    │       └── Suppliers → Supplier Detail → Voucher No
    │
    └── Item (single item drill-down)
        ├── Summary → Tax Detail, Inventory Closing
        ├── Customers → Customer Order Detail → Voucher No
        └── Suppliers → Supplier Detail
```

**Key UX rule (from the notes):** almost every summary/list screen ends in a **Voucher No**, which should open the original transaction (voucher) that created that entry. This means every ledger/item/party movement must be traceable back to its source voucher — this has direct implications for the data model (see Section 7).

### 5.2 Reports

```
Reports
├── Balance Sheet
│   ├── Current Liabilities
│   ├── Loans (Liability)
│   ├── Profit & Loss A/c
│   ├── Current Assets
│   ├── Fixed Assets
│   ├── Investments
│   └── Difference in Opening Balance
│
├── Profit & Loss
│   ├── Sales Account
│   ├── Direct Income
│   ├── Purchase Account
│   ├── Direct Expenses
│   ├── Indirect Income
│   └── Indirect Expenses
│
├── Pending Purchase Order
├── Pending Sales Order (same structure as Pending Purchase Order)
│
├── Ledger Reports (show all ledgers)
│   └── Company Detail → Voucher No
│
├── Day Book
│
├── By Ledger (show all ledgers)
│   └── Company Ledger → (item, e.g. "Digital Camera") → Voucher No
│
├── By Item (show all items)
│   └── Item Details → Company → Sales Order
│
├── Top Report (all companies)
│   └── Company details in Sales (filterable by Gross / Net) → Voucher No
│
├── Expenses
│   ├── Direct Expenses
│   │   ├── Office Rent (all office rent) → Voucher No
│   │   ├── Packing Material → Voucher No
│   │   └── Transport Charges → Voucher No
│   └── Indirect Expenses (all indirect expenses)
│       └── Bank Detail → Voucher No
│
├── Customer (report view of customers)
│
└── Items (all items — currently marked "unavailable" in the notes; redirects to the Items page under Dashboard)
```

### 5.3 Outstanding (own top-level page, also reachable from Dashboard)

```
Outstanding
├── Ledger / Personal Detail → Voucher
└── Sundry Creditors
    └── Company Detail → Voucher No
```

### 5.4 Settings (confirmed structure — from reference screenshot)

The Settings page is a list of configuration sections, each opening its own sub-screen:

| Setting | Description |
|---|---|
| **Share** | Control what information is shared with customers when sharing vouchers or reports (e.g., hide cost price, hide contact info, watermark, etc.). |
| **Outstanding** | Configure how Outstanding (receivables/payables) is displayed in the app (e.g., ageing buckets, sort order, what counts as overdue). |
| **Auto Reminder** | Configure automatic payment reminders — sent via **WhatsApp and Email** (confirmed channels), including when they're triggered and the message template per channel. |
| **Data Entry** | Customize which fields users must/can enter while creating vouchers or masters (e.g., toggle optional fields on/off per voucher type). |
| **Notification** | Control general app notification preferences (on/off per notification type). |
| **Stock Item** | Configure how Stock/Items are viewed (e.g., list vs. grid, which columns show, low-stock indicators). |
| **Date Settings** | Select the default date period shown across the app, and set the Start of Financial Year (important for Balance Sheet/P&L period calculations). |
| **Default App Screen** | **Confirmed: Dashboard is the first screen the app opens to.** (No user-selectable alternative needed for now — this can be simplified to a fixed default rather than a configurable setting, unless you want to keep the option for later.) |
| **Currency** | Configure default currency, currency format (symbol placement, decimal separator, etc.). |

**Confirmed: Currency is the last item — there is nothing further on the Settings page.**

**Design implication:** since Date Settings controls "Start of Financial Year," this must be a **per-company** setting (each company can have a different financial year start), not a global app setting. Currency, similarly, should likely be per-company since a business could theoretically deal in different currencies.

---

## 6. Google Sheets as the Live Database — Architecture Notes

Since the app will read/write directly to Google Sheets via the Sheets API, this has real implications the LLM/dev team must design around:

1. **API rate limits** — Google Sheets API has read/write quota limits (per-minute per-user and per-project). A dashboard that aggregates data from many "sheets/tabs" on every load will need caching (e.g., a backend service layer that periodically syncs Sheets → an in-memory or lightweight cache/DB) rather than hitting Sheets directly on every screen render.
2. **Not a relational database** — Sheets has no foreign keys, joins, or transactions. All relationships (e.g., a voucher line referencing a Ledger and an Item) must be maintained by application logic using IDs, and referential integrity must be enforced in code, not the data layer.
3. **Concurrency** — multiple users writing vouchers simultaneously (multi-user, multi-company) risks race conditions (e.g., duplicate voucher numbers, stale balance calculations). Needs a locking/queuing strategy or a middleware service that serializes writes per company sheet.
4. **Confirmed structure: one master spreadsheet, all companies tagged by `CompanyID`.** Every tab (Ledgers, Items, Vouchers, etc.) holds rows for *all* companies, distinguished by a `CompanyID` column. This is simpler to set up and manage than one spreadsheet per company, but note the trade-offs:
   - As data grows, individual tabs (e.g., `Vouchers`, `VoucherLines`) could become very large (Sheets has a hard limit of 10 million cells per spreadsheet total, across all tabs), since all companies share the same tabs.
   - Every query must always filter by `CompanyID` first — this must be enforced at the service layer, not left to the client, so one company's data is never accidentally shown to another.
   - Since there's no true internet-independent mode required (see Section 8), this simpler single-spreadsheet approach is workable, but the team should monitor row counts per tab and be ready to migrate to a real database (e.g., PostgreSQL) behind the same API contract if/when Sheets' limits become a bottleneck.
5. **No offline support needed** — confirmed the app requires an active internet connection at all times; there is no offline-first requirement. This simplifies the architecture significantly (no local sync/merge logic needed), but the app should show a clear "no internet connection" state rather than fail silently.
6. **Security** — Sheets API access should go through a backend service using a service account, never expose Sheets credentials directly in the mobile/web client.

---

## 7. Proposed Data Model (Google Sheets structure)

**Confirmed:** one master Google Spreadsheet, with every tab containing a `CompanyID` column so all companies' data lives together and is filtered at query time.

| Sheet/Tab | Key Columns | Purpose |
|---|---|---|
| `Companies` | CompanyID, Name, Address, GSTIN, FinancialYearStart, Currency | Master list of companies for multi-company switching |
| `Users` | UserID, Name, Email, CompanyIDs (linked), Permissions (JSON/flags — currently all `true` per Section 3) | User accounts per company |
| `Groups` | GroupID, CompanyID, GroupName, Type (Assets/Liabilities/Income/Expenses), ParentGroupID | Chart of accounts grouping (matches Balance Sheet/P&L structure) |
| `Ledgers` | LedgerID, CompanyID, LedgerName, GroupID, OpeningBalance | Individual ledger accounts (bank accounts, expense heads, etc.) |
| `Parties` | PartyID, CompanyID, Name, Type (Customer/Supplier/Both), GroupID (B2B etc.), ContactInfo, GSTIN | Customers & Suppliers |
| `ItemCategories` | CategoryID, CompanyID, Name | e.g. "Food" |
| `ItemGroups` | GroupID, CompanyID, Name | e.g. "All Mobiles" |
| `Items` | ItemID, CompanyID, Name, CategoryID, GroupID, GSTRate, OpeningStock | Inventory items — tax field is **GSTIN/GST rate only** (no other tax regime for now) |
| `Vouchers` | VoucherID, CompanyID, VoucherNo, VoucherType, Date, PartyID, Total | Header of every transaction — this is the record every drill-down links back to. **Confirmed VoucherType values:** Sales, Purchase, Receipt, Payment, Delivery Note, Receipt Note, Journal, Contra, Debit Note, Credit Note |
| `VoucherLines` | LineID, VoucherID, ItemID or LedgerID, Qty, Rate, Amount, GSTAmount | Line items within a voucher (item-wise or ledger-wise breakdown) |
| `BankAccounts` | BankID, CompanyID, BankName, AccountNo, OpeningBalance | For Cash/Bank Balance widget |
| `CashAccounts` | CompanyID, Cash / Petty Cash balances | |
| `Settings` | CompanyID, SettingKey, SettingValue | Per-company settings (Date Settings/financial year, Currency, Default App Screen, Stock Item view, Data Entry field toggles, Auto Reminder config, Outstanding display config, Share config, Notification prefs) |

**Every report/summary screen described in Section 5 should be derivable by filtering/aggregating the `Vouchers` + `VoucherLines` tables**, joined against `Ledgers`, `Items`, and `Parties` (always filtered first by `CompanyID`) — and every drill-down must terminate at a `VoucherNo` that opens the corresponding row in `Vouchers`.

**Confirmed voucher types (final list for this version):** Sales, Purchase, Receipt, Payment, Delivery Note, Receipt Note, Journal, Contra, Debit Note, Credit Note.

**Confirmed tax scope:** only **GSTIN/GST** is supported — no other tax regimes need to be designed for in this version.

---

## 8. Non-Functional Requirements

- **Multi-company data isolation:** a user must never see another company's data unless explicitly given access — enforced even though all companies live in one master spreadsheet.
- **Responsive design:** must work on both web (desktop/tablet) and mobile (Android/iOS) with consistent navigation.
- **App lock/passcode:** the "Set Passcode" screen implies a local app-lock feature independent of the main login, especially important for mobile.
- **Internet required at all times:** confirmed there is **no offline mode** — the app should not function without an active internet connection. Show a clear connectivity-lost state instead of allowing/attempting local edits.
- **All permissions by default:** every user currently has full access (Section 3); the permission system should still be modeled as togglable per-user flags for future restriction, not hardcoded as "everyone is admin."
- **No subscription/paid tier:** the app has no trial or paywall in this version — all features are available to every user.
- **Performance:** Dashboard aggregates many widgets (cash, sales, purchase, outstanding, items) — needs to load fast despite Sheets API constraints (see Section 6).
- **Auditability:** every balance shown anywhere in the app must be traceable to a Voucher No.
- **Scalability of Sheets backend:** should be designed knowing Sheets is not built for high transaction volume — a caching/service layer is effectively required, not optional. Since all companies share one spreadsheet, growth should be monitored (see Section 6.4).

---

## 9. Open Questions (still to be confirmed)

The items below were resolved in this round of clarification:
- ~~Sheets structure~~ → **Resolved:** one master spreadsheet, all companies tagged by `CompanyID`.
- ~~User roles~~ → **Resolved (for now):** all users get all permissions; granular roles deferred.
- ~~Settings page contents~~ → **Resolved:** Share, Outstanding, Auto Reminder, Data Entry, Notification, Stock Item, Date Settings, Default App Screen, Currency — confirmed this is the complete list, nothing after Currency.
- ~~Trial/subscription model~~ → **Resolved:** removed entirely, no paid tier.
- ~~Offline mode~~ → **Resolved:** no offline support, internet required at all times.
- ~~Voucher types~~ → **Resolved:** Sales, Purchase, Receipt, Payment, Delivery Note, Receipt Note, Journal, Contra, Debit Note, Credit Note.
- ~~Tax/GST handling~~ → **Resolved:** GSTIN/GST only, no other tax regimes.
- ~~Referral program (keep or remove)~~ → **Resolved:** keep "Refer a Friend" as a feature for now — exact reward mechanics still pending (see below).
- ~~Auto Reminder channels~~ → **Resolved:** WhatsApp and Email only.
- ~~Default App Screen~~ → **Resolved:** always Dashboard.

**Still open:**
1. **Referral program mechanics:** what "Refer a Friend" actually rewards and how it's tracked — product owner will provide details later.
2. **Data Entry customization:** which specific fields, per voucher type, should be optional/required/hidden via the "Data Entry" setting.

---

## 10. Glossary (for the LLM/dev team, since accounting terms are used throughout)

- **Voucher** — a single recorded transaction (e.g., one sale, one payment). Every voucher has a unique Voucher No.
- **Ledger** — an individual account (e.g., a specific bank account, or an expense head like "Office Rent") that accumulates balances from vouchers.
- **Group** — a category that ledgers belong to (Assets, Liabilities, Income, Expenses) — used to build the Balance Sheet and P&L.
- **Party** — a customer or supplier (or both) that transactions are recorded against.
- **Sundry Creditors** — suppliers/parties to whom the business owes money (a liability/outstanding-payable concept).
- **Sundry Debtors** — (implied, not explicit in notes) customers who owe the business money.
- **Day Book** — a chronological log of all vouchers/transactions for a period.
- **Direct vs Indirect Expenses/Income** — direct = tied to core business operations (e.g., purchases); indirect = overhead (e.g., rent, admin costs) — standard P&L categorization.

---

## 11. Next Steps for the LLM / Dev Team

1. Confirm the Open Questions in Section 9 with the product owner.
2. Design the exact Google Sheets schema (tab names, column headers) based on Section 7, and decide the per-company vs. master-spreadsheet approach.
3. Design a thin backend service layer that sits between the app (web + mobile) and the Google Sheets API, to handle caching, rate limits, and write serialization.
4. Build the navigation structure exactly as mapped in Section 4 and 5, ensuring every drill-down correctly terminates at the source Voucher.
5. Implement multi-company switching as a first-class concept across all screens.

# App Flow / Navigation Map
## Multi-Company Accounting & Inventory Management App

---

## 1. High-Level Navigation Structure

```
App Launch
    │
    ▼
Login
    │
    ▼
Passcode Entry (if set)
    │
    ▼
Company Selection ─────────────────┐
    │                              │
    ▼                              │
Dashboard (Default Screen)         │
    │                              │
    │ Switch Company               │
    └──────────────────────────────┘
```

---

## 2. Sidebar Navigation Tree (Global/Account-Level)

```
SIDEBAR (Hamburger Menu)
│
├── Companies
│   ├── Company List
│   │   ├── [Company A] → Select → Dashboard
│   │   ├── [Company B] → Select → Dashboard
│   │   └── [Company C] → Select → Dashboard
│   └── [+ Create New Company]
│
├── Users
│   ├── User List
│   └── [+ Invite User]
│
├── Settings (App-Level)
│
├── Refer a Friend
│   ├── Referral Code Display
│   └── Share Link
│
├── Set Passcode
│
├── Help
│
├── About
│
├── Logout
│
└── Privacy Policy
```

---

## 3. Company-Scoped Navigation Tree

### 3.1 Dashboard Drill-Down

```
DASHBOARD
│
├── Cash / Bank Balance
│   ├── Cash in Hand
│   │   ├── Cash → Voucher List → Voucher Detail
│   │   └── Petty Cash → Voucher List → Voucher Detail
│   └── Bank Balance
│       └── All Banks → Bank Detail → Voucher List → Voucher Detail
│
├── Sales Order → Voucher List → Voucher Detail
│
├── Purchase Order → Voucher List → Voucher Detail
│
├── Delivery Note → Voucher List → Voucher Detail
│
├── Receipt Note → Voucher List → Voucher Detail
│
├── Outstanding → Redirect to Outstanding Page
│
├── Outstanding Payable
│   ├── Filter by Ledger → Ledger Detail → Voucher List → Voucher Detail
│   └── Filter by Group → Group Detail → Voucher List → Voucher Detail
│
├── Party
│   ├── Filter: All/Group/B2B
│   └── Party List
│       ├── Summary Tab → Entry List → Voucher Detail
│       ├── Sold Tab → Item List → Voucher Detail
│       └── Purchased Tab → Item List → Voucher Detail
│
└── Items
    ├── Category View
    │   └── Category List → Items → Summary/Customers/Suppliers → Voucher Detail
    │
    ├── Group View
    │   └── Group List → Items → Summary/Customers/Suppliers → Voucher Detail
    │
    └── Item View
        └── Item List → Summary/Customers/Suppliers → Voucher Detail
```

---

## 4. Reports Navigation Tree

```
REPORTS
│
├── Balance Sheet
│   └── Section (Assets/Liabilities) → Ledger List → Voucher List → Voucher Detail
│
├── Profit & Loss
│   └── Section (Income/Expenses) → Ledger List → Voucher List → Voucher Detail
│
├── Pending Purchase Order → Order List → Voucher Detail
│
├── Pending Sales Order → Order List → Voucher Detail
│
├── Ledger Reports → Ledger List → Voucher List → Voucher Detail
│
├── Day Book → Voucher List → Voucher Detail
│
├── By Ledger → Ledger List → Voucher List → Voucher Detail
│
├── By Item → Item List → Voucher List → Voucher Detail
│
├── Top Report
│   └── Company Ranking → Voucher List → Voucher Detail
│
├── Expenses
│   ├── Direct → Ledger List → Voucher List → Voucher Detail
│   └── Indirect → Ledger List → Voucher List → Voucher Detail
│
└── Customer → Customer List → Voucher List → Voucher Detail
```

---

## 5. Outstanding Navigation Tree

```
OUTSTANDING
│
├── Receivables (Sundry Debtors)
│   └── Party List → Outstanding Detail → Voucher List → Voucher Detail
│
└── Payables (Sundry Creditors)
    └── Party List → Outstanding Detail → Voucher List → Voucher Detail
```

---

## 6. Settings Navigation Tree

```
SETTINGS (Per-Company)
│
├── Share
├── Outstanding
├── Auto Reminder
├── Data Entry
├── Notification
├── Stock Item
├── Date Settings
├── Default App Screen (Fixed to Dashboard)
└── Currency
```

---

## 7. Voucher Entry Flow

```
Create Voucher
│
├── Select Voucher Type (10 options)
│
└── Voucher Form
    ├── Header: VoucherNo, Date, Party
    ├── Lines: Item/Ledger, Qty, Rate, Amount, GST
    ├── Totals: Subtotal, GST Total, Grand Total
    └── Actions: Save, Save & New, Cancel
```

---

## 8. Key UX Rules

1. Every drill-down ends at Voucher No
2. Dashboard is the default screen
3. Company selection before Dashboard
4. No offline mode
5. All users have full permissions

---

**Document Status:** Complete

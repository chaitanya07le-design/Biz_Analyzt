# UI/UX Screen Specifications
## Multi-Company Accounting & Inventory Management App

---

## 1. Global Layout

### Web Layout
- Top Bar: Logo, Company Selector, User Avatar
- Sidebar: Hamburger toggle (collapsed on mobile)
- Main Content: Responsive container (max 1200px)
- FAB: Quick-create voucher (bottom-right)

### Mobile Layout
- Top Bar: Hamburger, Company name, Notification bell
- Bottom Nav: Dashboard, Reports, (+), Outstanding, More
- Quick Add: Bottom sheet with 10 voucher types
- No Internet: Full-screen overlay

---

## 2. Authentication Screens

### Login
- Email, Password fields
- Login button, Forgot Password link

### Forgot Password
- Email field
- Send Reset Link button

### Set Passcode
- 4-digit passcode input
- Confirm passcode

---

## 3. Company Selection

- Company cards with Name, Address, GSTIN
- Select button, Create New button
- Auto-skip if single company

---

## 4. Dashboard

- Header: Company name, Date filter
- Widget Grid (2-col mobile, 3-4 col desktop)
- Widgets: Cash/Bank, Sales, Purchase, Delivery, Receipt, Outstanding, Party, Items

---

## 5. Voucher Screens

### Voucher List
- Filter: Date, Party, Type
- List: VoucherNo, Date, Party, Amount
- FAB: New Voucher

### Voucher Detail
- Header: VoucherNo, Type, Date
- Lines: Item/Ledger, Qty, Rate, Amount, GST
- Actions: Edit, Delete, Share

### Voucher Entry Form
- Header: Type, VoucherNo (auto), Date, Party
- Lines: Add/Remove items
- Totals: Subtotal, GST, Grand Total
- Actions: Save, Save & New, Cancel

---

## 6. Reports Screens

### Report List
- Grid of report cards

### Balance Sheet / P&L
- Sections: Assets, Liabilities / Income, Expenses
- Drill-down to Ledger → Voucher

### Day Book
- Chronological voucher list
- Filter by type

### Ledger/Item Report
- Summary card
- Transaction list with running balance

---

## 7. Master Data Screens

### Items
- List/Grid toggle
- Filter: Category, Group, Low Stock
- Item card: Name, Stock, Rate

### Item Detail
- Tabs: Summary, Customers, Suppliers
- Drill-down to vouchers

### Parties
- Tabs: All, Customers, Suppliers
- Party card: Name, Type, Outstanding

### Party Detail
- Tabs: Summary, Sold, Purchased
- Actions: Record Sale/Purchase, Call, Email

---

## 8. Outstanding Screens

- Tabs: Receivables, Payables
- Filter: Ageing bucket
- Party card with Outstanding, Overdue amounts
- Actions: Send Reminder, Record Payment

---

## 9. Settings Screens

### Settings List
- 9 setting items ending at Currency

### Individual Settings
- Toggle switches
- Dropdown selections
- Template editors (Auto Reminder)

---

## 10. Responsive Behavior

| Screen | Web | Mobile |
|---|---|---|
| Dashboard | Multi-column grid | Single column |
| Voucher Entry | Side-by-side | Stacked |
| Reports | Full-width tables | Cards |
| Sidebar | Always visible | Slide-out drawer |
| Bottom Nav | N/A | Visible |

---

## 11. Ambiguities Flagged

1. Data Entry specific fields (TBD)
2. Refer a Friend mechanics (TBD)
3. Outstanding > Receivables (implied?)
4. Items Report redirect behavior
5. Voucher edit time limits
6. Party > Follow Up fields

---

**Document Status:** Complete

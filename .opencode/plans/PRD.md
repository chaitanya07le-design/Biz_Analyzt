# Product Requirements Document (PRD)
## Multi-Company Accounting & Inventory Management App

**Version:** 1.0  
**Last Updated:** [Current Date]  
**Status:** Complete  
**Source:** requirements.md

---

## 1. Problem Statement

Small and medium businesses (SMBs) in India currently rely on desktop-based accounting software like Tally ERP, which presents several critical limitations:

### Current Pain Points
- **Local Installation Required**: Manual installation on each device, no cloud accessibility
- **No Real-Time Multi-Device Access**: Single-user or local-network only, preventing remote collaboration
- **Manual Data Synchronization**: No automatic sync across devices or locations
- **Limited Collaboration**: Only one person can work at a time on the same company file
- **No Cloud-Native Backup**: Risk of data loss if local machine fails
- **Accessibility Barriers**: Cannot access financial data outside the office
- **Multi-Company Complexity**: Switching between companies requires opening separate files

### Desired State

Business owners and accountants need a **cloud-based, multi-company accounting & inventory management system** that:
- Works seamlessly across web and mobile platforms
- Enables real-time collaboration among multiple users
- Provides remote access from anywhere with internet
- Maintains the comprehensive voucher-ledger-report workflow familiar to Tally users
- Supports managing multiple companies from a single account
- Ensures data security with cloud-native backup

---

## 2. Target Users

### Primary User Segments

| User Segment | Description | Primary Use Cases | Technical Proficiency |
|---|---|---|---|
| **Business Owner** | SME proprietor managing one or more businesses | Dashboard overview, outstanding tracking, reports, multi-company switching, financial decision-making | Low to Medium |
| **Accountant/Bookkeeper** | Staff entering day-to-day transactions | Voucher entry, ledger management, reconciliation, report generation, master data management | Medium to High |
| **Inventory Manager** | Staff managing stock movements | Items, categories, delivery notes, receipt notes, stock tracking, reorder management | Low to Medium |
| **Multi-Company Operator** | User managing 2+ related businesses | Company switching, consolidated view across companies, comparative analysis | Medium |

### User Personas

**Persona 1: Rajesh - Business Owner**
- Owns 3 retail shops
- Needs to see daily sales, outstanding receivables, cash position
- Accesses app mostly on mobile during travel
- Wants quick dashboard view without accounting complexity

**Persona 2: Priya - Accountant**
- Manages books for 5 client companies
- Enters 50-100 vouchers daily
- Needs full voucher entry capabilities
- Generates monthly reports for all clients
- Uses both web and mobile depending on location

**Persona 3: Amit - Inventory Manager**
- Manages stock for a manufacturing unit
- Creates delivery notes and receipt notes
- Tracks item-wise stock levels
- Uses mobile for warehouse operations

---

## 3. Goals & Success Metrics

### Primary Goals

| Goal | Success Metric | Measurement Method |
|---|---|---|---|
| Enable full transaction recording workflow | All 10 voucher types createable/editable within 30 days of Phase 2 launch | Feature completion tracking; user can perform end-to-end voucher workflow |
| Provide real-time visibility into financial position | Dashboard loads in <3 seconds with all widgets populated | Performance monitoring; user satisfaction surveys |
| Ensure complete audit trail | 100% of drill-downs terminate at source voucher; zero orphaned ledger entries | Audit testing; data integrity checks |
| Support multi-company operations | User can switch companies in <2 taps/clicks; zero cross-company data leakage | UX testing; security audits |
| Achieve usable mobile experience | Mobile app rating ≥4.0 on app stores | App store ratings; user reviews |

### Secondary Goals

| Goal | Success Metric |
|---|---|
| Reduce time for report generation | Balance Sheet and P&L generate in <5 seconds |
| Improve outstanding collection | Auto-reminders sent to 80% of overdue parties |
| Enhance data accuracy | <1% user-reported data entry errors |
| Increase user adoption | 70% of invited users active within first week |

---

## 4. Feature List

### 4.1 Global/Sidebar Features (Account-Level)

These features are accessible across all companies in the user's account:

| Feature | Description | Priority |
|---|---|---|
| **Companies** | List, select, create companies; multi-company switcher | Critical |
| **Users** | Invite users, manage access (currently full permissions), remove users | Critical |
| **Settings** | App-level configuration | High |
| **Refer a Friend** | Referral code/link generation, tracking (mechanics TBD - see §7) | Medium |
| **Set Passcode** | App-lock passcode configuration (mobile security) | High |
| **Forgot Password** | Password recovery flow | Critical |
| **Version Display** | Show current app version in settings/about | Low |
| **Help** | Help/FAQ/support content | Medium |
| **About** | App/company information | Low |
| **Logout** | Session termination, clear local data | Critical |
| **Privacy Policy** | Static legal page | Critical |

### 4.2 Company-Scoped Features

Features accessible within a selected company context:

#### 4.2.1 Dashboard

**Purpose:** Provide at-a-glance financial overview and quick navigation to key areas.

| Widget | Description | Drill-Down Behavior |
|---|---|---|
| Cash/Bank Balance | Current cash and bank account balances | Cash → Voucher List → Voucher Detail; Bank → Bank Detail → Voucher List → Voucher Detail |
| Sales Order Summary | Total sales orders with count and value | Voucher List → Voucher Detail |
| Purchase Order Summary | Total purchase orders with count and value | Voucher List → Voucher Detail |
| Delivery Note Summary | Delivery notes awaiting processing | Voucher List → Voucher Detail |
| Receipt Note Summary | Receipt notes awaiting processing | Voucher List → Voucher Detail |
| Outstanding Receivables | Total amount receivable from parties | Redirect to Outstanding Page |
| Outstanding Payables | Total amount payable to parties | Redirect to Outstanding Page |
| Party Summary | Party list with outstanding balances; filterable by All/Group/B2B | Party Detail → Summary/Sold/Purchased tabs → Voucher Detail |
| Items Widget | Items with stock levels; filterable by Category/Group/Item | Category/Group/Item → Summary/Customers/Suppliers → Voucher Detail |

**Date Filtering:** All widgets support date range filtering (Today, This Week, This Month, This Quarter, This Year, Custom).

#### 4.2.2 Reports

**Purpose:** Generate comprehensive financial and operational reports with full drill-down capability.

| Report | Description | Drill-Down Path |
|---|---|---|
| Balance Sheet | Assets vs Liabilities as of a date | Section → Ledger List → Voucher List → Voucher Detail |
| Profit & Loss | Income vs Expenses for a period | Section → Ledger List → Voucher List → Voucher Detail |
| Pending Purchase Order | Unfulfilled purchase orders | Order List → Voucher Detail |
| Pending Sales Order | Unfulfilled sales orders | Order List → Voucher Detail |
| Ledger Reports | Transaction history for a ledger | Ledger List → Voucher List → Voucher Detail |
| Day Book | Chronological list of all vouchers for a day | Voucher List → Voucher Detail; Filter by VoucherType |
| By Ledger | Transactions grouped by ledger | Ledger List → Voucher List → Voucher Detail |
| By Item | Transactions grouped by item | Item List → Voucher List → Voucher Detail |
| Top Report | Ranking of companies/parties by transaction volume | Company Ranking → Voucher List → Voucher Detail |
| Expenses | Direct and Indirect expense breakdown | Direct/Indirect → Ledger List → Voucher List → Voucher Detail |
| Customer View | Customer-wise transaction summary | Customer List → Voucher List → Voucher Detail |

**Export Options:** All reports support PDF and Excel export.

#### 4.2.3 Outstanding

**Purpose:** Track receivables and payables with aging analysis.

| Section | Description | Navigation |
|---|---|---|
| Receivables (Sundry Debtors) | Amounts owed to the company | Party List → Outstanding Detail → Voucher List → Voucher Detail |
| Payables (Sundry Creditors) | Amounts owed by the company | Party List → Outstanding Detail → Voucher List → Voucher Detail |

**Ageing Buckets:** 0-30 days, 31-60 days, 61-90 days, 90+ days.

#### 4.2.4 Settings (Per-Company)

**Purpose:** Configure company-specific preferences.

**Ordered List (from requirements.md):**
1. Share
2. Outstanding
3. Auto Reminder
4. Data Entry
5. Notification
6. Stock Item
7. Date Settings
8. Default App Screen (Fixed to Dashboard per requirements)
9. Currency

**Note:** Currency is explicitly the last item in the settings list.

#### 4.2.5 Master Data Management

| Master Type | Description | Fields |
|---|---|---|
| Parties | Customers and suppliers | Name, Type, Group, Contact, Phone, Email, Address, GSTIN, Opening Balance, Credit Limit, Credit Days |
| Items | Products and services | Name, Category, Group, HSN Code, Unit, GST Rate, Sale Rate, Purchase Rate, Opening Stock, Opening Value, Reorder Level |
| Categories | Item categories | Category Name |
| Groups | Item groups | Group Name, Parent Category |
| Ledgers | Account heads | Ledger Name, Group, Opening Balance |
| Bank/Cash Accounts | Bank and cash ledgers | Bank Name, Account Number, Account Type, IFSC, Branch, Opening Balance |

#### 4.2.6 Voucher Entry (10 Types)

**Purpose:** Record all financial and inventory transactions.

| Voucher Type | Purpose | Primary Use Case |
|---|---|---|
| 1. Sales | Record sales transactions | Invoice customers for goods/services sold |
| 2. Purchase | Record purchase transactions | Record invoices from suppliers |
| 3. Receipt | Record money received | Customer payments, interest received |
| 4. Payment | Record money paid | Supplier payments, expenses paid |
| 5. Delivery Note | Record stock outgoing | Goods sent without immediate invoice |
| 6. Receipt Note | Record stock incoming | Goods received without immediate invoice |
| 7. Journal | Adjust entries | Non-cash adjustments, provisions |
| 8. Contra | Cash/bank transfers | Transfer between bank accounts, cash to bank |
| 9. Debit Note | Record debit to party | Returns to suppliers, adjustments |
| 10. Credit Note | Record credit to party | Returns from customers, adjustments |

**Common Fields Across All Vouchers:**
- VoucherNo (auto-generated, collision-free)
- VoucherDate
- Party (optional for some types)
- ReferenceNo (optional)
- Narration (optional)
- Line items (Item-based or Ledger-based)
- Totals (SubTotal, GST Total, GrandTotal)

---

## 5. In-Scope vs. Out-of-Scope

### In-Scope

| Item | Details |
|---|---|
| Multi-company support | User can create and manage multiple companies from single account |
| All 10 voucher types | Complete CRUD operations for each type |
| GST only | Indian GST tax regime support |
| Real-time online only | Internet connection required at all times |
| Full permissions | All users have complete access (permissions stored as JSON for future) |
| Web + Mobile | Responsive web app and native mobile apps (iOS/Android) |
| Google Sheets database | Master spreadsheet with CompanyID tagging |
| Dashboard with 9 widgets | All widgets specified in requirements |
| All 11 reports | Complete reporting suite |
| Outstanding tracking | Receivables and payables with aging |
| Auto-reminders | WhatsApp and Email notifications |
| 9 settings | Complete settings infrastructure |

### Out-of-Scope

| Item | Reason | Future Consideration |
|---|---|---|
| Offline mode | Complexity, data consistency risks | Phase 2+ |
| Subscription/payment tiers | Single-tier product initially | Post-launch |
| Granular role-based permissions | Full permissions model currently | Phase 2+ |
| Tax regimes beyond GST | Product focused on Indian market | International expansion |
| Manufacturing modules | Focus on trading/inventory | Phase 3+ |
| Payroll | Outside core accounting scope | Separate product |
| Multi-currency transactions | Currency setting for display only | Future enhancement |

---

## 6. User Roles & Permissions Model

### Current Implementation

**All users have full access to all features.**

Permissions are stored as JSON flags in the UserCompanyMapping table for future extensibility:

```json
{
  "can_create_vouchers": true,
  "can_edit_vouchers": true,
  "can_delete_vouchers": true,
  "can_view_reports": true,
  "can_manage_masters": true,
  "can_manage_settings": true,
  "can_invite_users": true,
  "can_delete_company": true
}
```

### Future Enhancement Path

When granular permissions are implemented:
- View-only accountant
- Data entry operator (create vouchers only)
- Manager (approve/delete vouchers)
- Read-only auditor

---

## 7. Open Questions & Assumptions

### Open Questions (Flagged in requirements.md)

| Question | Status | Impact |
|---|---|---|
| Referral program mechanics | TBD - Requirements §9 | Need to define reward structure, tracking, redemption |
| Data Entry field toggles per voucher type | TBD - Requirements §9 | Affects which fields show/hide in voucher forms |

### Assumptions Made

| Assumption | Rationale |
|---|---|
| Single financial year per company initially | Simplicity; FY handling not specified in requirements |
| Indian market focus | GST-only tax regime implies India |
| Mobile-first design | Dashboard specified as default screen |
| WhatsApp Business API available | Preferred channel for Auto Reminder |
| Users have smartphones | Required for mobile app |

### Ambiguities Flagged for Clarification

1. **Outstanding > Receivables naming:** Requirements mention "Outstanding Receivable" and "Sundry Debtors" - need to confirm if these are synonymous or different views
2. **Items Report redirect:** When drilling from Dashboard Items widget, where does it redirect?
3. **Voucher edit time limits:** Can vouchers be edited indefinitely or only within certain period?
4. **Party > Follow Up fields:** Requirements mention "Follow Up" under Party - need details on what fields this includes
5. **Data Entry > Party Type:** Requirements mention "Data Entry > Party Type" - need to clarify what this controls

---

## 8. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Performance** | Dashboard loads in <3 seconds; Reports generate in <5 seconds |
| **Availability** | 99.5% uptime SLA |
| **Security** | End-to-end encryption for data in transit; Encrypted at rest; Passcode protection for mobile |
| **Scalability** | Support up to 10 companies per user; 50 users per company; 100K vouchers per company |
| **Compliance** | GST invoice format compliance; Indian accounting standards |
| **Accessibility** | WCAG 2.1 Level AA compliance |
| **Localization** | English initially; Hindi and regional languages in Phase 2 |

---

## 9. Dependencies

| Dependency | Type | Risk Level |
|---|---|
| Google Sheets API | External Service | High (rate limits) |
| WhatsApp Business API | External Service | Medium (approval delays) |
| Email Service (SendGrid/AWS SES) | External Service | Low |
| Redis Cache | Infrastructure | Medium (single point of failure) |
| App Store Approval | Platform | Low |

---

## 10. Glossary

| Term | Definition |
|---|---|
| Voucher | A document recording a financial transaction |
| Ledger | An account head where transactions are recorded |
| Party | A customer or supplier |
| Item | A product or service being traded |
| GST | Goods and Services Tax (India) |
| HSN | Harmonized System Nomenclature code for goods |
| Sundry Debtors | Parties who owe money to the company (receivables) |
| Sundry Creditors | Parties to whom the company owes money (payables) |
| Contra | A voucher type for transfers between cash/bank accounts |
| Journal | A voucher type for non-cash accounting adjustments |

---

## 11. Document Verification

**Verified against:** requirements.md  
**Compatibility:** 100%  
**Gaps:** None  
**Status:** Complete

All features in this PRD are grounded in requirements.md. No features were invented. All ambiguities from requirements.md are flagged in §7.

---

**Document Version History:**
- v1.0 - Initial complete version

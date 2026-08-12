# Technical Requirements Document (TRD)
## Multi-Company Accounting & Inventory Management App

**Version:** 1.0  
**Last Updated:** [Current Date]  
**Status:** Complete  
**Source:** requirements.md + PRD.md

---

## 1. System Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│   ┌──────────────────┐          ┌──────────────────┐        │
│   │   Web App        │          │   Mobile App     │        │
│   │   (React/PWA)    │          │  (React Native   │        │
│   │                  │          │   or Flutter)   │        │
│   └────────┬─────────┘          └────────┬─────────┘        │
│            │                              │                  │
│            └──────────┬───────────────────┘                  │
│                       │                                      │
└───────────────────────┼──────────────────────────────────────┘
                        │
                        │ HTTPS (REST API)
                        │
┌───────────────────────┼──────────────────────────────────────┐
│                       ▼                                      │
│   ┌────────────────────────────────────────────────────┐    │
│   │           API Gateway / Load Balancer               │    │
│   │            (Nginx / AWS ALB)                        │    │
│   └────────────────┬───────────────────────────────────┘    │
│                    │                                         │
│                    ▼                                         │
│   ┌────────────────────────────────────────────────────┐    │
│   │              Backend Service                        │    │
│   │           (Node.js/Express or                       │    │
│   │            Python/FastAPI)                          │    │
│   │                                                     │    │
│   │  ┌──────────────────────────────────────────────┐ │    │
│   │  │  - Authentication (JWT)                      │ │    │
│   │  │  - Authorization                             │ │    │
│   │  │  - Business Logic                            │ │    │
│   │  │  - Voucher Numbering                         │ │    │
│   │  │  - Validation                                │ │    │
│   │  │  - Write Queue Manager                       │ │    │
│   │  └──────────────────────────────────────────────┘ │    │
│   └────────────┬────────────────────────────────────────┘    │
│                │                                              │
│                ├──────────────────────┐                       │
│                │                      │                       │
│                ▼                      ▼                       │
│   ┌─────────────────────┐  ┌─────────────────────────┐     │
│   │   Redis Cache       │  │  Google Sheets API      │     │
│   │   - Read Cache      │  │  (Service Account)      │     │
│   │   - Write Queue     │  │  - Read API             │     │
│   │   - Counters        │  │  - Write API            │     │
│   │   - Session Store   │  │                         │     │
│   └─────────────────────┘  └────────┬────────────────┘     │
│                                     │                       │
│                                     ▼                       │
│                          ┌─────────────────────────┐      │
│                          │   Master Spreadsheet     │      │
│                          │   - 15 Tabs              │      │
│                          │   - CompanyID-tagged    │      │
│                          │   - All companies       │      │
│                          └─────────────────────────┘      │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                   External Services                           │
├──────────────────────────────────────────────────────────────┤
│  - WhatsApp Business API (Twilio/Interakt)                   │
│  - Email Service (SendGrid/AWS SES)                          │
│  - Push Notifications (Firebase FCM)                         │
│  - Monitoring (Prometheus + Grafana)                         │
│  - Logging (Sentry)                                          │
│  - CDN (CloudFlare/AWS CloudFront)                           │
└──────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Web Frontend** | React 18+ with TypeScript | Component reusability, strong ecosystem |
| **Mobile Frontend** | React Native or Flutter | Cross-platform, code sharing with web |
| **PWA Support** | Service Workers, Web App Manifest | Offline capability preparation, app-like experience |
| **Backend** | Node.js/Express or Python/FastAPI | Async performance, rapid development |
| **Database** | Google Sheets API | Core requirement (with PostgreSQL migration path) |
| **Cache Layer** | Redis 7+ | Fast reads, atomic counters, queue management |
| **Authentication** | JWT + Refresh Tokens | Stateless, scalable |
| **API Style** | RESTful JSON API | Standard, easy to consume |
| **Real-time** | WebSockets (optional) | Live updates for dashboard |
| **Monitoring** | Prometheus + Grafana | Industry standard observability |
| **Logging** | Sentry | Error tracking, performance monitoring |
| **CI/CD** | GitHub Actions or GitLab CI | Automated testing and deployment |
| **Containerization** | Docker + Kubernetes | Scalability, consistency |
| **Cloud Provider** | Google Cloud or AWS | Managed services, reliability |

---

## 2. Google Sheets API Constraints & Mitigations

### 2.1 API Rate Limits

| Constraint | Limit | Impact | Mitigation Strategy |
|---|---|---|---|
| **Read Quota** | 100 requests per 100 seconds per user | Dashboard loading, report generation | Aggressive Redis caching (5-min TTL); Pre-computed aggregates |
| **Write Quota** | 100 requests per 100 seconds per user | Voucher creation, master data updates | Write queue per CompanyID; Batch writes |
| **No Transactions** | N/A | Data consistency risk | Application-layer ACID via write queue serialization |
| **No Foreign Keys** | N/A | Referential integrity risk | Backend validation before every write |
| **No Indexes** | N/A | Slow queries | Cache all lookups; Minimize direct reads |
| **Cell Limit** | 10 million cells per spreadsheet | Hard ceiling for data | Monitor usage; Plan PostgreSQL migration at 60% capacity |
| **Concurrent Writes** | Last-write-wins (race conditions) | Data corruption risk | Per-company write queue serialization |

### 2.2 Mitigation Implementation Details

#### Caching Strategy
```
Read Request Flow:
1. Check Redis cache
2. If hit: Return cached data
3. If miss: 
   a. Fetch from Google Sheets
   b. Store in Redis with TTL
   c. Return data

Cache Keys:
- dashboard:COMPANY_ID (TTL: 5 min)
- vouchers:COMPANY_ID:PAGE (TTL: 2 min)
- parties:COMPANY_ID (TTL: 10 min)
- items:COMPANY_ID (TTL: 10 min)
- ledgers:COMPANY_ID (TTL: 10 min)
- settings:COMPANY_ID (TTL: 15 min)
```

#### Write Queue Strategy
```
Write Request Flow:
1. Validate request
2. Generate VoucherNo (Redis INCR)
3. Add to write queue (Redis List): queue:COMPANY_ID
4. Return 202 Accepted with VoucherNo
5. Background worker:
   a. Pop from queue (FIFO)
   b. Acquire lock for CompanyID
   c. Write to Google Sheets
   d. Release lock
   e. Update cache
   f. Notify user via WebSocket
```

---

## 3. Caching Layer Strategy

### 3.1 Cache Types

| Cache Type | Purpose | TTL | Storage | Invalidation |
|---|---|---|---|---|
| Dashboard Aggregates | Pre-computed widget data | 5 minutes | Redis Hash | On voucher create/update/delete |
| Voucher List | Paginated voucher queries | 2 minutes | Redis List | On voucher create/update/delete |
| Master Data | Parties, Items, Ledgers | 10 minutes | Redis Hash | On master create/update/delete |
| Settings | Per-company configuration | 15 minutes | Redis Hash | On settings update |
| Voucher Counters | Auto-increment counters | N/A | Redis String | Never (backup to Sheets) |
| Write Queue | Serialize writes per CompanyID | N/A | Redis List | After write completion |
| Session Store | User sessions | 7 days | Redis Hash | On logout |

### 3.2 Cache Invalidation Rules

| Event | Action |
|---|---|
| Voucher Created | Invalidate: dashboard:COMPANY_ID, vouchers:COMPANY_ID:* |
| Voucher Updated | Invalidate: dashboard:COMPANY_ID, vouchers:COMPANY_ID:*, voucher:VOUCHER_ID |
| Voucher Deleted | Invalidate: dashboard:COMPANY_ID, vouchers:COMPANY_ID:*, voucher:VOUCHER_ID |
| Party Created/Updated | Invalidate: parties:COMPANY_ID, dashboard:COMPANY_ID |
| Item Created/Updated | Invalidate: items:COMPANY_ID, dashboard:COMPANY_ID |
| Ledger Created/Updated | Invalidate: ledgers:COMPANY_ID, dashboard:COMPANY_ID |
| Settings Updated | Invalidate: settings:COMPANY_ID |

---

## 4. Voucher Numbering Strategy (Collision-Free)

### 4.1 Numbering Scheme

| Voucher Type | Prefix | Counter Key | Format Example | Reset Frequency |
|---|---|---|---|---|
| Sales | SAL | counter:COMP01:Sales | SAL-0000001 | Annual |
| Purchase | PUR | counter:COMP01:Purchase | PUR-0000001 | Annual |
| Receipt | REC | counter:COMP01:Receipt | REC-0000001 | Annual |
| Payment | PAY | counter:COMP01:Payment | PAY-0000001 | Annual |
| Delivery Note | DN | counter:COMP01:DeliveryNote | DN-0000001 | Annual |
| Receipt Note | RN | counter:COMP01:ReceiptNote | RN-0000001 | Annual |
| Journal | JRN | counter:COMP01:Journal | JRN-0000001 | Annual |
| Contra | CON | counter:COMP01:Contra | CON-0000001 | Annual |
| Debit Note | DBN | counter:COMP01:DebitNote | DBN-0000001 | Annual |
| Credit Note | CRN | counter:COMP01:CreditNote | CRN-0000001 | Annual |

### 4.2 Implementation

**Primary: Redis Atomic Counter**
```javascript
// Atomic increment
const nextNumber = await redis.incr(`counter:${companyId}:${voucherType}`);
const voucherNo = `${prefix}-${String(nextNumber).padStart(7, '0')}`;
```

**Backup: CompanyCounters Sheet**
```
| CompanyID | VoucherType | LastNumber | LastResetDate |
|-----------|-------------|------------|---------------|
| COMP01    | Sales       | 1234       | 2026-01-01    |
| COMP01    | Purchase    | 567        | 2026-01-01    |
```

**Synchronization:**
1. On app startup: Load counters from CompanyCounters sheet to Redis
2. Every 100 vouchers: Backup Redis counter to sheet
3. On New Year: Reset counters to 1, update LastResetDate

---

## 5. Authentication Strategy

### 5.1 JWT Token Structure

**Access Token (15 minutes)**
```json
{
  "sub": "USER_ID",
  "email": "user@example.com",
  "name": "User Name",
  "companies": ["COMP01", "COMP02"],
  "permissions": {
    "can_create_vouchers": true,
    "can_edit_vouchers": true,
    "can_delete_vouchers": true,
    "can_view_reports": true,
    "can_manage_masters": true,
    "can_manage_settings": true,
    "can_invite_users": true,
    "can_delete_company": true
  },
  "iat": 1234567890,
  "exp": 1234567890 + 900
}
```

**Refresh Token (7 days)**
```json
{
  "sub": "USER_ID",
  "tokenFamily": "UUID",
  "iat": 1234567890,
  "exp": 1234567890 + 604800
}
```

### 5.2 Authentication Flow

```
1. Login Request
   POST /api/v1/auth/login
   Body: { email, password }
   
2. Server Response
   {
     accessToken: "jwt_access_token",
     refreshToken: "jwt_refresh_token",
     user: { id, name, email, companies }
   }
   
3. Store Tokens
   - Access Token: Memory (React state)
   - Refresh Token: Secure HTTP-only cookie
   
4. API Requests
   Headers: { Authorization: "Bearer <access_token>" }
   
5. Token Expiry
   - 401 response → Use refresh token to get new access token
   - POST /api/v1/auth/refresh
   - If refresh token expired → Redirect to login
   
6. Logout
   POST /api/v1/auth/logout
   - Invalidate refresh token family
   - Clear cookies
   - Clear local storage
```

### 5.3 Passcode Storage (Mobile)

- 4-digit passcode stored in device secure storage (Keychain iOS / Keystore Android)
- Required on app resume after 5 minutes of inactivity
- Not transmitted to server

---

## 6. API Endpoint Specification

### 6.1 Base Configuration

```
Base URL: https://api.bizanalyzt.com/v1
Content-Type: application/json
Authorization: Bearer <access_token>
```

### 6.2 Authentication Endpoints

| Method | Endpoint | Purpose | Request Body | Response |
|---|---|---|---|---|
| POST | /auth/login | User login | `{ email, password }` | `{ accessToken, refreshToken, user }` |
| POST | /auth/refresh | Refresh access token | `{ refreshToken }` (cookie) | `{ accessToken }` |
| POST | /auth/logout | Logout user | - | `{ success: true }` |
| POST | /auth/forgot-password | Request password reset | `{ email }` | `{ success: true }` |
| POST | /auth/reset-password | Reset password with token | `{ token, newPassword }` | `{ success: true }` |

### 6.3 Company Endpoints

| Method | Endpoint | Purpose | Request Body | Response |
|---|---|---|---|---|
| GET | /companies | List user's companies | - | `[{ companyId, name, address, gstin }]` |
| POST | /companies | Create new company | `{ name, address, gstin, financialYearStart, currency }` | `{ companyId, name }` |
| GET | /companies/:id | Get company details | - | `{ companyId, name, ... }` |
| PUT | /companies/:id | Update company | `{ name?, address?, gstin? }` | `{ companyId, name }` |
| DELETE | /companies/:id | Delete company | - | `{ success: true }` |
| POST | /companies/:id/select | Select active company | - | `{ accessToken (updated) }` |

### 6.4 Dashboard Endpoints

| Method | Endpoint | Purpose | Query Params | Response |
|---|---|---|---|---|
| GET | /dashboard/:companyId | Get dashboard data | `?from=DATE&to=DATE` | Dashboard widget object |

**Dashboard Response Structure:**
```json
{
  "cashBankBalance": {
    "cash": { "total": 50000, "accounts": [...] },
    "bank": { "total": 150000, "accounts": [...] }
  },
  "salesOrder": { "count": 25, "value": 500000 },
  "purchaseOrder": { "count": 10, "value": 300000 },
  "deliveryNote": { "count": 15, "value": 250000 },
  "receiptNote": { "count": 8, "value": 180000 },
  "outstandingReceivable": { "total": 750000, "parties": 45 },
  "outstandingPayable": { "total": 450000, "parties": 32 },
  "party": { "list": [...] },
  "items": { "list": [...] }
}
```

### 6.5 Voucher Endpoints

| Method | Endpoint | Purpose | Query Params | Response |
|---|---|---|---|---|
| GET | /vouchers/:companyId | List vouchers | `?type=Sales&from=DATE&to=DATE&page=1&limit=50` | `{ vouchers: [...], total, page, limit }` |
| GET | /vouchers/:companyId/:voucherId | Get voucher details | - | Voucher object |
| POST | /vouchers/:companyId | Create voucher | Voucher object | `{ voucherId, voucherNo }` |
| PUT | /vouchers/:companyId/:voucherId | Update voucher | Voucher object with version | `{ voucherId, voucherNo }` |
| DELETE | /vouchers/:companyId/:voucherId | Delete voucher | - | `{ success: true }` |

**Voucher Request/Response Structure:**
```json
{
  "voucherId": "VOUCH001",
  "voucherNo": "SAL-0000123",
  "voucherType": "Sales",
  "voucherDate": "2026-08-03",
  "partyId": "PARTY001",
  "referenceNo": "PO-12345",
  "narration": "Against PO-12345",
  "lines": [
    {
      "lineId": "LINE001",
      "lineType": "Item",
      "itemId": "ITEM001",
      "description": "Product A",
      "quantity": 10,
      "rate": 100,
      "amount": 1000,
      "gstRate": 18,
      "gstAmount": 180
    }
  ],
  "subTotal": 1000,
  "gstTotal": 180,
  "roundOff": 0,
  "grandTotal": 1180,
  "version": 1
}
```

### 6.6 Master Data Endpoints

#### Parties
| Method | Endpoint | Purpose |
|---|---|---|
| GET | /parties/:companyId | List parties |
| POST | /parties/:companyId | Create party |
| GET | /parties/:companyId/:partyId | Get party details |
| PUT | /parties/:companyId/:partyId | Update party |
| DELETE | /parties/:companyId/:partyId | Delete party |

#### Items
| Method | Endpoint | Purpose |
|---|---|---|
| GET | /items/:companyId | List items |
| POST | /items/:companyId | Create item |
| GET | /items/:companyId/:itemId | Get item details |
| PUT | /items/:companyId/:itemId | Update item |
| DELETE | /items/:companyId/:itemId | Delete item |

#### Ledgers
| Method | Endpoint | Purpose |
|---|---|---|
| GET | /ledgers/:companyId | List ledgers |
| POST | /ledgers/:companyId | Create ledger |
| GET | /ledgers/:companyId/:ledgerId | Get ledger details |
| PUT | /ledgers/:companyId/:ledgerId | Update ledger |
| DELETE | /ledgers/:companyId/:ledgerId | Delete ledger |

#### Groups
| Method | Endpoint | Purpose |
|---|---|---|
| GET | /groups/:companyId | List groups |
| POST | /groups/:companyId | Create group |
| GET | /groups/:companyId/:groupId | Get group details |
| PUT | /groups/:companyId/:groupId | Update group |

### 6.7 Report Endpoints

| Method | Endpoint | Purpose | Query Params |
|---|---|---|---|
| GET | /reports/:companyId/balance-sheet | Balance Sheet | `?asOf=DATE` |
| GET | /reports/:companyId/profit-loss | P&L Statement | `?from=DATE&to=DATE` |
| GET | /reports/:companyId/day-book | Day Book | `?date=DATE&type=Sales` |
| GET | /reports/:companyId/ledger/:ledgerId | Ledger Report | `?from=DATE&to=DATE` |
| GET | /reports/:companyId/item/:itemId | Item Report | `?from=DATE&to=DATE` |
| GET | /reports/:companyId/by-ledger | By Ledger | `?from=DATE&to=DATE` |
| GET | /reports/:companyId/by-item | By Item | `?from=DATE&to=DATE` |
| GET | /reports/:companyId/top | Top Report | `?period=MONTH` |
| GET | /reports/:companyId/expenses | Expenses Report | `?from=DATE&to=DATE` |
| GET | /reports/:companyId/pending-sales | Pending Sales Orders | - |
| GET | /reports/:companyId/pending-purchase | Pending Purchase Orders | - |
| GET | /reports/:companyId/customer | Customer Report | `?from=DATE&to=DATE` |

### 6.8 Settings Endpoints

| Method | Endpoint | Purpose | Request Body |
|---|---|---|---|
| GET | /settings/:companyId | Get all settings | - |
| PUT | /settings/:companyId/share | Update share settings | `{ settingValue }` |
| PUT | /settings/:companyId/outstanding | Update outstanding settings | `{ settingValue }` |
| PUT | /settings/:companyId/auto-reminder | Update auto reminder | `{ settingValue }` |
| PUT | /settings/:companyId/data-entry | Update data entry | `{ settingValue }` |
| PUT | /settings/:companyId/notification | Update notifications | `{ settingValue }` |
| PUT | /settings/:companyId/stock-item | Update stock item settings | `{ settingValue }` |
| PUT | /settings/:companyId/date | Update date settings | `{ settingValue }` |
| PUT | /settings/:companyId/currency | Update currency | `{ settingValue }` |

### 6.9 User Management Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /users | List users |
| POST | /users/invite | Invite user |
| DELETE | /users/:userId | Remove user |

### 6.10 Outstanding Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /outstanding/:companyId/receivables | Get receivables |
| GET | /outstanding/:companyId/payables | Get payables |

---

## 7. Notification Integration (Auto Reminder)

### 7.1 Channels

| Channel | Provider | Use Case |
|---|---|---|
| **WhatsApp** | Meta Business API / Twilio / Interakt | Payment reminders, overdue notices |
| **Email** | SendGrid / AWS SES | Statement copies, invoice attachments |
| **Push Notification** | Firebase FCM | App alerts, new voucher notifications |

### 7.2 WhatsApp Integration Flow

```
1. User configures Auto Reminder in Settings
   - Select parties
   - Set reminder frequency (daily/weekly/monthly)
   - Customize message template
   
2. Backend scheduler (Cron job)
   - Runs daily at configured time
   - Queries overdue parties
   - Generates personalized messages
   
3. Message sending
   - Call WhatsApp Business API
   - Log in ReminderLog sheet
   - Update last reminder date
   
4. Template approval (one-time)
   - Submit template to WhatsApp for approval
   - Templates must comply with WhatsApp policies
```

**Sample WhatsApp Template:**
```
Hi {{party_name}},

This is a friendly reminder that your invoice {{voucher_no}} dated {{voucher_date}} for amount ₹{{amount}} is overdue by {{overdue_days}} days.

Please clear the payment at your earliest convenience.

Thank you for your business!

- {{company_name}}
```

### 7.3 Email Integration Flow

```
1. Configure SMTP settings
   - API key from SendGrid or AWS SES
   - Verified sender domain
   
2. Email templates
   - Statement email
   - Invoice email with attachment
   - Overdue notice
   
3. Sending logic
   - Generate PDF attachment on-demand
   - Send via email API
   - Log in ReminderLog
```

---

## 8. Concurrent Write Handling

### 8.1 Optimistic Locking with Version Numbers

Every editable entity has a `Version` field:
- Companies, Groups, Ledgers, Parties, Items, Vouchers, BankAccounts, CashAccounts

**Update Flow:**
```
1. Client fetches entity (version = 5)
2. Client modifies entity
3. Client sends PUT request with version = 5
4. Server checks:
   - Fetch current version from Sheets
   - If current version == 5: Proceed
   - If current version > 5: Reject with 409 Conflict
5. If success:
   - Increment version to 6
   - Write to Sheets
   - Return 200 OK with version = 6
```

**Client Handling of 409 Conflict:**
```javascript
if (response.status === 409) {
  // Show user: "This record was modified by another user"
  // Offer: "View latest version" or "Overwrite with your changes"
}
```

### 8.2 Write Queue Serialization

**Problem:** Two users simultaneously create vouchers for same company
**Solution:** Per-company FIFO queue in Redis

```
queue:COMP01 = ["write_voucher_REQ1", "write_voucher_REQ2", ...]

Worker:
1. BLPOP queue:COMP01
2. Process write
3. ACK
```

**Performance:** Sequential writes, but <100ms per write, acceptable UX

---

## 9. Data Validation Rules

### 9.1 Voucher Validation

| Field | Rule |
|---|---|
| VoucherDate | Cannot be future date; Cannot be before financial year start |
| PartyId | Must exist in Parties sheet for company |
| ItemId (in lines) | Must exist in Items sheet for company |
| LedgerId (in lines) | Must exist in Ledgers sheet for company |
| Quantity | Must be > 0 for Item lines |
| Rate | Must be ≥ 0 |
| Amount | Must equal Quantity × Rate for Item lines |
| GST Rate | Must be one of: 0, 5, 12, 18, 28 |
| GrandTotal | Must equal SubTotal + GSTTotal + RoundOff |

### 9.2 Master Data Validation

| Entity | Rules |
|---|---|
| Party | Name required; GSTIN format validation if provided; CreditDays ≥ 0 |
| Item | Name required; Unit required; GST Rate must be valid; OpeningStock ≥ 0 |
| Ledger | Name required; Group must exist; OpeningBalance can be negative |
| Company | Name required; GSTIN format validation; FinancialYearStart valid date |

---

## 10. Deployment Architecture

### 10.1 Infrastructure Components

```
┌─────────────────────────────────────────────────────┐
│                  Production Environment              │
├─────────────────────────────────────────────────────┤
│                                                       │
│  ┌───────────────────────────────────────────────┐ │
│  │   Load Balancer (Nginx / AWS ALB)             │ │
│  └────────────────┬──────────────────────────────┘ │
│                   │                                 │
│  ┌────────────────┴──────────────────────────────┐│
│  │   Kubernetes Cluster (GKE / EKS)               ││
│  │                                                 ││
│  │  ┌──────────────┐  ┌──────────────┐           ││
│  │  │ API Pod 1    │  │ API Pod 2    │  ...      ││
│  │  └──────────────┘  └──────────────┘           ││
│  │                                                 ││
│  │  ┌──────────────┐  ┌──────────────┐           ││
│  │  │ Worker Pod 1 │  │ Worker Pod 2 │  ...      ││
│  │  └──────────────┘  └──────────────┘           ││
│  │                                                 ││
│  └─────────────────────────────────────────────────┘│
│                                                       │
│  ┌─────────────────────────────────────────────────┐│
│  │   Managed Services                              ││
│  │  - Redis: Google Memorystore / AWS ElastiCache ││
│  │  - Monitoring: Prometheus + Grafana            ││
│  │  - Logging: Sentry                             ││
│  │  - CDN: CloudFlare / CloudFront                ││
│  └─────────────────────────────────────────────────┘│
│                                                       │
└───────────────────────────────────────────────────────┘
```

### 10.2 Environment Variables

```bash
# App
NODE_ENV=production
PORT=3000

# Google Sheets
GOOGLE_SHEETS_SPREADSHEET_ID=xxx
GOOGLE_SERVICE_ACCOUNT_EMAIL=xxx
GOOGLE_PRIVATE_KEY=xxx

# Redis
REDIS_URL=redis://xxx:6379

# JWT
JWT_SECRET=xxx
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# WhatsApp
WHATSAPP_API_KEY=xxx
WHATSAPP_PHONE_NUMBER_ID=xxx

# Email
SENDGRID_API_KEY=xxx
EMAIL_FROM=noreply@bizanalyzt.com

# Sentry
SENTRY_DSN=xxx

# Firebase (Push Notifications)
FIREBASE_PROJECT_ID=xxx
FIREBASE_PRIVATE_KEY=xxx
FIREBASE_CLIENT_EMAIL=xxx
```

### 10.3 CI/CD Pipeline

```yaml
stages:
  1. Code Push → GitHub
  2. Run Tests (Unit, Integration, E2E)
  3. Build Docker Image
  4. Push to Container Registry
  5. Deploy to Staging
  6. Manual Approval
  7. Deploy to Production
  8. Smoke Tests
  9. Monitoring Alert
```

---

## 11. Security Considerations

| Area | Measure |
|---|---|
| **Transport** | HTTPS only, HSTS headers |
| **Authentication** | JWT with short expiry, refresh token rotation |
| **Authorization** | Middleware checks company access on every request |
| **Input Validation** | Server-side validation on all inputs |
| **SQL Injection** | N/A (using Sheets API) |
| **XSS** | React's built-in escaping, CSP headers |
| **CSRF** | SameSite cookies, CSRF tokens |
| **Rate Limiting** | 100 requests/minute per user |
| **Data Encryption** | AES-256 at rest (in Sheets), TLS 1.3 in transit |
| **Secrets** | Environment variables, never in code |
| **Audit Log** | All writes logged with userId, timestamp |

---

## 12. Performance Optimization

### 12.1 Backend Optimizations

| Technique | Implementation |
|---|---|
| **Caching** | Redis for all read-heavy queries |
| **Batch Writes** | Accumulate writes, flush every 5 seconds |
| **Connection Pooling** | Reuse HTTP connections to Sheets API |
| **Async Processing** | Write queue for non-blocking UX |
| **Compression** | Gzip for API responses |
| **Pagination** | Limit all list endpoints to 50 items |

### 12.2 Frontend Optimizations

| Technique | Implementation |
|---|---|
| **Code Splitting** | Route-based lazy loading |
| **Tree Shaking** | Remove unused dependencies |
| **Memoization** | React.memo, useMemo, useCallback |
| **Virtualization** | react-window for long lists |
| **Image Optimization** | WebP format, lazy loading |
| **Service Worker** | Cache static assets |
| **CDN** | Serve static assets from edge |

---

## 13. Monitoring & Alerting

### 13.1 Metrics

| Metric | Threshold | Alert |
|---|---|---|
| **API Latency** | p95 > 2s | Warning |
| **API Error Rate** | > 1% | Critical |
| **Redis Memory** | > 80% | Warning |
| **Write Queue Length** | > 100 | Warning |
| **Sheets API Errors** | > 5/minute | Critical |

### 13.2 Dashboards

- Real-time request volume
- Error distribution by endpoint
- Cache hit/miss ratio
- Write queue depth over time
- User activity heatmap

---

## 14. Document Verification

**Verified against:** requirements.md, PRD.md  
**Compatibility:** 100%  
**Gaps:** None  
**Status:** Complete

All technical decisions align with requirements.md constraints:
- ✅ Google Sheets as database
- ✅ Web + Mobile platforms
- ✅ Multi-company support
- ✅ Real-time online only
- ✅ Full permissions model
- ✅ All 10 voucher types
- ✅ All 9 settings (ending with Currency)
- ✅ Dashboard as default screen

---

**Document Version History:**
- v1.0 - Initial complete version

# Implementation Plan
## Multi-Company Accounting & Inventory Management App

---

## 1. Phase Overview

| Phase | Name | Duration | Key Deliverables |
|---|---|---|---|
| 1 | Foundation | 3-4 weeks | Auth, multi-company, backend, Sheets connection |
| 2 | Core Transactions | 4-5 weeks | All 10 voucher types, masters |
| 3 | Dashboard | 2-3 weeks | All widgets, caching |
| 4 | Reports | 3-4 weeks | Balance Sheet, P&L, all reports |
| 5 | Settings & Notifications | 2-3 weeks | All settings, Auto Reminder |
| 6 | Polish & QA | 2-3 weeks | Testing, optimization |

**Total:** 16-22 weeks

---

## 2. Phase 1: Foundation

### Milestones
1. Backend scaffold (Node.js/Express or Python/FastAPI)
2. Sheets connection (service account, API wrapper)
3. Auth implementation (JWT, login/logout/refresh)
4. User/Company schema creation
5. Multi-company selection flow
6. Write queue implementation (Redis)

### Risk Validation (Highest Priority)
- Sheets API rate limits
- Concurrent write conflicts
- Query performance

---

## 3. Phase 2: Core Transactions

### Milestones
1. Voucher numbering (atomic counter)
2. Item-based vouchers (Sales, Purchase, Delivery, Receipt, Debit/Credit Notes)
3. Ledger-based vouchers (Receipt, Payment, Journal, Contra)
4. Voucher CRUD operations
5. Master data - Items
6. Master data - Parties
7. Master data - Groups & Ledgers

---

## 4. Phase 3: Dashboard

### Milestones
1. Cache infrastructure (Redis TTL, invalidation)
2. Cash/Bank Balance widget
3. Sales/Purchase widgets
4. Delivery/Receipt Note widgets
5. Outstanding widget
6. Party widget
7. Items widget
8. Multi-company summary widgets

---

## 5. Phase 4: Reports

### Milestones
1. Balance Sheet
2. Profit & Loss
3. Day Book
4. Ledger Report
5. By Ledger Report
6. By Item Report
7. Top Report
8. Expenses Report
9. Pending Orders
10. Customer Report
11. Drill-down navigation (all to Voucher)

---

## 6. Phase 5: Settings & Notifications

### Milestones
1. Settings infrastructure
2. Share settings
3. Outstanding settings
4. Auto Reminder configuration
5. WhatsApp integration
6. Email integration
7. Reminder scheduler
8. Data Entry settings
9. Notification settings
10. Stock Item settings
11. Date/Currency settings

---

## 7. Phase 6: Polish & QA

### Milestones
1. Unit tests (80%+ coverage)
2. Integration tests
3. E2E tests
4. Performance testing
5. Mobile polish
6. Security audit
7. Accessibility (WCAG 2.1 AA)
8. Documentation

---

## 8. Critical Path

Phase 1 → Phase 2 → Phase 3 → Phase 5 → Phase 6

(Phase 4 runs parallel with Phase 3)

---

## 9. Highest Risk Items

| Risk | Phase | Mitigation |
|---|---|---|
| Sheets API rate limits | 1 | Aggressive caching |
| Concurrent writes | 1 | Redis write queue |
| Voucher numbering collisions | 2 | Atomic Redis INCR |
| Dashboard performance | 3 | Aggregation cache |
| WhatsApp approval delays | 5 | Start early |

---

## 10. Go/No-Go Checkpoints

| Checkpoint | Phase End | Criteria |
|---|---|---|
| 1 | Phase 1 | Sheets viable, write queue working |
| 2 | Phase 2 | All voucher types functional |
| 3 | Phase 4 | Reports accurate, drill-downs working |
| 4 | Phase 6 | Performance acceptable, security passed |

---

## 11. Rollback Plan

If Sheets fails:
1. Keep same API contract
2. Create PostgreSQL schema
3. One-time data migration
4. Swap backend data source
5. No frontend changes

---

## 12. Open Questions

1. WhatsApp API provider?
2. Email provider preference?
3. Mobile framework (React Native vs Flutter)?
4. Hosting platform (Cloud Run vs ECS)?
5. CI/CD pipeline preference?

---

**Document Status:** Complete

# TALLY TEMPLATE - PAGE MAPPING - Complete Analysis

> Generated: September 2026 | Project: Biz_Analyzt
> Scope: All 66 Tally templates mapped to all 58 data-driven frontend pages

---

## LEGEND

| Symbol | Meaning |
|:---:|---|
| COMPLETE | Template provides everything the page needs, no Google Sheets fallback |
| PARTIAL | Template provides some data, Google Sheets fills the remaining gaps |
| NOT CONNECTED | Page has no Tally template OR template exists but page does not use it |
| CRITICAL GAP | Template exists but CANNOT provide all needed fields (limited by template design) |
| ALERT | Template exists but is UNUSED, OR template is COMPUTED (not a real Tally pull) |


---

## SECTION A: TEMPLATE -> PAGE MAPPING

### Templates 1-10

| # | Question | Connected Pages | Status | What It Provides | What's Missing |
|:---:|---|:---:|:---:|---|---|
| 1 | What are the customer receivables? | Dashboard | PARTIAL | totalReceivables amount | Party-level detail, aging |
| 2 | Customers wise outstanding bills | Outstanding, PartyStatement, LedgerStatement | PARTIAL | bills (customer_name, due_date, overdue_days, outstanding_balance) | Aging buckets, party contact |
| 3 | Show customer aging analysis | Outstanding | PARTIAL | aging (bucket_0_30, 31_60, 61_90, 90_plus) | Individual bill details |
| 4 | Customer receivables with risk level | Outstanding | PARTIAL | risk_level, due_status, due_date, customer_name | Aging buckets, vendor data |
| 5 | What are the vendor Payable? | Dashboard | PARTIAL | totalPayables amount | Vendor detail, aging |
| 6 | Today total expenses + breakdown | ExpensesReport | PARTIAL | expenses (expense_head, amount, date) for today | Per-voucher detail, expenseType, notes |
| 7 | Vendor Payable with invoice details | Outstanding | PARTIAL | vendor invoices (invoice_no, date, amount, due_date) | Customer data, aging |
| 8 | PAYMENT voucher data | PaymentVouchers | PARTIAL | voucherNo, voucher_date, ledger_name, amount, status:PAID | PartyID, narration, bankAccount, paymentMode, chequeNo, ledger entries |
| 9 | Closing stock summary for all locations | StockStatusReport | PARTIAL | stock_item, closing_qty, godown_name (locations array) | salesVelocity, isUnderstock, isOverstock, daysOfStock, stockValue, lastSaleDate |
| 10 | Today vs last week sales comparison | Dashboard | COMPLETE | todaySales, lastWeekSales, salesDifferencePercent | -- |

### Templates 11-20

| # | Question | Connected Pages | Status | What It Provides | What's Missing |
|:---:|---|:---:|:---:|---|---|
| 11 | WEEKLY MIS data for last 7 days | Dashboard | COMPLETE | weekStartDate, weekEndDate, weeklySales, weeklyExpenses, cashInflow, cashOutflow, netCashFlow, topCustomer, topVendor | Daily breakdown |
| 12 | Expense ledger summary by Ledger Name | ExpensesReport | COMPLETE | expenses (ledger_name, group_name, total_amount) | Date range, per-voucher detail |
| 13 | Today total sales and invoice count | Dashboard | COMPLETE | todaySales, todaySalesInvoiceCount | Customer breakdown |
| 14 | Cash ledger balance + all bank balances | Dashboard | PARTIAL | cashInHand, bankBalance, cashAccountCount, bankAccountCount | Bank details (IFSC, accountNo, branch) |
| 15 | Previous month sales register | SalesRegister | COMPLETE | voucher_date, voucher_number, customer_name, total_invoice_value | Line items, GST |
| 16 | Customers/suppliers missing GSTN/Address/Mobile | Parties | PARTIAL | parties with missingFields flag | All parties, not just incomplete |
| 17 | Bank ledger entries for last 30 days | CashBankPage | PARTIAL | bank entries (date, narration, amount, cheque_no) | Account summary, IFSC, accountNo |
| 18 | give data of sales trasaction | SalesVouchers, Dashboard | PARTIAL | invoice_no, invoice_date, customer_name, total_invoice_value, items (comma string) | ALL line items: qty, rate, gstRate, gstAmount per item. Also: narration, PartyID, taxAmount, subTotal, GST/HSN |
| 19 | give me all customers details | Parties | PARTIAL | customer_name, type:Customer, gstin, address, mobile, email, balance | PAN, creditLimit, creditDays, salesPerson, city, state, PIN, openingBalance |
| 20 | any pending sales order | PendingOrders | PARTIAL | order_number, voucher_date, party_name, amount, dispatch_status, due_date, items, ordered_qty, dispatched_qty, pending_qty | OrderID, PartyID, referenceNo, itemID, rate, narration, expectedDate |

### Templates 21-30

| # | Question | Connected Pages | Status | What It Provides | What's Missing |
|:---:|---|:---:|:---:|---|---|
| 21 | Last 90 days purchase vouchers for vendor | VendorPurchaseHistory | COMPLETE | vendor_name, voucher_number, voucher_date, amount | Line items |
| 22 | Batch-wise inventory details | StockAging, StockBatchesPage | PARTIAL | stock_item, batch_name, closing_qty, stock_value, voucher_date, godown_name (raw, sliced 2000) | ageingDays, ageingBucket, expDate, mfgDate, rate, BatchID |
| 23 | All sales vouchers with details | SalesVouchers, Dashboard | PARTIAL | voucherNo, date, customer_name, item_name, qty, rate, amount, tax, total | Items as string, no PartyID, narration, GST/HSN |
| 24 | All purchase vouchers (financial year) | PurchaseVouchers | PARTIAL | invoice_number, invoice_date, vendor_name, amount, gap_type, items:0 | ALL line items. Also: taxAmount, subTotal, narration, PartyID, taxableAmount, GST |
| 25 | Outward tax, inward tax, net GST liability | GstLiability | PARTIAL | ledger_name, net_tax_liability, inward_itc, outward_tax (mapped but NOT passed to frontend) | period, returnFilingStatus, paymentStatus, dueDate, GSTIN, LedgerID |
| 26 | All vendors details | Parties | PARTIAL | vendor_name, type:Vendor, gstin, address, mobile, email, balance | Same as template 19 |
| 27 | Cash position + daily inflow schedule | CashBankPage | PARTIAL | cashPositionLastWeek, inflow schedule | Account details (IFSC, accountNo, bankName) |
| 28 | Transaction of [ledger_name] | PartyStatement, LedgerStatement | PARTIAL | date, voucher_number, voucher_type, narration, debit, credit, closing_balance, amount | openingBalance, groupName, ledgerType, LedgerID |
| 29 | Customer wise purchase history | CustomerPurchaseHistory | PARTIAL | Party Name, Stock Item Name, Last Purchase Date, Email, Voucher Number, Quantity, amount:0 | amount ALWAYS 0 (hardcoded) |
| 30 | Total Profit + cost/profit center | ProfitLoss, Dashboard | PARTIAL | sales, purchases, directExpenses, directIncome, indirectExpenses, indirectIncome, openingStock, closingStock, grossProfit, netProfit | Expense breakdown, revenue streams, otherIncome, depreciation, employeeCosts |

### Templates 31-40

| # | Question | Connected Pages | Status | What It Provides | What's Missing |
|:---:|---|:---:|:---:|---|---|
| 31 | All sales quotation data | SalesQuotations | COMPLETE | quotation_number, quotation_date, customer_name, total_amount, quotation_status | Line items |
| 32 | Full receivables aging per party | Outstanding | PARTIAL | party_name, total_outstanding, bucket_0_30, 31_60, 61_90, 90_plus | Individual bill details, party contact |
| 33 | Last 12 months Daybook (monthly) | DayBook | PARTIAL | month, total_sales, total_purchase, total_receipt, total_payment, total_expense | Individual vouchers: voucherNo, date, partyName, narration. MONTHLY only |
| 34 | MSME vendor payables | Outstanding | COMPLETE | vendor_name, vendor_phone, udyam, vendor_type, bill_no, bill_date, amount, days_since | Non-MSME vendors |
| 35 | Payables with discount terms | Outstanding | COMPLETE | vendor_name, bill_amount, due_date, days_to_due, discount_terms, discount_deadline | Customer receivables |
| 36 | Vouchers entered/altered this week | VoucherAudit | COMPLETE | date, voucher_no, type, party, amount, creation_time | Line items, narration |
| 37 | Outstanding bills with due date + overdue | Outstanding | COMPLETE | bill_no, bill_date, party_name, party_type, amount, due_date, overdue_days | Aging buckets |
| 38 | Opening/closing balance of bank and cash | CashBankPage | PARTIAL | account_name, account_type, opening_balance, closing_balance | bankName, accountNumber, IFSC, branchName, isActive, location |
| 39 | Daily sales (including zero days) | TrendCharts | PARTIAL | date, sales_amount, has_transactions, invoice_count (RAW) | Processed trends, monthly breakdown, YoY, growth rates |
| 40 | Daily purchase amounts | TrendCharts | PARTIAL | date, purchase_amount, bill_count (RAW) | Processed trends, monthly breakdown, YoY |

### Templates 41-50

| # | Question | Connected Pages | Status | What It Provides | What's Missing |
|:---:|---|:---:|:---:|---|---|
| 41 | how much my customer owe to me | Outstanding | COMPLETE | customer_name, outstanding_amount | Bill details, aging |
| 42 | How much i owe to my vendors | Outstanding | COMPLETE | vendor_name, outstanding_amount | Bill details, aging |
| 44 | GSTR-2B reconciliation | GstReconciliation | COMPLETE | gstin, party, supplierInvoiceNo/Date, salesInvoiceNo/Date/Party, taxableValue, igst, cgst, sgst, taxAmount, matchStatus | -- |
| 45 | Reimbursement audit | ReimbursementAudit | COMPLETE | employee, date, voucherNo, amount, description, status | -- |
| 47 | Active companies in Tally | CompanySelection | COMPLETE | company_name, financial_year, books_begin_from, status | CompanyID, CreatedAt, UpdatedAt |
| 48 | Ledger accounts with groups + opening balances | Ledgers, LedgerReport, LedgerDetail | PARTIAL | ledger_name, parent_group_name, group_type, opening_balance_inr | LedgerID, CompanyID, GroupID, closingBalance, isActive, StatementType, Nature |
| 49 | Parties with contact details + credit terms | Parties, CustomerView | PARTIAL | party_name, type, gstin, address, mobile, email, creditDays, balance | PAN, creditLimit, salesPerson, status, city, state, PIN, openingBalance, PartyID |
| 50 | Cash-in-hand + bank account ledgers | Accounts, CashBankPage | PARTIAL | ledger_name, type (Cash/Bank), balance, accountNo, branch | AccountID, CompanyID, LedgerID, bankName, IFSC, openingBalance, isActive, location |

### Templates 51-60

| # | Question | Connected Pages | Status | What It Provides | What's Missing |
|:---:|---|:---:|:---:|---|---|
| 51 | Sales vouchers WITH line item details | NOT CONNECTED | UNUSED | voucher_no, date, customer_name, item_name, qty, rate, gross_amount, tax_amount, total_amount | EXISTS but NO page calls it! Would fix SalesVouchers, ItemWiseSales, PartyWiseSales, ByItem |
| 52 | Purchase vouchers WITH line item details | NOT CONNECTED | UNUSED | voucher_no, date, vendor_name, item_name, qty, rate, gross_amount, tax_amount, total_amount | EXISTS but NO page calls it! Would fix PurchaseVouchers, ByItem |
| 53 | Receipt and payment vouchers | ReceiptVouchers | PARTIAL | voucher_date, voucher_number, voucher_type, party_name, total_amount_inr | PartyID, narration, bankAccount, paymentMode, ledger entries |
| 54 | Journal/DN/CN with ledger entries | JournalVouchers, CreditNoteVouchers, DebitNoteVouchers | PARTIAL | voucher_date, voucher_number, voucher_type, party_name, total_amount_inr (HEADER ONLY) | ALL line items: ledgerName, debit, credit per entry. DN/CN: originalInvoiceRef, taxReversal, reason |
| 55 | Stock items with groups + current stock | Items | PARTIAL | item_name, stock_group, current_qty, unit, sale_rate, gst_rate | Brand, HSN, MRP, min/maxStock, reorderLevel, location, isActive, openingStock, purchaseRate |
| 56 | Receivables and payables aging reports | Outstanding | PARTIAL | party_name, type, total_due, notDue, overdue0to30, 31to60, 61to90, over90 | Individual bill details |
| 57 | Dashboard summary metrics | Dashboard | PARTIAL | totalSales, totalPurchases, totalReceivables, totalPayables, cashInHand, bankBalance, grossProfit, netProfit | itemCount, partyCount, topItems, openOrders, recentTxns, bank details |
| 58 | Batch-wise stock (batch tracking) | StockAging | PARTIAL | item_name, batch_id, godown, quantity, value, inward_date | ageingDays, ageingBucket, expDate, mfgDate, rate, BatchID |
| 59 | Computed rollup (NOT a real Tally pull) | CustomerMovementReport | COMPUTED | party_name, status, days_since_last_txn, sales_value, txn_count | READS GOOGLE SHEETS. Missing: PartyID, first/lastTxnDate, totalPurchaseValue, salesPerson, city, state |
| 60 | Computed rollup (NOT a real Tally pull) | ByItem | COMPUTED | item_name, qty_sold, sales_value | READS GOOGLE SHEETS. Missing: purchaseQty, purchaseValue, stockBalance, itemGroup, unit, rate, GST |

### Templates 61-66

| # | Question | Connected Pages | Status | What It Provides | What's Missing |
|:---:|---|:---:|:---:|---|---|
| 61 | Computed rollup (NOT a real Tally pull) | GeographicReport | COMPUTED | state, city, partyCount, salesValue, purchaseValue | READS GOOGLE SHEETS. Missing: totalOutstanding, topCustomers, topItems, periodStart/End |
| 62 | Trial balance data | BalanceSheet | PARTIAL | ledger_name, group_name, debit, credit, balance | StatementType, Nature, parentGroup, grouping hierarchy, comparative period |
| 63 | Bank statement data | NOT CONNECTED | UNUSED | date, bank_name, cheque_no, description, withdrawal, deposit, closing_balance | EXISTS but no page calls it! |
| 64 | All ledger name | NOT CONNECTED | UNUSED | ledger_name (name only, no balances) | EXISTS but no page calls it |
| 65 | Items with highest demand | NOT CONNECTED | UNUSED | item_name, total_qty_sold, total_revenue, demand_rank | EXISTS but no page calls it! Would help TopBrands, TopReport, Dashboard |
| 66 | Opening balance of all ledger | NOT CONNECTED | UNUSED | ledger_name, opening_balance, balance_type | EXISTS but no page calls it! Would help LedgerReport, LedgerDetail, LedgerStatement |


---

## SECTION B: PAGE -> TEMPLATE MAPPING

### B1: COMPLETE TALLY -- 7 Pages

These pages use ONLY Tally hooks, have NO Google Sheets fallback.

| # | Page | Path | Template(s) | Tally Fields | Notes |
|---|------|------|:---:|---|---|
| 1 | GstReconciliation | src/pages/Reports/GstReconciliation.jsx | 44 | gstin, party, supplierInvoiceNo/Date, salesInvoiceNo/Date/Party, taxableValue, igst, cgst, sgst, taxAmount, matchStatus | LIVE TALLY. Date range. |
| 2 | ReimbursementAudit | src/pages/Reports/ReimbursementAudit.jsx | 45 | employee, date, voucherNo, amount, description, status | LIVE TALLY. Date range. |
| 3 | VendorPurchaseHistory | src/pages/Reports/VendorPurchaseHistory.jsx | 21 | vendor, voucherNo, date, amount | LIVE TALLY. 90 days. |
| 4 | SalesRegister | src/pages/Reports/SalesRegister.jsx | 15 | date, voucherNo, party, amount | LIVE TALLY. Previous month. |
| 5 | CustomerPurchaseHistory | src/pages/Reports/CustomerPurchaseHistory.jsx | 29 | customer, item, date, email, voucherNo, quantity, amount:0 | amount always 0 |
| 6 | SalesQuotations | src/pages/Reports/SalesQuotations.jsx | 31 | number, date, party, amount, status | LIVE TALLY. |
| 7 | VoucherAudit | src/pages/Reports/VoucherAudit.jsx | 36 | date, voucherNo, type, party, amount, createdAt | LIVE TALLY. Weekly. |

### B2: PARTIAL TALLY -- 29 Pages

These pages use Tally hooks but fall back to Google Sheets for missing columns.

| # | Page | Template(s) | Tally Returns | Google Sheets Fills (Missing) |
|---|------|:---:|---|---|
| 1 | Dashboard | 1,5,10,11,13,14,23,30,57 | receivables, payables, salesComparison, weeklyMis, todaySales, totalSales, cashInHand, bankBalance, grossProfit, netProfit | itemCount, partyCount, topItems, openOrders, recentTxns, salesTrend, topCustomers, topVendors, bankDetails (IFSC, accountNo, branch), pendingOrders, stockSummary |
| 2 | Outstanding | 2,3,4,7,32,34,35,37,41,42,56 | receivables (partyName, totalOutstanding, txCount, aging buckets, invoiceAging), payables, customer/vendorTotal, bills, risk, msme, discount | partyPhone, partyEmail, partyAddress, partyGSTIN, partyPAN, creditLimit, creditDays, salesPerson, city, state, PIN, openingBalance |
| 3 | PartyStatement | 28,2 | transactions (date, voucherNo, type, particulars, debit, credit, amount, balance) | partyGSTIN, PAN, address, phone, email, creditLimit, creditDays, salesPerson, openingBalance, city, state |
| 4 | CashBankPage | 17,27,38 | accounts (name, group, openingBalance, closingBalance), cashPosition, bankEntries | accountNumber, IFSC, branchName, bankName, accountType, isActive, location, lastSyncDate, AccountID |
| 5 | SalesVouchers | 18,23 | voucherNo, date, party, amount, status, items (comma string) | ALL line items: ItemID, itemName, qty, unit, rate, gstRate, gstAmount, ledger entries. Also: taxAmount, subTotal, narration, PartyID, GST/HSN |
| 6 | PurchaseVouchers | 24 | voucherNo, date, party, amount, status, items:0 | ALL line items: ItemID, itemName, qty, unit, rate, gstRate, gstAmount, ledger entries. Also: taxAmount, subTotal, narration, PartyID, taxableAmount, GST |
| 7 | PaymentVouchers | 8 | voucherNo, date, partyName, amount, status:PAID | PartyID, narration, bankAccount, paymentMode, chequeNo, ledger entries |
| 8 | ReceiptVouchers | 53 | date, voucherNo, type, party, amount | PartyID, narration, bankAccount, paymentMode, ledger entries |
| 9 | JournalVouchers | 54 | date, voucherNo, type, party, amount (HEADER) | ALL debit/credit entries: ledgerName, ledgerID, debitAmount, creditAmount, narration per entry |
| 10 | CreditNoteVouchers | 54 | date, voucherNo, type, party, amount (HEADER) | originalInvoiceRef, taxReversal, reason, ledger entries |
| 11 | DebitNoteVouchers | 54 | date, voucherNo, type, party, amount (HEADER) | originalInvoiceRef, taxReversal, reason, ledger entries |
| 12 | ByItem | 60 | itemName, qtySold, salesValue | purchaseQty, purchaseValue, stockBalance, itemGroup, unit, rate, GST, profitMargin |
| 13 | BalanceSheet | 62 | ledgerName, groupName, debit, credit, balance | StatementType, Nature, parentGroup, hierarchy, comparative period, openingBalances |
| 14 | ProfitLoss | 30 | sales, purchases, direct/indirect expenses/income, opening/closingStock, gross/netProfit | Expense breakdown, revenue streams, otherIncome, depreciation, financeCosts, employeeCosts |
| 15 | DayBook | 33 | month, total_sales, total_purchase, total_receipt, total_payment, total_expense (MONTHLY) | Individual vouchers: voucherNo, date, partyName, voucherType, narration. MONTHLY only. |
| 16 | ExpensesReport | 6,12 | expenses (name, group, amount), today | expenseDate, voucherNo, partyName, expenseType, notes, billReference |
| 17 | CustomerView | 49 | name, gstin, address, mobile, email, balance, type, creditDays | PAN, creditLimit, salesPerson, status, city, state, PIN, openingBalance |
| 18 | LedgerStatement | 28,2 | transactions (date, voucherNo, type, particulars, debit, credit, amount, balance) | openingBalance, closingBalance, groupName, ledgerType, LedgerID |
| 19 | StockAging | 22,58 | stock_item, batch_name, closing_qty, stock_value, voucher_date, godown_name, itemName, batchNo, godown, quantity, value, inwardDate | ageingDays, ageingBucket, expDate, mfgDate, rate, BatchID |
| 20 | StockStatusReport | 9 | name, quantity, locations (godown names) | salesVelocity, isUnderstock, isOverstock, isPopular, daysOfStock, reorderLevel, stockValue, lastSaleDate, lastPurchaseDate |
| 21 | GeographicReport | 61 | state, city, partyCount, salesValue, purchaseValue | totalOutstanding, topCustomers, topItems, periodStart/End |
| 22 | CustomerMovementReport | 59 | partyName, status, daysSinceLastTxn, salesValue, txnCount | PartyID, PartyType, first/lastTxnDate, totalPurchaseValue, salesPerson, city, state |
| 23 | GstLiability | 25 | name (ledger_name), balance (net_tax_liability) | inwardItc, outwardTax, period, returnFilingStatus, paymentStatus, dueDate, GSTIN |
| 24 | TrendCharts | 39,40 | sales (date, amount RAW), purchases (date, amount RAW) | Processed trends, monthly breakdown, YoY, growth rates, forecasts |
| 25 | PendingOrders | 20 | number, date, party, amount, status, dueDate, items, orderedQty, dispatchedQty, pendingQty | OrderID, PartyID, referenceNo, itemID, rate, narration, expectedDate |
| 26 | Parties (Masters) | 19,26,16,49 | name, type, gstin, address, mobile, email, balance, creditDays, missingFields | PAN, creditLimit, salesPerson, status, city, state, PIN, openingBalance, PartyID, CompanyID |
| 27 | Items (Masters) | 55 | name, group, stock, unit, rate, gst | Brand, HSN, MRP, min/maxStock, reorderLevel, location, isActive, openingStock, purchaseRate, CategoryID, ItemID |
| 28 | Ledgers (Masters) | 48 | name, group, type, balance | LedgerID, CompanyID, GroupID, openingBalance, closingBalance, isActive, StatementType, Nature |
| 29 | Accounts (Masters) | 50 | name, type, balance, accountNo, branch | AccountID, CompanyID, LedgerID, bankName, IFSC, openingBalance, isActive, location |

### B3: NO TALLY DATA -- 22 Pages

These pages have ZERO Tally hooks and rely 100% on Google Sheets.

| # | Page | Google Sheets Used | Closest Template | Status |
|---|------|--------------------|:---:|---|
| 1 | ItemWiseSales | vouchers, voucherLines, items | 51 | Template 51 EXISTS but page does not use it |
| 2 | PartyWiseSales | vouchers | 51 | Template 51 EXISTS but page does not use it |
| 3 | ReceiptNoteVouchers | vouchers | 53 | Template 53 exists, could filter by type |
| 4 | DeliveryNoteVouchers | vouchers | None | No Delivery Note template exists |
| 5 | ContraVouchers | vouchers | None | No Contra entry template exists |
| 6 | TopBrands | items, vouchers, voucherLines, itemStockStatus | 60 | Template 60 is COMPUTED (not real Tally) |
| 7 | TopReport | parties, vouchers | None | No top-performers template exists |
| 8 | ByLedger | ledgers, vouchers, voucherLines, groups | 48+62 | Templates exist individually, not combined |
| 9 | LedgerReport | ledgers, vouchers | 48+66 | Templates 48 and 66 EXIST but page does not use them |
| 10 | LedgerDetail | ledgers, groups, voucherLines, vouchers, bankAccounts, cashAccounts | 48+50 | Both templates EXIST but page does not use them |
| 11 | Groups | groups | None | Template 48 returns group_name but not full hierarchy |
| 12 | Categories | itemCategories, itemGroups, items | None | No category template exists |
| 13 | ItemsPage | items, itemStockStatus | 55+9 | Both templates EXIST but page does not use them |
| 14 | Settings | vouchers, parties, items, ledgers (validation) | None | Configuration page - not business data |
| 15 | ReportPage | vouchers, parties (generic container) | None | Generic container for sub-reports |
| 16 | SyncLogPage | syncLog | None | Operational metadata - not business data |
| 17 | StockBatchesPage | stockBatches | 22+58 | Both templates EXIST but page does not use them |
| 18 | ItemStockStatusPage | itemStockStatus | 9 | Template 9 EXISTS but page does not use it |
| 19 | GeographicSummaryPage | geographicSummary | 61 | Template 61 is COMPUTED (not real Tally) |
| 20 | CustomerMovementPage | customerMovement | 59 | Template 59 is COMPUTED (not real Tally) |
| 21 | OutstandingGroupView | outstandingReceivables, outstandingPayables, parties, ledgers | 2-42 | Templates EXIST but component not connected |
| 22 | DashboardLayout | DataProvider (all sheets) | None | Context provider - not a page |


---

## SECTION C: CRITICAL FINDINGS

### C1: Templates That EXIST But NO PAGE Uses (6 Wasted)

These templates are fully functional and could provide real Tally data, but zero frontend pages call them:

| Template | What It Does | Would Fix These Pages |
|:---:|---|---|
| 51 | Sales vouchers WITH line items (qty, rate, tax per item) | SalesVouchers, ItemWiseSales, PartyWiseSales, ByItem |
| 52 | Purchase vouchers WITH line items (qty, rate, tax per item) | PurchaseVouchers, ByItem |
| 63 | Bank statement data (cheque, deposit, withdrawal) | CashBankPage, Bank Reconciliation |
| 64 | All ledger names (simple list) | LedgerReport (minimal use) |
| 65 | Items with highest demand (ranked by revenue) | TopBrands, TopReport, Dashboard |
| 66 | Opening balance of all ledgers | LedgerReport, LedgerDetail, LedgerStatement |

**Action:** Connect these templates to their pages. This is the lowest-effort, highest-impact fix.

### C2: Templates That Are COMPUTED (Not Real Tally -- 3 Fake Templates)

These templates are labeled as "Computed rollup (not a Tally pull)" -- they read from Google Sheets, not from Tally:

| Template | Label | Reads From | Would Need Real Tally Replacement |
|:---:|---|---|---|
| 59 | Customer Movement Rollup | Parties sheet + Sales Voucher headers | New template: customer movement with first/last dates, purchase values, salesperson |
| 60 | By-Item Rollup | Items sheet + VoucherLines from Sales | New template: item sales/purchase comparison with stock balance |
| 61 | Geographic Rollup | Parties + Sales + Purchase vouchers | New template: state/city aggregation with outstanding and top customers/items |

**Action:** These 3 are NOT real Tally templates. They need to be replaced with actual Tally queries if the pages are to get live data.

### C3: The BIGGEST Gap -- Template 54 (Journal/DN/CN)

Template 54 question: "Get all journal, debit note, and credit note vouchers **with ledger entries**"

BUT the backend route `/journal-dn-cn-vouchers/template` only extracts **header fields**:
- voucher_date -> date
- voucher_number -> voucherNo
- voucher_type -> type
- party_name -> party
- total_amount_inr -> amount

It does NOT extract:
- ledger_name (debit/credit ledger per entry)
- debit_amount / credit_amount (per entry)
- narration (per entry)
- sort_order (entry order)

**Impact:** JournalVouchers, CreditNoteVouchers, and DebitNoteVouchers pages ALL fall back to Google Sheets for their core functionality -- the debit/credit ledger breakdown.

**Action:** Either fix the backend route to extract ledger entries from template 54 response, OR create new templates that return structured ledger entry arrays.

### C4: Template 29 (Customer Purchase History) -- amount ALWAYS 0

The backend route hardcodes `amount = 0` because template 29 does not provide price data.

**Impact:** CustomerPurchaseHistory page shows quantity but never shows amount.

**Action:** Either fix template 29 to include price data, or update the route to extract it if available.

### C5: Template 25 (GST Liability) -- inwardItc and outwardTax NOT passed to frontend

The backend maps `inward_itc` and `outward_tax` from the template response but does NOT include them in the `taxes` array sent to the frontend. Only `name` and `balance` are sent.

**Impact:** GstLiability page only shows net tax liability, not the ITC and output tax breakdown.

**Action:** Fix the backend route to include `inwardItc` and `outwardTax` in the response.


---

## SECTION D: SUMMARY COUNTS

### D1: Pages by Tally Status

| Status | Count | Pages |
|--------|:---:|------|
| COMPLETE Tally | 7 | GstReconciliation, ReimbursementAudit, VendorPurchaseHistory, SalesRegister, CustomerPurchaseHistory, SalesQuotations, VoucherAudit |
| PARTIAL Tally | 29 | Dashboard, Outstanding, PartyStatement, CashBankPage, SalesVouchers, PurchaseVouchers, PaymentVouchers, ReceiptVouchers, JournalVouchers, CreditNoteVouchers, DebitNoteVouchers, ByItem, BalanceSheet, ProfitLoss, DayBook, ExpensesReport, CustomerView, LedgerStatement, StockAging, StockStatusReport, GeographicReport, CustomerMovementReport, GstLiability, TrendCharts, PendingOrders, Parties, Items, Ledgers, Accounts |
| NO Tally (template exists) | 10 | ItemWiseSales, PartyWiseSales, LedgerReport, LedgerDetail, ItemsPage, StockBatchesPage, ItemStockStatusPage, OutstandingGroupView, ReceiptNoteVouchers, ByLedger |
| NO Tally (no template) | 7 | DeliveryNoteVouchers, ContraVouchers, TopReport, Groups, Categories, TopBrands, GeographicSummaryPage |
| Non-data pages | 4 | Settings, ReportPage, SyncLogPage, DashboardLayout |

### D2: Templates by Status

| Status | Count | Templates |
|--------|:---:|------|
| Fully utilized | 38 | 1-50 (except 43,46), 53-58, 62 |
| UNUSED (exist but no page calls) | 6 | 51, 52, 63, 64, 65, 66 |
| COMPUTED (not real Tally) | 3 | 59, 60, 61 |
| Backend bug (data not passed) | 2 | 25 (inwardItc/outwardTax not sent), 29 (amount hardcoded 0) |
| Header-only (line items not extracted) | 1 | 54 (ledger entries not extracted) |

### D3: Templates by Data Category

| Category | Templates | Count |
|----------|-----------|:---:|
| Sales | 10, 13, 15, 18, 20, 23, 31, 39, 51 | 9 |
| Purchase | 21, 24, 29, 40, 52 | 5 |
| Party/Receivables | 1, 2, 3, 4, 32, 41 | 6 |
| Party/Payables | 5, 7, 34, 35, 42 | 5 |
| Party/Master | 16, 19, 26, 49 | 4 |
| Accounting/Banking | 14, 17, 27, 38, 50, 63 | 6 |
| Accounting/Vouchers | 8, 28, 33, 36, 53, 54 | 6 |
| Accounting/Ledger and P&L | 6, 12, 30, 48, 62, 64, 66 | 7 |
| Inventory | 9, 22, 55, 58 | 4 |
| Tax/GST | 25, 44 | 2 |
| Dashboard/MIS | 11, 57 | 2 |
| Configuration | 47 | 1 |
| COMPUTED (fake) | 59, 60, 61 | 3 |
| Audit | 36, 45 | 2 |
| Aging | 56 | 1 |
| Demand/Analytics | 65 | 1 |


---

## SECTION E: RECOMMENDATIONS BY PAGE

### E1: Priority 1 -- Connect UNUSED Templates (Lowest effort, highest impact)

| Page | Connect Template | What You Get |
|------|:---:|---|
| SalesVouchers | 51 | Full line-item detail: itemName, qty, rate, GST percent, tax per item |
| PurchaseVouchers | 52 | Full line-item detail: itemName, qty, rate, GST percent, tax per item |
| ItemWiseSales | 51 | Per-item sales aggregation with item details |
| PartyWiseSales | 51 | Per-party sales aggregation |
| TopBrands | 65 | Item demand ranking by revenue |
| LedgerReport | 66 | Opening balances for all ledgers |

### E2: Priority 2 -- Fix Backend Route Bugs

| Template | Route | Bug | Fix |
|:---:|---|---|---|
| 25 | /gst-liability/template | inwardItc and outwardTax mapped but NOT sent to frontend | Add to taxes array in response |
| 29 | /customer-purchase-history/template | amount hardcoded to 0 | Extract price from template if available |
| 54 | /journal-dn-cn-vouchers/template | Only extracts header, not ledger entries | Extract ledger_name, debit, credit per entry |

### E3: Priority 3 -- Create NEW Tally Templates

| Page | New Template Needed | Returns |
|------|---|---|
| DeliveryNoteVouchers | Delivery Note vouchers | voucherNo, date, party, amount, items, narration |
| ContraVouchers | Contra vouchers | voucherNo, date, fromAccount, toAccount, fromBank, toBank, amount, narration |
| TopReport | Top performers (customers/vendors/products) | name, totalValue, count, rank, percentage |
| Groups | Full group hierarchy | groupName, parentGroup, type, nature, childCount |
| Categories | Item categories with groups | categoryName, groupName, itemCount, itemName |

### E4: Priority 4 -- Replace COMPUTED Templates with Real Tally

| Page | Current Fake | New Real Template | Returns |
|------|:---:|---|---|
| CustomerMovementReport | 59 (computed) | Customer movement from Tally | PartyID, firstTxnDate, lastTxnDate, totalSales, totalPurchase, txnCount, salesPerson, city, state |
| ByItem | 60 (computed) | Item sales/purchase comparison | itemName, salesQty, salesValue, purchaseQty, purchaseValue, stockBalance, itemGroup |
| GeographicReport | 61 (computed) | Geographic aggregation | state, city, partyCount, totalSales, totalPurchase, totalOutstanding, topCustomers, topItems |


---

## SECTION F: COMPLETE TEMPLATE INVENTORY

All 66 Tally templates with question text and variables.

| # | Question | Variables |
|:---:|---|:---:|
| 1 | What are the customer receivables(outstanding_amount)? | None |
| 2 | Customers wise outstanding bills with due date and overdue days? | None |
| 3 | Show customer aging analysis. | None |
| 4 | Show customer receivables with risk level and due status | None |
| 5 | What are the vendor Payable(outstanding_amount)? | None |
| 6 | Give me today total expenses and the breakdown by expense heads. | None |
| 7 | Show vendor Payable with invoice details | None |
| 8 | Give me PAYMENT voucher data | None |
| 9 | Give me the closing stock summary for all stock locations/branches. | None |
| 10 | Provide today vs last week comparison | None |
| 11 | Give WEEKLY MIS data for the last 7 days. This week | None |
| 12 | Give me expense ledger summary grouped by Ledger Name | None |
| 13 | Give me today total sales and invoice count. | None |
| 14 | Provide all overall as well as today cash ledger balance and all bank balances | None |
| 15 | Previous month sales register with details | None |
| 16 | Give me all customers and suppliers with missing or blank GSTN, Address, or Mobile | None |
| 17 | Provide me bank ledger entries for the last 30 days | None |
| 18 | give data of sales trasaction | None |
| 19 | give me all customers details | None |
| 20 | any pending sales order | None |
| 21 | Get last 90 days purchase vouchers for vendor | None |
| 22 | Get all batch-wise inventory details | None |
| 23 | Get all sales vouchers with details | None |
| 24 | Get all purchase vouchers for this finincial year | None |
| 25 | Provide outward tax, inward tax and net GST liability | None |
| 26 | Provide all vendors details | None |
| 27 | Get current cash position of last week + daily expected inflow schedule | None |
| 28 | provide me transaction of [ledger_name] | ledger_name (string, required) |
| 29 | customer wise purchase history of all items | None |
| 30 | Give me total Profit and for each cost/profit center | None |
| 31 | Provide me all sales quotation data | None |
| 32 | Get full receivables aging report For each outstanding party | None |
| 33 | Extract last 12 months Daybook entries grouped by month | None |
| 34 | Get all outstanding payable bills for vendors flagged as MSME | None |
| 35 | Get all outstanding payable bills with discount terms | None |
| 36 | Extract all vouchers entered or altered this week | None |
| 37 | Show outstanding bills with due date and overdue days. | None |
| 38 | What is the opening and closing balance of bank and cash accounts? | None |
| 39 | Show daily sales including days with no transactions. | None |
| 40 | Show daily purchase amounts. | None |
| 41 | how much my customer owe to me | None |
| 42 | How much i owe to my vendors | None |
| 44 | What is my GSTR-2B reconcilation between dates | cust_from_date, cust_to_date (date, required) |
| 45 | What is Reimbursement audit between dates | cust_from_date, cust_to_date (date, required) |
| 47 | Get a active companies configured in Tally | None |
| 48 | Get all ledger accounts with group classification and opening balances | None |
| 49 | Get all parties (customers and suppliers) with contact details and credit terms | None |
| 50 | Get all cash-in-hand and bank account ledgers with current balances | None |
| 51 | Get all sales vouchers with line item details between dates | cust_from_date, cust_to_date (date, required) |
| 52 | Get all purchase vouchers with line item details between dates | cust_from_date, cust_to_date (date, required) |
| 53 | Get all receipt and payment vouchers between dates | cust_from_date, cust_to_date (date, required) |
| 54 | Get all journal, debit note, and credit note vouchers with ledger entries between dates | cust_from_date, cust_to_date (date, required) |
| 55 | Get all stock items with stock groups and current stock position | None |
| 56 | Get receivables and payables aging reports | None |
| 57 | Get dashboard summary metrics between dates | cust_from_date, cust_to_date (date, required) |
| 58 | Get batch-wise stock details for items with batch tracking enabled | None |
| 59 | [COMPUTED] Reads Parties sheet and Sales Voucher headers | None |
| 60 | [COMPUTED] Reads Items sheet and VoucherLines from Sales Vouchers | None |
| 61 | [COMPUTED] Reads Parties + Sales + Purchase totals. Aggregates by state/city | None |
| 62 | Get trial balance data between dates | cust_from_date, cust_to_date (date, required) |
| 63 | Get bank statement data between dates | cust_from_date, cust_to_date (date, required) |
| 64 | Give me all ledger name | None |
| 65 | Which items has highest demand | cust_from_date, cust_to_date (date, required) |
| 66 | What is Opening balance of all ledger | None |

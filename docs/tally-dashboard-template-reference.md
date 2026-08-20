# Tally Dashboard Template Response Reference

Verified against the live Tally connection on 2026-08-19. Every response uses the envelope `{ status, content, message }`.

| Template | Verified `content` fields | Dashboard mapping |
| --- | --- | --- |
| 1 | `party_name`, `outstanding_amount` | Sum `outstanding_amount` for Receivables. |
| 5 | `party_name`, `total_pending_amount` | Sum `total_pending_amount` for Payables. |
| 9 | `stock_item`, `batch_name`, `godown_name`, `closing_qty` | Quantity-only data; does not provide Stock Value. Existing stock-value source remains unchanged. |
| 10 | `today_sales`, `last_week_sales`, `difference_percent` | Sales Comparison card. |
| 11 | `week_start_date`, `week_end_date`, `total_sales_amount`, `total_sales_vouchers`, `total_expense_amount`, `cash_inflow`, `cash_outflow`, `net_cash_flow`, `top_customer_name`, `top_vendor_name` | Weekly MIS card. Nullable amounts are normalized to zero. |
| 13 | `total_sales_invoices`, `total_sales_amount` | Today's Sales KPI and invoice count. |
| 14 | `ledger_name`, `group_name`, `overall_debit_balance`, `overall_credit_balance`, `overall_net_balance`, `today_debit`, `today_credit`, `today_net` | Cash in Hand and Bank Balance KPIs, grouped by `group_name`. |
| 23 | `invoice_number`, `invoice_date`, `invoice_value` | Total Sales KPI. De-duplicate by invoice number/date before summing `invoice_value`, because some invoices have multiple GST/HSN rows. |
| 30 | `sales_accounts`, `purchase_accounts`, `direct_expenses`, `direct_incomes`, `indirect_expenses`, `indirect_incomes`, `opening_stock`, `closing_stock`, `gross_profit`, `net_profit` | Gross Profit and Net Profit KPIs. |

The backend authenticates through the Pucho webhook using the secret query parameter, then calls the Execute Template API. It never returns the `accessToken` or `agentId` to the browser.

## Other verified Tally templates

| Template | Verified `content` fields | Application mapping / status |
| --- | --- | --- |
| 3 | `customer_name`, `ref_no`, `outstanding_balance`, `credit_period`, `overdue_days`, aging buckets, `risk` | Outstanding: customer receivables and aging support. |
| 7 | `party_name`, bill/ref dates, `due_days`, `payable_amount`, aging buckets | Outstanding: vendor payables and aging support. |
| 8 | `voucher_date`, `voucher_number`, `voucher_type`, `ledger_name`, `amount` | Payment Vouchers page. |
| 16 | `ledger_name`, `ledger_group`, `gstin`, `address`, `mobile` | Supplementary party contact data. |
| 19 | `customer_name`, `gstin`, `address`, `mobile`, `email`, `ledger_balance` | Masters > Parties: customers. |
| 20 | sales-order number/date, party, quantities, amount, dispatch status, due date | Pending Orders: sales tab. |
| 22 | `voucher_number`, `voucher_date`, `stock_item`, `batch_name`, `godown_name`, `closing_qty`, `stock_value` | Stock Aging: live stock/batch rows. Date-based age buckets are derived in the app. |
| 25 | `ledger_name`, `opening_balance`, `inward_itc`, `outward_tax`, `net_tax_liability` | GST Liability report. |
| 26 | `ledger_name`, `gstin`, `address`, `mobile`, `email`, `ledger_balance` | Masters > Parties: suppliers. |
| 32 | `party_name`, `mobile`, `max_overdue_days`, `outstanding_amount` | Supplemental Outstanding summary. |
| 37 | bills with party, receivable/payable amount, balance type, due/overdue data and aging buckets | Outstanding: bill-level receivables. |
| 38 | `ledger_name`, `group_name`, `opening_balance`, `closing_balance` | Cash & Bank: live account balances. |
| 39 | `date`, `amount` | Trend Charts: sales series. |
| 40 | `date`, `amount` | Trend Charts: purchase series. |
| 41 | `amount` | Supplemental total receivable validation. |
| 42 | `amount` | Supplemental total payable validation. |

Templates 2, 6, 12, 15, 17, 18, 21, 24, 27, 28 and 33 were evaluated but are not mapped to a page because the live response was empty, fixed-period/aggregate-only, or lacked fields that the existing page needs. Template 9 is retained as quantity-only; the stock-value presentation remains on its existing source.

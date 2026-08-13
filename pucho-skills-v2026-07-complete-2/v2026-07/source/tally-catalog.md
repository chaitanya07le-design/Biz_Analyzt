# Tally Template Catalog (from tallyconnection registry entry)

### tallyconnection  v2.1.5 | None
*Get insights from your Tally data*
**Actions:** `askTally` `ask_tally_template`
`askTally` props:
  tallyconnection★(DROPDOWN) //Select Tally Connection
  query★(LONG_TEXT) //Enter your query
`ask_tally_template` props:
  tallyconnection★(DROPDOWN) //Select Tally Connection
  template★(DROPDOWN) //Select a template question
  variables(DYNAMIC)
**Template catalog (`template` = id below; `variables` fills `<ITEM_NAME>`/`<PARTY_NAME>` placeholders):**
  1: Recent transaction history of <ITEM_NAME>
  2: How much did we spend last month?
  3: Show me latest 5 sales of <ITEM_NAME>
  4: Display recent purchase entries for <ITEM_NAME>
  5: Daily cash collection from customers
  6: List all suppliers with negative balance
  7: Show me customers with outstanding credit balance
  8: Give me a list of all ledger balances.
  9: Top 10 Product Sales
  10: What are the top expenses this month?
  11: <ITEM_NAME> STOCK wise Sale
  12: Who are the top 5 creditors by amount
  13: Who are the top 5 debtors by amount
  14: Stock position of <ITEM_NAME>
  15: Display party wise closing balance summary
  16: What's the closing balance for the Bank account?
  17: Which ledgers have negative balances?
  18: Which inventory items currently have fewer than 10 units in stock?
  19: Show me all items that currently have zero stock on hand.
  20: Find all accounts with negative purchase ledger balance
  21: What percentage of our sales were cash sales versus credit sales?
  27: Party wise Products wise Sale report
  28: Show me vendor wise credit balance report
  29: Last Top 5 sales transaction of <ITEM_NAME>
  30: List of negative closing balance of Purchase Party
  31: <ITEM_NAME> purchase
  32: Show me all Cash ledger transactions for this month
  33: Show me the complete ledger report for all accounts, including opening balances.
  34: Show outstanding bills with due date and overdue days.
  35: Show negative accounts receivable per party.
  36: Show daily cash receipts and payments.
  37: Show parent groups of Loans & Advances (Asset).
  38: Show all child groups under Loans & Advances (Asset).
  39: Show income and expense ledger balances with stock adjustments.
  40: Show daily purchase amounts.
  41: Show monthly purchase amounts.
  42: Show all purchases with party, ledger, and amount.
  43: Show daily sales including days with no transactions.
  44: Show total sales per month including months with no sales.
  45: Show sales register with party and ledger details.
  46: Show stock balances and movements for items.
  47: Show item-wise batch opening balance and transactions.
  48: Show trial balance for all ledgers.
  49: What's the total amount our customers owe us as of today?
  50: What is the current fund position (cash & bank)?
  51: Are there any stock discrepancies or negative stock reports?
  52: Show me products with zero movement in last 2 years
  53: Not moving Inventory since last 1 year
  54: List all purchase vouchers for this month.
  55: What's the total quantity and value of stock returns (sales returns) this year?
  56: Sales performance of <ITEM_NAME>
  57: Product wise Party wise Purchase Report
  58: What is the opening and closing balance of bank and cash accounts?
  59: What are the sales returns recorded in this month.
  60: What is the total purchase for this month
  61: Cash Payment more than 5000
  62: Salary Expenses of this month
  63: List expenses above 50000 in this month
  64: Total Sales Bill created in this month
  65: Top five sales Bill
  66: Give Trial Balances for this year
  67: What is the total outstanding receivable.
  68: What is the trial balance for this financial year
  69: What are the compressed air/diesel/steam usage summaries?
  70: What are the non-operating incomes and their sources?
  71: Show me movement of <ITEM_NAME>
  72: Top 10 Customers Payment Performance Report
  73: Show all vouchers for today.
  74: Who are our debtors and how much do they owe?
  75: Sundry debtors wise Products wise Sale
  76: What's the total stock value we're holding across all items right now?
  77: What are the sales returns recorded in this month.
  78: What is my GST liability?
  79: What is my output GST?
  80: What is my input GST?
  81: What is net GST payable?
  82: What is GST summary for this month?
  83: Compare GST last 3 months
  84: Receivables aging analysis (debtor aging)
  85: Payables aging analysis (creditor aging)
  86: Show ledger statement for <PARTY_NAME>
  87: Monthly sales vs purchase comparison
  88: Show purchase returns (debit notes) for this month
  89: Top 10 customers by sales value this year
  90: Show bank account statement for this month
  91: Show profit and loss summary for this financial year
  92: Show payment voucher register for this month
  93: Show receipt voucher register for this month
  94: Any duplicate entries today?
  95: What is today's net cash flow?
  96: What is today's inflow vs outflow?
  97: What is my gross GST on sales?
  98: What is my net GST on sales?
  99: What is my gross GST on purchase?
  100: What is my net GST on purchase?
  101: What is total TDS deducted?
  102: Any duplicate entries?
  103: Total contra entry with value
  104: Who are top 5 pending payment customers?
  105: How many sales invoices created today?
  106: Which products sold the most today?
  107: Which customers bought today?
  108: What is today's discount given and received?
  109: What purchases were made today?
  111: What is today's purchase value?
  113: What is today's inward stock summary?
  114: What is today's salary payout?
  115: Any advance given to employees today?
  116: Daily petty cash summary
  117: What is today's operational cost?
  118: Which bank transactions happened today?
  119: Which deposits cleared today?
  120: Give me all customers and suppliers with missing or blank GSTN, Address, or Mobile
  121: Bank ledger entries for the last 30 days
  122: Expense ledger summary grouped by Ledger Name
  123: What are the vendor payables (outstanding amount)?
  124: Give me payment voucher data
  125: Any pending sales orders for this financial year?
  126: Give me today's total sales and invoice count
  127: Give me today's total expenses and breakdown by expense heads
  128: Today vs last week sales comparison
  129: Overall and today's cash and bank ledger balances
  130: Previous month sales register with details
  131: Weekly MIS data for the last 7 days
  132: Show vendor payables with invoice details
  133: Get all sales vouchers with details for last financial year.
  134: Show customer aging analysis
  135: Customer wise outstanding bills with due date and overdue days
  136: Full receivables aging report for each outstanding party
  137: Get all purchase vouchers for this financial year
  138: What are the customer receivables (outstanding amount)?
  139: Show customer receivables with risk level and due status
  140: Give data of sales transactions
  141: Give me all customers and suppliers with missing or blank fields
  142: Get last 90 days purchase vouchers for vendors
  143: Give me total profit with P&L component breakdown
  144: Give me the closing stock summary for all stock locations/branches.
  145: Customer wise purchase history of all items
  146: Provide me all sales quotation data
  147: Provide me transactions of all customers
  148: Provide outward tax, inward tax and net GST liability for current quarter
  149: Give me all customer details
  150: Provide all vendor details
  151: Get current cash position of last week also Return daily expected inflow schedule.
  152: Get all batch-wise inventory details

## ★ UTILITY & PROCESSING

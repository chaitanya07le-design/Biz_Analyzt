# Tally Sync Workflows for Pucho Studio

12 automated workflows to sync Tally Prime data directly to Google Sheets for BizAnalyzt.

## Architecture

```
Tally Prime → Pucho Studio Workflows → Google Sheets (Direct Integration)
```

No backend API required. Workflows write directly to Google Sheets using `@puchoaistudio/tool-google-sheets`.

## Files

| # | Filename | Purpose | Schedule | Mode |
|---|----------|---------|----------|------|
| 01 | `01_Tally_Company_Sync.json` | Sync company info & trial balance | Daily at midnight | Overwrite |
| 02 | `02_Tally_Ledger_Sync.json` | Sync groups & ledgers | Every 4 hours | Overwrite |
| 03 | `03_Tally_Party_Sync.json` | Sync customers & suppliers | Every 4 hours | Append |
| 04 | `04_Tally_Cash_Bank_Sync.json` | Sync cash & bank accounts | Hourly | Overwrite |
| 05 | `05_Tally_Sales_Voucher_Sync.json` | Sync sales vouchers & lines | Hourly | Append |
| 06 | `06_Tally_Purchase_Voucher_Sync.json` | Sync purchase vouchers & lines | Hourly | Append |
| 07 | `07_Tally_Receipt_Payment_Sync.json` | Sync receipt & payment vouchers | Hourly | Append |
| 08 | `08_Tally_Adjustment_Voucher_Sync.json` | Sync journal, debit & credit notes | Hourly | Append |
| 09 | `09_Tally_Inventory_Sync.json` | Sync item groups & inventory | Daily at 2 AM | Overwrite |
| 10 | `10_Tally_Outstanding_Sync.json` | Fetch aging reports | Hourly | Read-only |
| 11 | `11_Tally_Dashboard_Refresh.json` | Fetch dashboard metrics | Hourly | Read-only |
| 12 | `12_Tally_Reconciliation.json` | Fetch trial balance & bank statement | Daily at 2:30 AM | Read-only |

## Google Sheet GIDs Reference

Configure your Google Sheet with these sheet IDs:

| Sheet Name | GID | Columns |
|------------|-----|---------|
| Companies | 0 | CompanyID, Name, Address, GSTIN, FinancialYearStart, Currency, IsActive, CreatedAt, UpdatedAt, Version |
| Groups | 580064534 | GroupID, CompanyID, GroupName, GroupType, ParentGroupID, IsSystem, CreatedAt, UpdatedAt, Version |
| Ledgers | 97230470 | LedgerID, CompanyID, LedgerName, GroupID, OpeningBalance, IsSystem, CreatedAt, UpdatedAt, Version |
| Parties | 360235701 | PartyID, CompanyID, PartyName, PartyType, GroupID, ContactPerson, Phone, Email, Address, GSTIN, OpeningBalance, CreditLimit, CreditDays, CreatedAt, UpdatedAt, Version |
| Vouchers | 759847801 | VoucherID, CompanyID, VoucherNo, VoucherType, VoucherDate, PartyID, ReferenceNo, Narration, SubTotal, GSTTotal, RoundOff, GrandTotal, IsDeleted, CreatedAt, UpdatedAt, CreatedBy, UpdatedBy, Version |
| VoucherLines | 620669443 | LineID, VoucherID, LineType, ItemID, LedgerID, Description, Quantity, Rate, Amount, GSTRate, GSTAmount, LedgerDebit, LedgerCredit, SortOrder, CreatedAt, UpdatedAt |
| BankAccounts | 2111437958 | BankID, CompanyID, LedgerID, BankName, AccountNo, AccountType, IFSCCode, BranchName, OpeningBalance, IsActive, CreatedAt, UpdatedAt, Version |
| CashAccounts | 898801878 | CashID, CompanyID, LedgerID, CashType, OpeningBalance, IsActive, CreatedAt, UpdatedAt, Version |
| ItemGroups | 145144998 | ItemGroupID, CompanyID, ItemGroupName, CategoryID, CreatedAt, UpdatedAt, Version |
| Items | 2067663692 | ItemID, CompanyID, ItemName, CategoryID, ItemGroupID, HSNCode, Unit, GSTRate, SaleRate, PurchaseRate, OpeningStock, OpeningValue, ReorderLevel, IsActive, CreatedAt, UpdatedAt, Version |

## Import Instructions

### Step 1: Import Workflow
1. Open **Pucho Studio**: https://studio.pucho.ai
2. Click **+ New Flow** or go to existing project
3. Click **Import** button
4. Select one of the JSON files from this folder
5. Click **Import**

### Step 2: Configure Tally Connection
After import, configure Tally connection:

1. Find any **Ask Tally Template** or **Ask Tally** step
2. Click the step to open settings
3. In the **Tally Connection** field:
   - Select existing Tally connection, OR
   - Click **+ Add New** to create new connection
4. Provide Tally connection details:
   - Host (e.g., `localhost` or IP address)
   - Port (default: `9000`)
5. Click **Save**

### Step 3: Configure Google Sheets Connection
Required for workflows 01-09. Workflows 10-12 are read-only.

1. Find any **Google Sheets** step (Insert Rows, Clear Sheet)
2. Click the step to open settings
3. In the **Auth** field:
   - Click **+ Add New** to create new Google Sheets connection
   - Authorize with your Google account
4. In the **Spreadsheet ID** field:
   - Enter your Google Sheet ID (from URL)
   - Example: `1BxiMVs0XRA5nFMdKvB...` from `https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvB.../edit`
5. Click **Save**

### Step 4: Test Workflow
1. Click **Test** button (top right)
2. Select **Test Trigger** or **Manual Trigger**
3. Verify the test completes successfully
4. Check Google Sheet for new data

### Step 5: Publish & Enable
1. Click **Publish** button (top right)
2. Toggle **Enable** switch to ON
3. Workflow will now run on schedule

## Workflow Modes

### Overwrite Mode (Clear + Insert)
Workflows 01, 02, 04, 09 use overwrite mode:
1. Clear existing sheet data (keeps header row)
2. Insert all fetched records from Tally

Use for master data that should be completely replaced.

### Append Mode (Insert Only)
Workflows 03, 05, 06, 07, 08 use append mode:
1. Insert new records without clearing existing data
2. New rows added to end of sheet

Use for transactional data that accumulates over time.

### Read-Only Mode
Workflows 10, 11, 12 only fetch data:
- No Google Sheets write operations
- Data available in workflow execution output
- Useful for on-demand reporting

## Template IDs Reference

| Template ID | Purpose |
|-------------|---------|
| 48 | Trial Balance |
| 8 | Ledger Balances |
| 149 | Customers |
| 150 | Suppliers |
| 58 | Cash/Bank Balances |
| 133 | Sales Vouchers |
| 137 | Purchase Vouchers |
| 93 | Receipts |
| 92 | Payments |
| 88 | Debit Notes |
| 59 | Credit Notes |
| 46 | Stock Summary |
| 144 | Closing Stock |
| 136 | Receivable Aging |
| 85 | Payable Aging |
| 50 | Cash/Bank Position |
| 91 | Profit & Loss |
| 76 | Stock Value |
| 90 | Bank Statement |

## Troubleshooting

### Workflow Import Fails
- Ensure file extension is `.json`
- Check file is not corrupted
- Try importing one workflow at a time

### Tally Connection Error
- Verify Tally Prime is running
- Check Tally HTTP Gateway is enabled:
  - F1 → Setup → Connectivity → Enable ODBC/HTTP
  - Default port: `9000`
- Verify firewall allows connection
- Test connection manually:
  ```bash
  curl http://localhost:9000
  ```

### Google Sheets Error
- Verify Google Sheets connection is authorized
- Check Spreadsheet ID is correct
- Ensure sheet exists with correct GID
- Verify Google account has edit permissions
- Check if quota limits exceeded

### Workflow Not Running on Schedule
- Ensure workflow is **Published**
- Ensure workflow is **Enabled**
- Check schedule configuration matches expected format
- Verify timezone is correct (Asia/Kolkata)

### Data Not Appearing in Sheets
- Check workflow execution logs for errors
- Verify Google Sheets connection has write permissions
- Ensure sheet GID matches workflow configuration
- Check if Tally returned empty data

## Schedule Summary

| Time | Workflows |
|------|-----------|
| 00:00 | 01 - Company Sync |
| 02:00 | 09 - Inventory Sync |
| 02:30 | 12 - Reconciliation |
| Hourly | 04, 05, 06, 07, 08, 10, 11 |
| Every 4 hours | 02, 03 |

## Notes

- All workflows use `@puchoaistudio/tool-tallyconnection` v2.3.4
- All write workflows use `@puchoaistudio/tool-google-sheets` v2.0.9
- Transformation code uses `@puchoaistudio/tool-code` (TypeScript)
- Tally and Google Sheets connections must be configured after import
- Workflows generate sequential IDs (COMP-0001, VCH-0001, etc.)
- CompanyID defaults to 'COMP-0001' (update if syncing multiple companies)
- Read-only workflows (10, 11, 12) fetch data for on-demand viewing

## Support

For issues or questions:
- Pucho Documentation: https://pucho.ai/documentation
- Tally Integration Help: https://help.tallysolutions.com
- Google Sheets API: https://developers.google.com/sheets/api

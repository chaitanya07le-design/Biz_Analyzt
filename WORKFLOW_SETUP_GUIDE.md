# Tally Party Sync Workflow - Setup Guide

## Workflow Overview
This Pucho workflow syncs party (ledger) master data from Tally Prime to Google Sheets with:
- ✅ Multi-company support (loops through all companies in Companies sheet)
- ✅ Test mode (writes to PartyStaging instead of Party)
- ✅ Smart diffing (only writes changed/new records)
- ✅ Data preservation (never overwrites ContactPerson or blanks existing GSTIN)
- ✅ Version tracking (increments Version on each change)

---

## Prerequisites

### 1. Google Sheets Setup
Create these sheets with the following columns:

#### Companies Sheet (Tab: Companies)
| Column | Header | Example |
|--------|--------|---------|
| A | CompanyID | COMP-0001 |
| B | TallyCompanyName | ABC Traders |
| C | CompanyName | ABC Traders Pvt Ltd |
| D | GSTIN | 27AABCT1234M1Z5 |
| E | Address | Mumbai |
| F | Phone | 9876543210 |

#### Party Sheet (Tab: Party)
| Column | Header | Description |
|--------|--------|-------------|
| A | PartyID | Auto-generated (PTY-0001) |
| B | CompanyID | From Companies sheet |
| C | PartyName | Ledger name from Tally |
| D | PartyType | Customer/Supplier/Both/Unclassified |
| E | GroupID | Group mapping |
| F | ContactPerson | Manual entry (preserved) |
| G | Phone | From Tally |
| H | Email | From Tally |
| I | Address | From Tally |
| J | GSTIN | From Tally (preserved if blank) |
| K | OpeningBalance | From Tally |
| L | CreditLimit | From Tally |
| M | CreditDays | From Tally |
| N | CreatedAt | Auto-generated |
| O | UpdatedAt | Auto-generated |
| P | Version | Auto-incremented |
| Q | TallyGUID | Tally GUID (hidden, match key) |

#### PartyStaging Sheet (Tab: PartyStaging)
Same columns A:Q as Party sheet - for test mode

#### SyncLog Sheet (Tab: SyncLog)
| Column | Header |
|--------|--------|
| A | Timestamp |
| B | Workflow |
| C | NewRecords |
| D | UpdatedRecords |
| E | Status |

#### Groups Sheet (Tab: Groups) - Recommended
| Column | Header |
|--------|--------|
| A | GroupID |
| B | GroupName |
| C | ParentGroup |
| D | Nature |

---

### 2. Tally Configuration

1. Open Tally Prime
2. Go to **Gateway of Tally → F1 Help → Settings → Connectivity**
3. Enable **ODBC/HTTP**: Yes
4. Port: **9000** (default)
5. Ensure Tally is running and company is loaded

---

### 3. Environment Variables in Pucho

Set these in Pucho workflow settings:

```bash
SPREADSHEET_ID=1abc2def3ghi4jkl5mno6pqr7stu8vwx
TALLY_HOST=192.168.1.100
TALLY_PORT=9000
TEST_MODE=true
SIGN_FLIP=false
PARTY_SHEET_GID=123456789
PARTY_STAGING_GID=987654321
GOOGLE_SHEETS_CONNECTION_ID=<your_connection_id>
```

---

## Workflow Steps

### Step 1: Schedule Trigger
- **Cron**: `0 */2 * * *` (every 2 hours)
- **Timezone**: Asia/Kolkata

### Step 2: Read Companies Sheet
- Reads all company mappings from Companies!A:F
- Drives the multi-company loop

### Step 3: Read Party Sheet
- Reads existing Party data (A:Q)
- Creates snapshot for diffing

### Step 4: Init Storage
- Parses companies and existing party data
- Initializes Storage accumulators
- Sets up group mappings

### Step 5: Loop on Companies
- Iterates through each company

### Inside Loop (Steps 6-9):

#### Step 6: Tally Debtors Request
- POST to Tally Gateway (port 9000)
- XML Collection request for Sundry Debtors
- Company name from loop item

#### Step 7: Parse Debtors XML
- Extracts ledger data from XML
- Fields: GUID, NAME, PARENT, ADDRESS, EMAIL, MOBILE, GSTIN, BALANCES, etc.

#### Step 8: Tally Creditors Request
- Same as Step 6 but for Sundry Creditors

#### Step 9: Parse Creditors XML
- Same parser as Step 7

#### Step 10: Merge + Diff + Accumulate
- Merges debtors and creditors (marks duplicates as 'Both')
- Diffs against existing Party snapshot
- Accumulates new/updated rows to Storage
- Preserves manual fields (ContactPerson, existing GSTIN)

### After Loop:

#### Step 11: Format Output
- Reads accumulated results from Storage
- Formats for Google Sheets API

#### Step 12: Write to Sheet
- If TEST_MODE=true: writes to PartyStaging
- If TEST_MODE=false: writes to Party

#### Step 13: Write SyncLog
- Logs summary: timestamp, workflow name, counts, status

---

## Testing Procedure

### Phase 1: Staging Test (TEST_MODE=true)

1. Set `TEST_MODE=true` in environment variables
2. Run workflow manually (don't wait for schedule)
3. Check **PartyStaging** sheet:
   - Verify PartyID format: PTY-0001, PTY-0002, etc.
   - Verify PartyType: Customer/Supplier/Both
   - Verify sign convention for OpeningBalance (suppliers negative)
   - Verify addresses are joined correctly
4. Check **SyncLog** sheet for summary

### Phase 2: Sign Convention Verification

1. In Tally, find one supplier with known credit balance (e.g., -25000)
2. Run workflow
3. Check PartyStaging for that supplier
4. Verify OpeningBalance is **negative** (-25000)
5. If sign is inverted (+25000), set `SIGN_FLIP=true`

### Phase 3: Field Name Verification

If XML parsing returns empty values:
1. Check Tally version - field names may differ
2. Possible variations:
   - `LEDGERMOBILE` vs `PARTYMOBILE`
   - `LEDGERGSTIN` vs `PARTYGSTIN`
3. Parser already includes fallbacks, but may need adjustment

### Phase 4: Production Test (TEST_MODE=false)

1. Set `TEST_MODE=false`
2. Run workflow
3. Check **Party** sheet (live data)
4. Verify:
   - New records appended at bottom
   - Updated records modified in-place (same row)
   - ContactPerson not blanked
   - Existing GSTIN not blanked
   - Version incremented correctly

### Phase 5: Scheduled Run

1. Verify schedule is correct: every 2 hours
2. Monitor first 2-3 scheduled runs
3. Check SyncLog each time
4. Verify no errors in Pucho execution logs

---

## Data Preservation Rules

The workflow **never overwrites**:
- **ContactPerson** - Manual entry only, Tally doesn't have this
- **Existing GSTIN** - If Tally has blank GSTIN, keep existing value

The workflow **always updates**:
- PartyName, Phone, Email, Address
- OpeningBalance, CreditLimit, CreditDays
- PartyType (if debtor/creditor status changes)
- UpdatedAt, Version

---

## Sign Convention

Tally typically returns:
- **Dr balances as positive** (+50000)
- **Cr balances as negative** (-25000)

This matches how suppliers should appear in your sheet.

**If signs are inverted**, set `SIGN_FLIP=true`.

---

## Troubleshooting

### Empty PartyStaging Sheet
- Check Tally connection: `telnet <TALLY_HOST> 9000`
- Check company names match exactly in Companies sheet
- Check Tally Gateway is enabled (F1 → Connectivity)
- Check Pucho execution logs for HTTP errors

### Wrong PartyType Values
- Verify PARENT group name in Tally
- Check groupMap in Step 4 code
- Add missing group mappings

### Duplicate Records
- Check TallyGUID column Q is populated
- Verify GUID is unique per ledger per company
- Check for cross-company GUID collisions (rare)

### Version Not Incrementing
- Ensure Version column is numeric (not text)
- Check Version field in code

### Address Shows Single Line
- Tally may return `<ADDRESS.LIST>` differently
- Adjust address parser regex if needed

---

## Workflow Architecture

```
Schedule Trigger (every 2h)
    ↓
Read Companies Sheet
    ↓
Read Party Sheet (snapshot)
    ↓
Init Storage (accumulators)
    ↓
Loop on Companies
    ├→ Tally Debtors Request
    ├→ Parse Debtors XML
    ├→ Tally Creditors Request
    ├→ Parse Creditors XML
    └→ Merge + Diff + Accumulate
    ↓
Format Output
    ↓
Write to Sheet (test/prod)
    ↓
Write SyncLog
```

---

## Next Steps

After this workflow is working:

1. **Groups Sync Workflow** - Sync Groups sheet from Tally (prerequisite)
2. **Ledger Sync Workflow** - Sync all ledgers (not just parties)
3. **Voucher Sync Workflow** - Sync transactions
4. **Item Sync Workflow** - Sync inventory items
5. **Dashboard KPI Workflow** - Calculate metrics from synced data

---

## Support

If you encounter issues:
1. Check Pucho execution logs
2. Check SyncLog sheet
3. Verify Tally connection
4. Verify Google Sheets API access
5. Check environment variables

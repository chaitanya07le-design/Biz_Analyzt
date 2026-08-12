# Backend Schema
## Multi-Company Accounting & Inventory Management App

---

## 1. Master Spreadsheet Overview

**Structure:** One master Google Spreadsheet with 15 tabs.

| Tab # | Tab Name | CompanyID Filter |
|---|---|---|
| 1 | Companies | No |
| 2 | Users | No |
| 3 | UserCompanyMapping | No |
| 4 | Groups | Yes |
| 5 | Ledgers | Yes |
| 6 | Parties | Yes |
| 7 | ItemCategories | Yes |
| 8 | ItemGroups | Yes |
| 9 | Items | Yes |
| 10 | Vouchers | Yes |
| 11 | VoucherLines | Yes (via VoucherID) |
| 12 | BankAccounts | Yes |
| 13 | CashAccounts | Yes |
| 14 | Settings | Yes |
| 15 | ReminderLog | Yes |

---

## 2. Tab Schemas

### 2.1 Companies
| Column | Type | Required |
|---|---|---|
| CompanyID | String | Yes |
| Name | String | Yes |
| Address | String | No |
| GSTIN | String | No |
| FinancialYearStart | String | Yes |
| Currency | String | Yes |
| IsActive | Boolean | Yes |
| CreatedAt | DateTime | Yes |
| UpdatedAt | DateTime | Yes |
| Version | Integer | Yes |

### 2.2 Users
| Column | Type | Required |
|---|---|---|
| UserID | String | Yes |
| Name | String | Yes |
| Email | String | Yes |
| PasswordHash | String | Yes |
| Phone | String | No |
| IsActive | Boolean | Yes |
| CreatedAt | DateTime | Yes |
| UpdatedAt | DateTime | Yes |
| Version | Integer | Yes |

### 2.3 UserCompanyMapping
| Column | Type | Required |
|---|---|---|
| MappingID | String | Yes |
| UserID | String | Yes |
| CompanyID | String | Yes |
| Permissions | JSON | Yes |
| CreatedAt | DateTime | Yes |
| UpdatedAt | DateTime | Yes |

### 2.4 Groups
| Column | Type | Required |
|---|---|---|
| GroupID | String | Yes |
| CompanyID | String | Yes |
| GroupName | String | Yes |
| GroupType | Enum | Yes |
| ParentGroupID | String | No |
| IsSystem | Boolean | Yes |
| CreatedAt | DateTime | Yes |
| UpdatedAt | DateTime | Yes |
| Version | Integer | Yes |

### 2.5 Ledgers
| Column | Type | Required |
|---|---|---|
| LedgerID | String | Yes |
| CompanyID | String | Yes |
| LedgerName | String | Yes |
| GroupID | String | Yes |
| OpeningBalance | Decimal | Yes |
| IsSystem | Boolean | Yes |
| CreatedAt | DateTime | Yes |
| UpdatedAt | DateTime | Yes |
| Version | Integer | Yes |

### 2.6 Parties
| Column | Type | Required |
|---|---|---|
| PartyID | String | Yes |
| CompanyID | String | Yes |
| PartyName | String | Yes |
| PartyType | Enum | Yes |
| GroupID | String | No |
| ContactPerson | String | No |
| Phone | String | No |
| Email | String | No |
| Address | String | No |
| GSTIN | String | No |
| OpeningBalance | Decimal | Yes |
| CreditLimit | Decimal | No |
| CreditDays | Integer | No |
| CreatedAt | DateTime | Yes |
| UpdatedAt | DateTime | Yes |
| Version | Integer | Yes |

### 2.7 ItemCategories
| Column | Type | Required |
|---|---|---|
| CategoryID | String | Yes |
| CompanyID | String | Yes |
| CategoryName | String | Yes |
| CreatedAt | DateTime | Yes |
| UpdatedAt | DateTime | Yes |
| Version | Integer | Yes |

### 2.8 ItemGroups
| Column | Type | Required |
|---|---|---|
| ItemGroupID | String | Yes |
| CompanyID | String | Yes |
| ItemGroupName | String | Yes |
| CategoryID | String | No |
| CreatedAt | DateTime | Yes |
| UpdatedAt | DateTime | Yes |
| Version | Integer | Yes |

### 2.9 Items
| Column | Type | Required |
|---|---|---|
| ItemID | String | Yes |
| CompanyID | String | Yes |
| ItemName | String | Yes |
| CategoryID | String | No |
| ItemGroupID | String | No |
| HSNCode | String | No |
| Unit | String | Yes |
| GSTRate | Decimal | Yes |
| SaleRate | Decimal | No |
| PurchaseRate | Decimal | No |
| OpeningStock | Decimal | Yes |
| OpeningValue | Decimal | No |
| ReorderLevel | Decimal | No |
| IsActive | Boolean | Yes |
| CreatedAt | DateTime | Yes |
| UpdatedAt | DateTime | Yes |
| Version | Integer | Yes |

### 2.10 Vouchers
| Column | Type | Required |
|---|---|---|
| VoucherID | String | Yes |
| CompanyID | String | Yes |
| VoucherNo | String | Yes |
| VoucherType | Enum | Yes |
| VoucherDate | Date | Yes |
| PartyID | String | No |
| ReferenceNo | String | No |
| Narration | String | No |
| SubTotal | Decimal | Yes |
| GSTTotal | Decimal | Yes |
| RoundOff | Decimal | No |
| GrandTotal | Decimal | Yes |
| IsDeleted | Boolean | Yes |
| CreatedAt | DateTime | Yes |
| UpdatedAt | DateTime | Yes |
| CreatedBy | String | Yes |
| UpdatedBy | String | Yes |
| Version | Integer | Yes |

### 2.11 VoucherLines
| Column | Type | Required |
|---|---|---|
| LineID | String | Yes |
| VoucherID | String | Yes |
| LineType | Enum | Yes |
| ItemID | String | No |
| LedgerID | String | No |
| Description | String | No |
| Quantity | Decimal | No |
| Rate | Decimal | No |
| Amount | Decimal | Yes |
| GSTRate | Decimal | No |
| GSTAmount | Decimal | No |
| LedgerDebit | Decimal | No |
| LedgerCredit | Decimal | No |
| SortOrder | Integer | Yes |
| CreatedAt | DateTime | Yes |
| UpdatedAt | DateTime | Yes |

### 2.12 BankAccounts
| Column | Type | Required |
|---|---|---|
| BankID | String | Yes |
| CompanyID | String | Yes |
| LedgerID | String | Yes |
| BankName | String | Yes |
| AccountNo | String | Yes |
| AccountType | Enum | Yes |
| IFSCCode | String | No |
| BranchName | String | No |
| OpeningBalance | Decimal | Yes |
| IsActive | Boolean | Yes |
| CreatedAt | DateTime | Yes |
| UpdatedAt | DateTime | Yes |
| Version | Integer | Yes |

### 2.13 CashAccounts
| Column | Type | Required |
|---|---|---|
| CashID | String | Yes |
| CompanyID | String | Yes |
| LedgerID | String | Yes |
| CashType | Enum | Yes |
| OpeningBalance | Decimal | Yes |
| IsActive | Boolean | Yes |
| CreatedAt | DateTime | Yes |
| UpdatedAt | DateTime | Yes |
| Version | Integer | Yes |

### 2.14 Settings
| Column | Type | Required |
|---|---|---|
| SettingID | String | Yes |
| CompanyID | String | Yes |
| SettingKey | Enum | Yes |
| SettingValue | JSON | Yes |
| CreatedAt | DateTime | Yes |
| UpdatedAt | DateTime | Yes |

### 2.15 ReminderLog
| Column | Type | Required |
|---|---|---|
| ReminderID | String | Yes |
| CompanyID | String | Yes |
| PartyID | String | Yes |
| VoucherID | String | No |
| Channel | Enum | Yes |
| SentAt | DateTime | Yes |
| Status | Enum | Yes |
| ErrorMessage | String | No |
| CreatedAt | DateTime | Yes |

---

## 3. Voucher Numbering

| VoucherType | Prefix | Format |
|---|---|---|
| Sales | SAL | SAL-0000001 |
| Purchase | PUR | PUR-0000001 |
| Receipt | REC | REC-0000001 |
| Payment | PAY | PAY-0000001 |
| Delivery Note | DN | DN-0000001 |
| Receipt Note | RN | RN-0000001 |
| Journal | JRN | JRN-0000001 |
| Contra | CON | CON-0000001 |
| Debit Note | DBN | DBN-0000001 |
| Credit Note | CRN | CRN-0000001 |

---

## 4. Default Data Seeding

On Company Creation:
- 16 system Groups
- Cash, Petty Cash, P&L A/c ledgers
- Cash and Petty Cash accounts
- All 9 settings with defaults

---

## 5. Ambiguities

1. VoucherLine mixed Item/Ledger handling
2. OpeningBalance sign convention
3. ReminderLog retention period
4. Multi-currency handling

---

**Document Status:** Complete

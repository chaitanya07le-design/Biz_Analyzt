#!/usr/bin/env python3
"""
Fix PartyName and Narration placeholders in Vouchers.csv.

Reads Vouchers.csv and Parties.csv (downloaded from Google Sheets),
replaces "Party PTY-xxxx" placeholders with real party names,
writes corrected Vouchers.csv.

Usage: python scripts/fix_placeholder_names.py
"""

import csv
import re
import os
import sys

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOUCHERS_SRC = os.path.join(BASE_DIR, 'gs_vouchers.csv')
PARTIES_SRC = os.path.join(BASE_DIR, 'gs_parties.csv')
VOUCHERS_DST = os.path.join(BASE_DIR, 'seed_data_output', 'Vouchers.csv')

PLACEHOLDER_RE = re.compile(r'^Party PTY-\d+$')
PLACEHOLDER_IN_TEXT_RE = re.compile(r'Party PTY-\d+')

def load_parties(path):
    """Build PartyID -> PartyName lookup map."""
    party_map = {}
    with open(path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            pid = row.get('PartyID', '').strip()
            name = row.get('PartyName', '').strip()
            if pid:
                party_map[pid] = name
    print(f"Loaded {len(party_map)} parties from Parties.csv")
    return party_map

def fix_vouchers(vouchers_path, party_map, output_path):
    """Read vouchers, fix placeholders, write corrected output."""
    fixed_count = 0
    narration_fixed = 0
    total = 0
    
    with open(vouchers_path, 'r', encoding='utf-8') as f_in:
        reader = csv.DictReader(f_in)
        fieldnames = reader.fieldnames
        
        rows = []
        for row in reader:
            total += 1
            changed = False
            
            party_name = row.get('PartyName', '').strip()
            narration = row.get('Narration', '').strip()
            party_id = row.get('PartyID', '').strip()
            
            # Fix PartyName if it's a placeholder
            if party_name and PLACEHOLDER_RE.match(party_name):
                if party_id and party_id in party_map:
                    row['PartyName'] = party_map[party_id]
                    changed = True
                    fixed_count += 1
                else:
                    print(f"  WARNING: No real name for {party_id} (voucher {row['VoucherID']})")
            
            # Fix Narration - replace "Party PTY-xxxx" with real name
            if party_name and PLACEHOLDER_RE.match(party_name):
                # We already know the original placeholder name and the real name
                if party_id and party_id in party_map:
                    old_name = party_name  # "Party PTY-0001"
                    new_name = party_map[party_id]
                    if old_name in narration:
                        row['Narration'] = narration.replace(old_name, new_name)
                        narration_fixed += 1
            elif PLACEHOLDER_IN_TEXT_RE.search(narration):
                # Narration has placeholder but PartyName doesn't (edge case)
                match = PLACEHOLDER_IN_TEXT_RE.search(narration)
                placeholder = match.group(0)
                # Extract PTY-xxxx from the placeholder
                pty_id = placeholder.replace('Party ', '')
                if pty_id in party_map:
                    row['Narration'] = narration.replace(placeholder, party_map[pty_id])
                    narration_fixed += 1
            
            rows.append(row)
    
    # Write corrected file
    with open(output_path, 'w', encoding='utf-8', newline='') as f_out:
        writer = csv.DictWriter(f_out, fieldnames=fieldnames, quoting=csv.QUOTE_MINIMAL)
        writer.writeheader()
        writer.writerows(rows)
    
    print(f"\nTotal vouchers processed: {total}")
    print(f"PartyName placeholders fixed: {fixed_count}")
    print(f"Narration placeholders fixed: {narration_fixed}")
    print(f"Output written to: {output_path}")
    
    return fixed_count, narration_fixed

def verify(output_path):
    """Verify no placeholders remain."""
    with open(output_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        remaining = []
        for row in reader:
            pn = row.get('PartyName', '')
            if pn and PLACEHOLDER_RE.match(pn.strip()):
                remaining.append(row['VoucherID'])
    if remaining:
        print(f"\nWARNING: {len(remaining)} vouchers still have placeholder PartyName!")
        for v in remaining[:10]:
            print(f"  {v}")
    else:
        print("\nVERIFIED: Zero placeholder PartyNames remain in output.")
    return len(remaining)

def main():
    if not os.path.exists(VOUCHERS_SRC):
        print(f"ERROR: {VOUCHERS_SRC} not found. Run download first.")
        sys.exit(1)
    if not os.path.exists(PARTIES_SRC):
        print(f"ERROR: {PARTIES_SRC} not found. Run download first.")
        sys.exit(1)
    
    print("=== Fixing Placeholder Names in Vouchers.csv ===\n")
    
    party_map = load_parties(PARTIES_SRC)
    
    fixed, nar_fixed = fix_vouchers(VOUCHERS_SRC, party_map, VOUCHERS_DST)
    
    remaining = verify(VOUCHERS_DST)
    
    if remaining == 0:
        print("\nDone. You can now import seed_data_output/Vouchers.csv into Google Sheets.")
    else:
        print("\nDone with warnings. Review the output before importing.")
        sys.exit(1)

if __name__ == '__main__':
    main()
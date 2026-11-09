"""Session 5 part 2 - audit C, 100 token requirement sets (N64 and 3DS) against the OoT Randomizer LOCATION rule (glitchless, tricks off).
Compares the TOOLS only: tools named in the location's own rule vs tools named in any option of the tracker row's own requirement (explicit
ids only; story ancestors are not counted, project policy). Region/entrance rules are not evaluated (the story ancestors of the row
stand in for them), so a rule tool that comes from the region is out of scope. Output: testlogs/data_audit_s5b.json (every row with its two
tool sets and a status). Exit 1 if any mismatch is NOT in the reviewed list REVIEWED (so every new difference must be triaged)."""
import json, re, sys, os
A = '/home/claude/audit'
SRC = open(A + '/scripts/data_audit_s5.py').read().split('def check(')[0]
sys.argv = ['x', A]
exec(SRC)       # D, R, RL, res, table, closure, opts, GS, split_or, rando_age
T = table('n64')
TOOL = {'IT-12': 'Slingshot', 'IT-13': 'Bow', 'IT-14': 'Boomerang', 'IT-15': 'Hammer', 'IT-16': 'Hookshot', 'IT-17': 'Longshot', 'IT-18': 'Lens',
        'IT-22': 'Dins', 'IT-26': 'FireArrows', 'IT-27': 'IceArrows', 'IT-10': 'IronBoots', 'IT-11': 'HoverBoots', 'IT-9': 'ZoraTunic', 'IT-8': 'GoronTunic',
        'IT-7': 'MirrorShield', 'IT-35': 'Bombs', 'IT-21': 'Magic', 'IT-32': 'SilverScale', 'IT-33': 'GoldenScale', 'IT-29': 'Bracelet', 'IT-30': 'SilverGauntlets', 'IT-31': 'GoldenGauntlets'}
RULE = [(r'\bBoomerang\b', 'Boomerang'), (r'\bHookshot\b', 'Hookshot'), (r'\bLongshot\b', 'Longshot'), (r'Megaton_Hammer|can_break_crate|\bHammer\b', 'Hammer'), (r'\bSlingshot\b', 'Slingshot'),
        (r'\bBow\b', 'Bow'), (r'Dins_Fire', 'Dins'), (r'Fire_Arrows', 'FireArrows'), (r'Ice_Arrows', 'IceArrows'), (r'Lens_of_Truth', 'Lens'), (r'Hover_Boots', 'HoverBoots'),
        (r'Iron_Boots', 'IronBoots'), (r'Zora_Tunic', 'ZoraTunic'), (r'Goron_Tunic', 'GoronTunic'), (r'Mirror_Shield', 'MirrorShield'), (r'has_explosives|\bBombs\b|Bomb_Bag', 'Bombs'),
        (r'Silver_Scale|Gold_Scale|Scale', 'Scale'), (r'Progressive_Strength|Goron_Bracelet|Strength', 'Strength')]
def strip_tricks(rule):
    """tricks are off in glitchless logic: drop every parenthesised group, and every 'logic_x [and ...]' term, that mentions a logic_ setting"""
    prev = None
    while prev != rule:
        prev = rule
        rule = re.sub(r'\([^()]*logic_[^()]*\)', 'False', rule)
    rule = re.sub(r'logic_\w+ or ', '', rule); rule = re.sub(r'\bor logic_\w+', '', rule)
    return rule
def rule_tools(rule):
    rule = strip_tricks(rule)
    # drop the age/time words; for "a or b" keep both options as alternatives (set of everything named)
    return {n for pat, n in RULE if re.search(pat, rule)}
rows = {}
for tid, loc in GS.items():
    if tid not in T: continue
    rule = RL[loc]['rule'] if loc in RL else ''
    tr = set()
    for c in T[tid].get('q') or []:
        for o in c:
            for i in o:
                if i in TOOL: tr.add(TOOL[i])
    rt = rule_tools(rule)
    reg = RL[loc].get('region') if loc in RL else None
    rg = set()
    for src, rr in (R['entrances'].get(reg) or {}).items(): rg |= rule_tools(rr)      # one level of incoming region rules
    age = T[tid].get('age')
    CHILD_ONLY = {'Boomerang', 'Slingshot'}; ADULT_ONLY = {'Hookshot', 'Longshot', 'Bow', 'Hammer', 'HoverBoots', 'IronBoots', 'MirrorShield', 'FireArrows', 'IceArrows'}
    if age == 'Adult': rt -= CHILD_ONLY
    if age == 'Child': rt -= ADULT_ONLY
    if 'Scale' in rt: rt = (rt - {'Scale'}) | {'SilverScale'}
    rows[tid] = {'loc': loc, 'rule': rule[:160], 'rule_tools': sorted(rt), 'tracker_tools': sorted(tr),
                 'age': age, 'region': reg, 'region_tools': sorted(rg), 'only_in_rule': sorted(rt - tr - {'Strength'}), 'only_in_tracker': sorted(tr - rt - rg)}
bad = {k: v for k, v in rows.items() if v['only_in_rule'] or v['only_in_tracker']}
json.dump({'rows': rows, 'mismatches': sorted(bad)}, open(A + '/testlogs/data_audit_s5b.json', 'w'), indent=1)
print(len(rows), 'rows compared;', len(bad), 'with a difference')
for k, v in sorted(bad.items()): print(k, v['age'], '| rule:', v['rule_tools'], '| tracker:', v['tracker_tools'], '| rule only:', v['only_in_rule'], '| tracker only:', v['only_in_tracker'], '|', v['rule'][:90])
REV = json.load(open(A + '/testlogs/data_audit_s5b_reviewed.json'))
new = sorted(set(bad) - set(REV))
stale = sorted(set(REV) - set(bad))
open_def = sorted(k for k in bad if REV.get(k, {}).get('class') in ('known_defect', 'probable_defect'))
from collections import Counter
print('classes:', dict(Counter(REV[k]['class'] for k in bad if k in REV)))
print('unreviewed:', new, '| reviewed but no longer different:', stale, '| open defect rows:', open_def)
sys.exit(1 if (new or open_def) else 0)   # exit 1 while defects are open (same convention as data_audit_s5.py)

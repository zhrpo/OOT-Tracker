import re
def sub(path, old, new, count=1):
    s = open(path).read()
    assert s.count(old) == count, (path, s.count(old), old[:70])
    s = s.replace(old, new)
    open(path, "w").write(s)

# ---------------- extra.py ----------------
sub("extra.py", "def r(key, name, kind, age, time, avail, start, reward, guide, req=(), gives=(), only=None, v=None, short=None):",
    "def r(key, name, kind, age, time, avail, start, reward, guide, req=(), gives=(), only=None, v=None, short=None, late=False):")
sub("extra.py", "    if short:\n        d[\"short\"] = short\n    return d",
    "    if short:\n        d[\"short\"] = short\n    if late:\n        d[\"late\"] = True\n    return d")

sub("extra.py",
 """          "Burns webs and enemies around you", ["Bomb the wall near the castle, play Zelda's Lullaby and ask the fairy."], req=["i_bombs", "s_lullaby", "i_magic"]),""",
 """          "Burns webs and enemies around you", ["Bomb the wall near the castle, play Zelda's Lullaby and ask the fairy."], req=["i_bombs", "s_lullaby", "i_magic"],
          v={"sw2": {"start": "Great Fairy on Death Mountain Trail, beside the owl near the summit. On Switch 2 it is the same fairy that gives the Magic Meter.",
                     "avail": "After Dodongo's Cavern and Zelda's Lullaby",
                     "guide": ["Bomb the wall next to the owl at the summit, step on the Triforce mark and play Zelda's Lullaby.",
                               "Switch 2: the fairy asks for a rupee offering (25) and gives you Din's Fire together with the Magic Meter."],
                     "_req": ["i_bombs", "s_lullaby"],
                     "note": "Switch 2 moved Din's Fire to the Death Mountain Trail fairy. The Hyrule Castle fairy now gives the stronger spin attack instead."}}),
        r("i_spin", "Improved Spin Attack", "Upgrade", "Child", "Any", "After Dodongo's Cavern and Zelda's Lullaby", "Great Fairy on Death Mountain Trail, beside the owl near the summit.",
          "A stronger charged spin attack. Not needed to finish the game",
          ["Bomb the wall next to the owl at the summit, step on the Triforce mark and play Zelda's Lullaby. The same fairy gives you the Magic Meter."],
          req=["i_bombs", "s_lullaby"], late=True,
          v={"sw2": {"start": "Great Fairy on the path to Hyrule Castle. From the Market, climb the vines beside the main path and jump past the gate.",
                     "reward": "A stronger charged spin attack. Optional on Switch 2",
                     "guide": ["From the Market, climb the vines on the cliff beside the main path and jump past the gate.",
                               "Head right to the rocky alcove, bomb the boulder and crawl in.",
                               "Stand on the Triforce mark and play Zelda's Lullaby. Switch 2: the fairy asks for a rupee offering (50)."],
                     "_req": ["i_bombs", "s_lullaby"],
                     "note": "On N64 and 3DS the Death Mountain Trail fairy gives this together with the Magic Meter. On Switch 2 the Hyrule Castle fairy gives it, and Din's Fire comes from the Death Mountain Trail fairy."}}),""")

sub("extra.py",
 """          v={"sw2": {"note": "Your starting wallet already holds 200 rupees on Switch 2. The sizes of the upgrades are not confirmed."}}),
        r("i_wallet3\"""",
 """          v={"sw2": {"name": "Adult's Wallet (holds 500)", "reward": "Carry 500 rupees",
                     "note": "Your starting wallet already holds 200 rupees on Switch 2, so the upgrades are bigger. Respec and How To Video Game list 500 here and 1,000 for the Giant's Wallet. RPG Site lists the Adult's Wallet differently, which looks like a copy of the N64 size."}}),
        r("i_wallet3\"""")
sub("extra.py",
 """          "Carry 500 rupees", ["Collect 30 tokens and talk to the villager."], req=["GS:30"],
          v={"sw2": {"note": "Your starting wallet already holds 200 rupees on Switch 2. The sizes of the upgrades are not confirmed."}}),""",
 """          "Carry 500 rupees", ["Collect 30 tokens and talk to the villager."], req=["GS:30"],
          v={"sw2": {"name": "Giant's Wallet (holds 1,000)", "reward": "Carry 1,000 rupees",
                     "note": "Your starting wallet already holds 200 rupees on Switch 2, so the upgrades are bigger. Respec and How To Video Game list 500 for the Adult's Wallet and 1,000 here."}}),""")
sub("extra.py", "Win the diving game, dive through the cave across from the waterfall, and take the bottle.",
    "Win the diving game for the Silver Scale, swim through the underwater tunnel in the Domain pool to Lake Hylia, and dive for the bottle near the shore.")
print("extra ok")

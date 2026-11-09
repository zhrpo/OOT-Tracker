def sub(path, old, new, count=1):
    s = open(path).read()
    assert s.count(old) == count, (path, s.count(old), old[:70])
    s = s.replace(old, new)
    open(path, "w").write(s)

sub("main.py", "def m(key, name, kind, age, avail, start, reward, guide, after=(), gives=(), short=None, time=\"Any\"):\n    return dict(key=key, name=name, kind=kind, age=age, time=time, avail=avail, start=start, reward=reward,\n                guide=list(guide), after=list(after), gives=list(gives), short=short or name)",
 "def m(key, name, kind, age, avail, start, reward, guide, after=(), gives=(), short=None, time=\"Any\", v=None):\n    d = dict(key=key, name=name, kind=kind, age=age, time=time, avail=avail, start=start, reward=reward,\n             guide=list(guide), after=list(after), gives=list(gives), short=short or name)\n    if v:\n        d[\"v\"] = v\n    return d")

sub("main.py", "\"Zora's Domain: a diving game, then the underwater cave across from the waterfall.\",",
    "\"Zora's Domain: win the diving game, then swim through the underwater tunnel in the pool to Lake Hylia.\",")

sub("main.py",
 """           "Din's Fire is required later: it opens the Shadow Temple entrance."],
          after=["dodongo", "zelda"], gives=["SQ-19", "SQ-20"], short="Din's Fire"),""",
 """           "Din's Fire is required later: it opens the Shadow Temple entrance."],
          after=["dodongo", "zelda"], gives=["SQ-19", "SQ-20"], short="Din's Fire",
          v={"sw2": {"name": "Magic Meter and Din's Fire (Great Fairy)",
                     "start": "Death Mountain Trail summit, behind a cracked wall next to the owl. Needs bombs. Switch 2: the fairy asks for a rupee offering (25). The Hyrule Castle fairy is optional here: it now gives the stronger spin attack.",
                     "reward": "Magic Meter and Din's Fire",
                     "guide": ["Bomb the wall next to the owl at the top of Death Mountain Trail, step on the Triforce symbol and play Zelda's Lullaby. This one fairy gives both the Magic Meter and Din's Fire on Switch 2.",
                               "Optional: the Hyrule Castle fairy (vines past the gate, bomb the boulder) gives the stronger spin attack for 50 rupees.",
                               "Din's Fire is required later: it opens the Shadow Temple entrance."],
                     "gives": ["SQ-19"]}}),""")
print("main ok")

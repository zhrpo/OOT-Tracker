import json, os, re, sys, copy
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from data import SKULL, HEART, SKULL_DEFAULTS, SOURCES
import regroup
SKULL = regroup.regroup(SKULL)
HEART = regroup.regroup(HEART)
from side import SIDE, SIDE_SOURCES
from vers import VERS, ONLY, OV, GNOTE, VNOTES, VSOURCES, house_of_skulltula
from main import MAIN, PARTIAL
from extra import SONGS, ITEMS, SUBS
from gate import ALIAS, BOTTLE, GATE, GATE_V, ADULT
from links import LINKS, HEART_FROM_QUEST, BOTH, BOTH_V, DERIVED
from areas import AREA
from dungeons import DSUBS
from vnew import VN_NEW, NEW_SOURCES, TABS_CFG
import fix4  # round-4 corrections: patches the dicts imported above in place
LINKS = fix4.LINKS

VKEYS = [x["k"] for x in VERS]


# ---------------------------------------------------------------- the three original lists
def overrides_for(row):
    ov = copy.deepcopy(OV.get(row["id"], {}))
    if row["id"] == "SQ-17":
        for v in ("3ds", "sw2"):
            ov[v] = house_of_skulltula(row, v)
    for v, o in list(ov.items()):
        add = o.pop("guide_add", None)
        if add:
            o["guide"] = list(o.get("guide", row.get("guide", []))) + add
    return ov


def attach(row):
    ov = overrides_for(row)
    if row["id"] in BOTH:
        row["age"] = "Both"
        row["ages"] = BOTH[row["id"]]
    for (v, i), hint in BOTH_V.items():
        if i == row["id"]:
            ov.setdefault(v, {})
            ov[v]["age"] = "Both"
            ov[v]["ages"] = hint
    for (v, i), req in GATE_V.items():
        if i == row["id"]:
            ov.setdefault(v, {})
            ov[v]["_req"] = req
    ov = {v: o for v, o in ov.items() if o or v in ()}
    if ov:
        row["v"] = ov
    if row["id"] in ONLY:
        row["only"] = ONLY[row["id"]]
    return row


def pack(groups):
    out = []
    for name, note, rows in groups:
        out.append({"name": name, "note": note,
                    "rows": [attach(dict(id=r[0], where=r[1], how=r[2], age=r[3], time=r[4])) for r in rows]})
    return out


def pack_side(groups):
    out = []
    for name, note, rows in groups:
        rr = []
        for r in rows:
            r = dict(r)
            r["area"] = AREA[r["id"]]
            rr.append(attach(r))
        out.append({"name": name, "note": note, "rows": rr})
    return out


def derive_area(start):
    first = re.split(r"(?<=[a-z\)])\.\s", start.strip(), 1)[0].rstrip(".")
    if len(first) > 52 and "," in first:
        first = first.split(",")[0]
    return first


# ---------------------------------------------------------------- main quest and items
STEPS = [r for _g, _n, rows in MAIN for r in rows]
ITEM_GROUPS = list(ITEMS) + list(SONGS)
ITEM_ROWS = [r for _g, _n, rows in ITEM_GROUPS for r in rows]
SUB_ROWS = [(pid, r) for pid, rows in SUBS.items() for r in rows]
KEY2ID = {}
# a step that was taken out of the story keeps its number retired, so every other step keeps the id its saved progress is filed under
RETIRED_MQ = {14}   # was "Magic Meter and Din's Fire", now a requirement of the Shadow Temple
_mq = 0
for s in STEPS:
    _mq += 1
    while _mq in RETIRED_MQ:
        _mq += 1
    KEY2ID[s["key"]] = "MQ-%d" % _mq
# rows marked late get the highest ids, so adding a row never renumbers saved progress
_n = 0
for s in [x for x in ITEM_ROWS if not x.get("late")] + [x for x in ITEM_ROWS if x.get("late")]:
    _n += 1
    assert s["key"] not in KEY2ID, s["key"]
    KEY2ID[s["key"]] = "IT-%d" % _n
for i, (_pid, s) in enumerate(SUB_ROWS, 1):
    assert s["key"] not in KEY2ID, s["key"]
    KEY2ID[s["key"]] = "TR-%d" % i
# dungeon walkthroughs: DG-n in file order. DG-1 to DG-41 were the Round 21 milestone lists and stay retired
DG_RETIRED = 41
_dg = DG_RETIRED
for _pid, _v in DSUBS.items():
    for s in (_v["steps"] if isinstance(_v, dict) else _v):
        _dg += 1
        assert s["key"] not in KEY2ID, s["key"]
        KEY2ID[s["key"]] = "DG-%d" % _dg
ROWIDS = set(KEY2ID.values()) | {r["id"] for _g, _n, rows in SKULL for r in [dict(id=x[0]) for x in rows]} \
    | {x[0] for _g, _n, rows in HEART for x in rows} | {r["id"] for _g, _n, rows in SIDE for r in rows}
STEP_AFTER = {s["key"]: s["after"] for s in STEPS}
MQ = {s["key"]: KEY2ID[s["key"]] for s in STEPS}


def leaf(tok):
    t = ALIAS.get(tok, tok)
    if t.startswith("GS:"):
        return t
    if t in KEY2ID:
        return KEY2ID[t]
    if t in ROWIDS:
        return t
    raise AssertionError("unknown requirement %r" % tok)


def clauses(req):
    """list of terms -> list of clauses; clause = list of options; option = list of ids (all needed)."""
    out = []
    for term in req:
        if isinstance(term, list):
            opts = []
            for o in term:
                opts.append([leaf(x) for x in o.split("+")])
            out.append(opts)
        elif term == "BOTTLE":
            out.append([[KEY2ID[b]] for b in BOTTLE])
        elif term.startswith("@"):
            k = ALIAS.get(term[1:], term[1:])
            assert k in STEP_AFTER, term
            for p in STEP_AFTER[k]:
                out.append([[MQ[p]]])
        else:
            out.append([[leaf(term)]])
    return out


ANC = {}


def anc(key):
    if key in ANC:
        return ANC[key]
    a = set()
    for p in STEP_AFTER[key]:
        a.add(p)
        a |= anc(p)
    ANC[key] = a
    return a


ID2KEY = {v: k for k, v in MQ.items()}


def prune(cl):
    """drop 'step X done' clauses that another required step already implies"""
    steps = [c[0][0] for c in cl if len(c) == 1 and len(c[0]) == 1 and c[0][0] in ID2KEY]
    implied = set()
    for s in steps:
        for a in anc(ID2KEY[s]):
            implied.add(MQ[a])
    seen, out = set(), []
    for c in cl:
        if len(c) == 1 and len(c[0]) == 1 and c[0][0] in implied:
            continue
        sig = json.dumps(c)
        if sig in seen:
            continue
        seen.add(sig)
        out.append(c)
    return out


def quest_rows_items():
    groups = []
    for name, note, rows in ITEM_GROUPS:
        out = []
        for r in rows:
            d = dict(id=KEY2ID[r["key"]], name=r["name"], kind=r["kind"], age=r["age"], time=r["time"], avail=r["avail"],
                     start=r["start"], reward=r["reward"], guide=list(r["guide"]))
            d["area"] = derive_area(r["start"])
            if d["id"] in BOTH:
                d["age"] = "Both"
                d["ages"] = BOTH[d["id"]]
            q = prune(clauses(r["req"]))
            if q:
                d["q"] = q
            if r.get("only"):
                d["only"] = r["only"]
            if r.get("v"):
                d["v"] = copy.deepcopy(r["v"])
                for _o in d["v"].values():
                    if "_req" in _o:
                        _o["q"] = prune(clauses(_o.pop("_req")))
            out.append(d)
        groups.append({"name": name, "note": note, "rows": out})
    return groups


def sub_rows(pid):
    """the checklist inside a side quest: each step comes after the one before it"""
    allv = ("n64", "3ds", "sw2")
    out, seen = [], []
    for r in SUBS[pid]:
        d = dict(id=KEY2ID[r["key"]], name=r["name"], short=r.get("short") or r["name"], kind=r["kind"], age=r["age"], time=r["time"],
                 avail=r["avail"], start=r["start"], reward=r["reward"], guide=list(r["guide"]))
        d["area"] = derive_area(r["start"])
        q = prune(clauses(r["req"]))
        if q:
            d["q"] = q
        vs = set(r.get("only") or allv)
        if r.get("only"):
            d["only"] = list(r["only"])
        prev = []
        for ver in allv:
            if ver in vs:
                i = next((i for i, v in reversed(seen) if ver in v), None)
                if i and i not in prev:
                    prev.append(i)
        d["after"] = prev
        if pid in OPEN_SUBS:
            d["open"] = 1
        seen.append((d["id"], vs))
        out.append(d)
    return out


# checklists whose steps are not secrets (reward tiers): no spoiler veil
OPEN_SUBS = {"SQ-17"}


def dungeon_subs(parent):
    """the optional step-by-step list inside a dungeon step: in order unless marked free"""
    v = DSUBS[parent["id"]]
    steps, free = (v["steps"], True) if isinstance(v, dict) else (v, False)
    allv = ("n64", "3ds", "sw2")
    out, seen = [], []   # seen: (id, versions) of earlier steps
    for r in steps:
        d = dict(id=KEY2ID[r["key"]], name=r["name"], short=r.get("short") or r["name"], kind=r["kind"], age=r["age"], time=r["time"],
                 avail=r["avail"], start=r["start"], reward=r["reward"], guide=list(r["guide"]), dg=1)
        d["area"] = parent.get("area", "")
        vs = set(r.get("only") or allv)
        if r.get("only"):
            d["only"] = list(r["only"])
        # for each of its versions, a step follows the last earlier step that version has: after a Switch 2 / N64-3DS split
        # the next shared step follows both ends (the app ignores the end that is not in the game version shown)
        prev = []
        for ver in allv:
            if ver in vs:
                i = next((i for i, v in reversed(seen) if ver in v), None)
                if i and i not in prev:
                    prev.append(i)
        d["after"] = list(parent["after"]) if (free or not prev) else prev
        if free:
            d["free"] = 1
        seen.append((d["id"], vs))
        out.append(d)
    return out


def quest_rows_main():
    groups = []
    for name, note, rows in MAIN:
        out = []
        for r in rows:
            d = dict(id=MQ[r["key"]], name=r["name"], kind=r["kind"], age=r["age"], time=r["time"], avail=r["avail"],
                     start=r["start"], reward=r["reward"], guide=list(r["guide"]), short=r["short"])
            d["area"] = derive_area(r["start"])
            d["after"] = [MQ[p] for p in r["after"]]
            if r.get("needs"):
                d["needs"] = [leaf(x) for x in r["needs"]]
            g = []
            for x in r["gives"]:
                g.append(leaf(x))
            if g:
                d["gives"] = g
            if r.get("v"):
                d["v"] = copy.deepcopy(r["v"])
                for _o in d["v"].values():
                    if "gives" in _o:
                        _o["gives"] = [leaf(x) for x in _o["gives"]]
            out.append(d)
        groups.append({"name": name, "note": note, "rows": out})
    return groups


def row_leaf_id(x):
    return leaf(x)


# ---------------------------------------------------------------- assemble
skull = pack(SKULL)
heart = pack(HEART)
side = pack_side(SIDE)
# Round 25: side quests are grouped by where they start, in the same area order as the Skulltulas and Hearts tabs
# (they used to be grouped by point in the story; each row still carries its Child/Adult tag). Ids do not change.
from regroup import ORDER as _AREA_ORDER
SIDE_AREA = {
    "Lost Woods": ["SQ-1", "SQ-2", "SQ-3", "SQ-4", "SQ-14", "SQ-15", "SQ-18"],
    "Hyrule Castle Town": ["SQ-44", "SQ-6", "SQ-7", "SQ-13", "SQ-16", "SQ-21", "SQ-33"],
    "Hyrule Castle": ["SQ-20"],
    "Lon Lon Ranch": ["SQ-8", "SQ-9", "SQ-28", "SQ-35"],
    "Kakariko Village": ["SQ-5", "SQ-17", "SQ-29", "SQ-34"],
    "Kakariko Graveyard": ["SQ-11", "SQ-27"],
    "Death Mountain Trail": ["SQ-19"],
    "Goron City": ["SQ-22", "SQ-31", "SQ-30"],
    "Death Mountain Crater": ["SQ-40"],
    "Zora's River": ["SQ-23", "SQ-26"],
    "Zora's Domain": ["SQ-24"],
    "Zora's Fountain": ["SQ-25"],
    "Lake Hylia": ["SQ-12", "SQ-10", "SQ-32", "SQ-41"],
    "Gerudo Valley": ["SQ-39"],
    "Gerudo Fortress": ["SQ-36", "SQ-37", "SQ-38"],
    "Desert Colossus": ["SQ-42"],
    "Ganon's Castle": ["SQ-43"],
}
_byid = {r["id"]: r for g in side for r in g["rows"]}
assert sorted(sum(SIDE_AREA.values(), []), key=lambda x: int(x[3:])) == sorted(_byid, key=lambda x: int(x[3:])), "every side quest in exactly one area"
assert all(a in _AREA_ORDER for a in SIDE_AREA)
side = [{"name": a, "note": "", "rows": [_byid[i] for i in SIDE_AREA[a]]} for a in _AREA_ORDER if a in SIDE_AREA]
for _g in side:
    for _r in _g["rows"]:
        if _r["id"] in SUBS:
            _r["subs"] = sub_rows(_r["id"])

# hearts that are side-quest prizes stay in their own location; the row shows which quest pays them and ticks together with it

LISTS = {"main": quest_rows_main(), "skull": skull, "heart": heart, "side": side, "items": quest_rows_items()}
for _g in LISTS["main"]:
    for _r in _g["rows"]:
        if _r["id"] in DSUBS:
            _r["subs"] = dungeon_subs(_r)

# step requirements for items/songs/trades live on the rows (q); gating for the three original lists
GATEQ = {}
for rid, req in GATE.items():
    GATEQ[rid] = prune(clauses(req))
for tab in ("skull", "heart", "side"):
    for g in LISTS[tab]:
        for r in g["rows"]:
            assert r["id"] in GATE, r["id"]
            q = GATEQ[r["id"]]
            if q:
                r["q"] = q
            for v, o in (r.get("v") or {}).items():
                if "_req" in o:
                    o["q"] = prune(clauses(o.pop("_req")))
            if r.get("v"):
                for v in list(r["v"]):
                    if not r["v"][v]:
                        del r["v"][v]
                if not r["v"]:
                    del r["v"]


def all_rows(tab):
    return [r for g in LISTS[tab] for r in g["rows"]]


def resolved(rows, ver):
    out = []
    for r in rows:
        if r.get("only") and ver not in r["only"]:
            continue
        o = (r.get("v") or {}).get(ver)
        if o and o.get("hide"):
            continue
        out.append(dict(r, **(o or {})))
    return out


# labels for requirement text
LAB = {}
for s in STEPS:
    LAB[MQ[s["key"]]] = s["short"]
for r in ITEM_ROWS:
    LAB[KEY2ID[r["key"]]] = r["name"].split(":")[0]
for _pid, s in SUB_ROWS:
    LAB[KEY2ID[s["key"]]] = s.get("short") or s["name"]
for g in SIDE:
    for r in g[2]:
        LAB[r["id"]] = r["name"]
for g in HEART:
    for r in g[2]:
        LAB[r[0]] = "Piece of Heart " + r[0]

# links
LINK_OUT = []
for rk, qid, mode, *_vv in LINKS:
    rid = leaf(rk) if not re.match(r"^[A-Z]+-\d+$", rk) else rk
    qid = leaf(qid) if not re.match(r"^[A-Z]+-\d+$", qid) else qid
    assert rid in ROWIDS and qid in ROWIDS, (rk, qid)
    _l = {"r": rid, "q": qid, "m": mode}
    if _vv:
        assert all(x in VKEYS for x in _vv[0]), _vv
        _l["v"] = list(_vv[0])
    LINK_OUT.append(_l)
BOTTLE_IDS = [KEY2ID[b] for b in BOTTLE]
DERIVED_OUT = [{"i": leaf(i), "s": list(s), "k": k} for i, s, k in DERIVED]
for _d in DERIVED_OUT:
    assert _d["s"] and all(x in ROWIDS for x in _d["s"]) and 1 <= _d["k"] <= len(_d["s"]), _d
PARTIAL_OUT = [leaf(x) for x in PARTIAL]

# gives: item/song/trade/sq ids a step turns on
STEP_GIVES = {r["id"]: r["gives"] for g in LISTS["main"] for r in g["rows"] if r.get("gives")}

# ---- era outline: child rows that depend on adult-era progress become "needs both Links"
import era
ERA = era.derive(LISTS, resolved, all_rows, VKEYS, LAB, KEY2ID[ADULT])
if __import__("os").environ.get("ERA_DEBUG"):
    for (_v, _i), (_h, _roots) in sorted(ERA.items()):
        print("ERA", _v, _i, "|", _h)
ERA_ROWS = set()
for _t in ("skull", "heart", "side", "items"):
    for _r in all_rows(_t):
        _fl = {_v: ERA[(_v, _r["id"])][0] for _v in VKEYS if (_v, _r["id"]) in ERA}
        if not _fl:
            continue
        _present = [_v for _v in VKEYS if resolved([_r], _v)]
        assert set(_fl) == set(_present) and len(set(_fl.values())) == 1, (_r["id"], _fl, _present)
        assert not any("age" in o or "ages" in o for o in (_r.get("v") or {}).values()), _r["id"]
        assert _r["age"] == "Child" and _r["id"] not in BOTH, _r["id"]
        _r["age"] = "Both"
        _r["ages"] = list(_fl.values())[0]
        ERA_ROWS.add(_r["id"])
print("era-derived both-Link rows:", sorted(ERA_ROWS))

# ---------------------------------------------------------------- two-Link checklists
# every row that needs both Links gets a two-step checklist (first Link, then the other), so the first half can be ticked on its own.
_AGE_RE = re.compile(r"^(Child|Adult)(?: first| second)?:\s*(.+?)\s+(Child|Adult)(?: first| second)?:\s*(.+)$", re.S)
_MIRROR = [("Song of Storms", "s_storms"), ("Bolero of Fire", "s_bolero"), ("Requiem of Spirit", "s_requiem")]
AGESTEP_ROWS = []
_VCUR = [None]
_ROWAGE = {}
for _t in LISTS:
    for _r in all_rows(_t):
        _ROWAGE[_r["id"]] = _r.get("age")
def _age_subs(r, rv):
    m = _AGE_RE.match(rv["ages"].strip())
    assert m and m.group(1) != m.group(3), (r["id"], rv["ages"])
    out = []
    for n, (age, txt) in enumerate(((m.group(1), m.group(2)), (m.group(3), m.group(4))), 1):
        txt = txt.strip().rstrip(".")
        txt = txt[0].upper() + txt[1:]
        sid = "%s.%d" % (r["id"], n)
        d = dict(id=sid, name=txt, short=txt, kind="Step", age=age, time="Any", avail="Any", start="", reward="", guide=[],
                 area=r.get("area", ""), after=[] if n == 1 else [r["id"] + ".1"], step=n)
        if n == 1:
            mir = [k for t, k in _MIRROR if t in txt and txt.lower().startswith("learn")]
            if mir:
                d["mir"] = leaf(mir[0])
                # locked like the song itself (the Bolero needs the Goron Tunic and Hookshot, not just growing up)
                _song = [x for x in resolved(all_rows("items"), _VCUR[0]) if x["id"] == d["mir"]]
                if _song and _song[0].get("q"):
                    d["q"] = copy.deepcopy(_song[0]["q"])
            elif age == "Child":
                # the child half cannot lean on adult-only gear (the Hookshot shortcut belongs to the adult half)
                q = []
                for _c in copy.deepcopy(rv.get("q") or []):
                    _k = [o for o in _c if not any(_ROWAGE.get(x) == "Adult" for x in o)]
                    q.append(_k or _c)
                if q:
                    d["q"] = q
        else:
            # what the first step already stands for (learning the song) is not listed again
            _m1 = out[0].get("mir")
            d["q"] = [c for c in copy.deepcopy(rv.get("q") or []) if not (_m1 and [_m1] in c)] + [[[r["id"] + ".1"]]]
        out.append(d)
    return out
for _t in ("skull", "heart", "side", "items"):
    for _r in all_rows(_t):
        if _r.get("subs"):
            continue
        per = {}
        for _v in VKEYS:
            _VCUR[0] = _v
            _rr = resolved([_r], _v)
            if _rr and _rr[0].get("age") == "Both" and _rr[0].get("ages"):
                per[_v] = _age_subs(_r, _rr[0])
        if not per:
            continue
        AGESTEP_ROWS.append(_r["id"])
        _present = [_v for _v in VKEYS if resolved([_r], _v)]
        _ids = {tuple(x["id"] for x in L) for L in per.values()}
        assert len(_ids) == 1
        if "n64" in per and set(per) == set(_present):
            _r["subs"] = per["n64"]
            for _v in ("3ds", "sw2"):
                if _v in per and per[_v] != per["n64"]:
                    _r.setdefault("v", {}).setdefault(_v, {})["subs"] = per[_v]
        else:
            assert "n64" not in per, _r["id"]
            for _v, L in per.items():
                _r.setdefault("v", {}).setdefault(_v, {})["subs"] = L
print("two-Link checklists:", len(AGESTEP_ROWS), AGESTEP_ROWS)

payload = {
    "vers": VERS,
    "tabs": TABS_CFG,
    "lists": LISTS,
    "lab": LAB,
    "links": LINK_OUT,
    "bottle": BOTTLE_IDS,
    "derived": DERIVED_OUT,
    "partial": PARTIAL_OUT,
    "adult": KEY2ID[ADULT],
    "vnotes": dict(VNOTES, **VN_NEW),
    "vsources": {k: [{"t": t, "u": u} for t, u in v] for k, v in VSOURCES.items()},
    "defaults": SKULL_DEFAULTS,
    "src": {
        "main": [{"t": t, "u": u} for t, u in NEW_SOURCES],
        "skull": [{"t": t, "u": u} for t, u in SOURCES],
        "heart": [{"t": t, "u": u} for t, u in SOURCES],
        "side": [{"t": t, "u": u} for t, u in SIDE_SOURCES],
        "items": [{"t": t, "u": u} for t, u in NEW_SOURCES],
    },
}

# ---------------------------------------------------------------- sanity checks
ids_all = []
for t in LISTS:
    ids_all += [r["id"] for r in all_rows(t)]
assert len(ids_all) == len(set(ids_all)), "duplicate ids"
n = {t: len(all_rows(t)) for t in LISTS}
assert n["main"] == 40 and n["skull"] == 101 and n["heart"] == 37 and n["side"] == 44 and n["items"] == 77, n
for v in VKEYS:
    assert len(resolved(all_rows("skull"), v)) == 100, v
    assert len(resolved(all_rows("heart"), v)) == 36, v
    assert len(resolved(all_rows("side"), v)) == {"n64": 43, "3ds": 43, "sw2": 44}[v], v
    assert len(resolved(all_rows("main"), v)) == 40, v
    assert len(resolved(all_rows("items"), v)) == (77 if v == "sw2" else 76), v
for t in LISTS:
    for r in all_rows(t):
        for rv in [r] + [dict(r, **o) for o in (r.get("v") or {}).values()]:
            assert rv["age"] in ("Child", "Adult", "Either", "Both"), r["id"]
            assert rv["time"] in ("Any", "Day", "Night", "Mixed"), r["id"]
            if rv["age"] == "Both":
                assert rv.get("ages"), r["id"]
        for v, o in (r.get("v") or {}).items():
            assert v in ("3ds", "sw2"), (r["id"], v)
        for v in r.get("only", []):
            assert v in VKEYS
        if t in ("main", "side", "items"):
            for rv in [r] + [dict(r, **o) for o in (r.get("v") or {}).values()]:
                assert rv["guide"] and all(isinstance(x, str) and x for x in rv["guide"]), r["id"]
            for k in ("name", "kind", "avail", "start", "reward", "area"):
                assert r[k], (r["id"], k)
for d in SKULL_DEFAULTS:
    assert d in ids_all
for tab, d in payload["vnotes"].items():
    for v, p in d.items():
        assert p["lead"] and p["items"], (tab, v)
assert all(i in BOTH or True for i in BOTH)
for i in list(BOTH):
    assert i in ids_all, i
# order and graph
order = {r["id"]: i for i, r in enumerate(all_rows("main"))}
for r in all_rows("main"):
    for a in r["after"]:
        assert order[a] < order[r["id"]], (r["id"], a)
# story simulation: from nothing, following the rules, every row must become reachable in every version
quest_of_r = {}
rewards_of = {}
for l in LINK_OUT:
    rewards_of.setdefault(l["q"], []).append(l)
reach = {}
for v in VKEYS:
    rows = {t: resolved(all_rows(t), v) for t in LISTS}
    flat = {r["id"]: (t, r) for t in rows for r in rows[t]}
    subof, subs_of = {}, {}
    for r in rows["side"]:
        for s in r.get("subs", []):
            flat[s["id"]] = ("sub", s)
            subof[s["id"]] = r["id"]
            subs_of.setdefault(r["id"], []).append(s["id"])
    done = set()

    def ok_leaf(x):
        if x.startswith("GS:"):
            return sum(1 for i in done if i in flat and flat[i][0] == "skull") >= int(x[3:])
        return x in done

    def sat(r):
        cl = list(r.get("q") or [])
        if r["age"] in ("Adult", "Both"):
            cl = cl + [[[KEY2ID[ADULT]]]]
        for c in cl:
            if not any(all(ok_leaf(x) for x in o) for o in c):
                return False
        return True

    def tick(i):
        stack = [i]
        while stack:
            j = stack.pop()
            if j in done or j not in flat:
                continue
            done.add(j)
            r = flat[j][1]
            stack += r.get("gives", [])
            stack += subs_of.get(j, [])
            if j in subof and all(x in done for x in subs_of[subof[j]]):
                stack.append(subof[j])
            for d in DERIVED_OUT:
                if j in d["s"] and sum(1 for x in d["s"] if x in done) >= d["k"]:
                    stack.append(d["i"])
            for l in rewards_of.get(j, []):
                stack.append(l["r"])
            for l in LINK_OUT:
                if l["r"] == j and l["m"] == "full":
                    sib = [x["r"] for x in rewards_of[l["q"]] if x["m"] == "full"]
                    if all(s in done or s not in flat for s in sib):
                        stack.append(l["q"])

    for _ in range(400):
        before = len(done)
        for r in rows["main"]:
            if r["id"] not in done and all(a in done for a in r["after"]):
                tick(r["id"])
        for t in ("skull", "heart", "side", "items"):
            for r in rows[t]:
                if r["id"] not in done and sat(r):
                    tick(r["id"])
        for sid in subof:
            if sid not in done and sat(flat[sid][1]):
                tick(sid)
        if len(done) == before:
            break
    missing = [i for i in flat if i not in done]
    assert not missing, (v, missing)
    reach[v] = len(done)

# which items have no automatic source (they are found, not earned from a quest)? Printed for review.
_src = set()
for _s in STEPS:
    _src |= set(KEY2ID[x] if x in KEY2ID else x for x in _s["gives"])
_src |= {l["r"] for l in LINK_OUT} | {d["i"] for d in DERIVED_OUT}
NO_SOURCE = [r["id"] + " " + r["name"] for r in all_rows("items") if r["id"] not in _src]
for _pid, _rows in SUBS.items():
    for _s in _rows:
        assert _s["age"] in ("Child", "Adult", "Either") and _s["time"] in ("Any", "Day", "Night", "Mixed")
        assert _s["guide"] and _s["short"]
assert sum(len(v) for v in SUBS.values()) == 17 + 10  # trading chains + Skulltula rewards (10 incl. version variants); two-Link steps are built separately

blob = json.dumps(payload, ensure_ascii=False).replace("</", "<\\/").replace("<!--", "<\\!--")

here = os.path.dirname(os.path.abspath(__file__))
tpl = open(os.path.join(here, "template.html"), encoding="utf-8").read()


def render(title, css="", js=""):
    h = tpl.replace("/*__APP__*/", open(os.path.join(here, "app.js"), encoding="utf-8").read()).replace("__TITLE__", title).replace("/*__THEME_CSS__*/", css).replace("/*__THEME_JS__*/", js)
    return h.replace("__DATA__", blob)


outdir = os.environ.get("OOT_OUT") or os.path.join(os.path.dirname(here), "out")
os.makedirs(outdir, exist_ok=True)


def read(p):
    return open(os.path.join(here, p), encoding="utf-8").read()


outs = {}
# Phase 0 (D-6): index.html and themed.html are no longer built; only themed2.html ships.
if os.path.exists(os.path.join(here, "theme2.css")) and os.path.exists(os.path.join(here, "theme2.js")):
    _mark = "/* ---------- public API ---------- */"
    _t2 = read("theme2.js")
    assert _mark in _t2
    _t2 = _t2.replace(_mark, read("scenes3.js") + "\n" + read("models5_toolkit.js") + "\n" + read("models5_items.js") + "\n" + _mark)
    outs["themed2.html"] = render("Ocarina of Time tracker: the adventure edition", read("theme2.css") + read("scenes3.css"), _t2)
for k, v in outs.items():
    with open(os.path.join(outdir, k), "w", encoding="utf-8", newline="\n") as f:  # LF on every OS (Windows text mode would write CRLF and change the hash)
        f.write(v)
print("no automatic source:", NO_SOURCE)
print("ok", n, reach, {k: len(v) for k, v in outs.items()})

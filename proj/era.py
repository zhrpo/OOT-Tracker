"""Era outline: which Link a row needs, and what adult-era progress a child row depends on.

A child row that needs something only adult Link can get (a song learned in the Kakariko windmill, the Requiem of
Spirit...) is marked as needing both Links, with an automatic "Adult first / Child second" hint.  Adult rows that need
child-era things are the normal order of the story, so they are not marked.
"""
import re


def _verb(row):
    k = (row.get("kind") or "").lower()
    if "song" in k:
        return "learn the"
    if k in ("dungeon", "boss", "temple"):
        return "clear the"
    return "get the"


def _label(row, lab):
    name = lab.get(row["id"]) or row["name"].split(":")[0]
    return re.sub(r"\s*\(.*?\)", "", name).strip()


# where the adult-era thing happens, in words that read well after "learn the ..." (the item rows' own area text
# is sometimes a story location with a console-specific note in brackets)
WHERE = {
    "MQ-33": "Desert Colossus, once you cross the Haunted Wasteland",
    "IT-75": "Desert Colossus, once you cross the Haunted Wasteland",
}


def _phrase(row, lab):
    where = WHERE.get(row["id"]) or re.sub(r"\s*\(.*?\)", "", (row.get("area") or "")).strip().rstrip(".")
    return "%s %s%s" % (_verb(row), _label(row, lab), " (%s)" % where if where else "")


SECOND = {
    "skull": "Child second: come back as child Link to collect this one.",
    "heart": "Child second: come back as child Link to collect this one.",
    "side": "Child second: do this quest as child Link.",
    "items": "Child second: you collect this one as child Link.",
}


def derive(lists, resolved, all_rows, vkeys, lab, adult_id):
    """-> {(ver, id): (hint, [root leaf ids])} for every child row that depends on adult-era progress."""
    out = {}
    for v in vkeys:
        rows = {t: resolved(all_rows(t), v) for t in lists}
        flat = {}
        for t, rs in rows.items():
            for r in rs:
                flat[r["id"]] = r
                for s in r.get("subs", []):
                    flat[s["id"]] = s
        roots = {i: [i] for i, r in flat.items() if r["age"] == "Adult" and i != adult_id}
        changed = True
        while changed:
            changed = False
            for t in ("skull", "heart", "side", "items"):
                for r in rows[t]:
                    if r["id"] in roots or r["age"] != "Child":
                        continue
                    found = []
                    for c in r.get("q") or []:
                        if not c:
                            continue
                        deps = [[x for x in o if x in roots] for o in c]
                        if all(deps):
                            for x in deps[0]:
                                for rt in roots[x]:
                                    if rt not in found:
                                        found.append(rt)
                    if found:
                        roots[r["id"]] = found
                        out[(v, r["id"])] = (
                            "Adult first: " + " and ".join(_phrase(flat[x], lab) for x in found) + ". " + SECOND[t],
                            found)
                        changed = True
    return out

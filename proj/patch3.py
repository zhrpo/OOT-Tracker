def sub(path, old, new, count=1):
    s = open(path).read()
    assert s.count(old) == count, (path, s.count(old), old[:70])
    s = s.replace(old, new)
    open(path, "w").write(s)

# build.py
sub("build.py", "from vnew import VN_NEW, NEW_SOURCES, TABS_CFG\n", "from vnew import VN_NEW, NEW_SOURCES, TABS_CFG\nimport fix4  # round-4 corrections: patches the dicts imported above in place\nLINKS = fix4.LINKS\n")
sub("build.py", "for i, s in enumerate(ITEM_ROWS, 1):\n    assert s[\"key\"] not in KEY2ID, s[\"key\"]\n    KEY2ID[s[\"key\"]] = \"IT-%d\" % i\n",
    "# rows marked late get the highest ids, so adding a row never renumbers saved progress\n_n = 0\nfor s in [x for x in ITEM_ROWS if not x.get(\"late\")] + [x for x in ITEM_ROWS if x.get(\"late\")]:\n    _n += 1\n    assert s[\"key\"] not in KEY2ID, s[\"key\"]\n    KEY2ID[s[\"key\"]] = \"IT-%d\" % _n\n")
sub("build.py", "            if r.get(\"v\"):\n                d[\"v\"] = copy.deepcopy(r[\"v\"])\n            out.append(d)\n        groups.append({\"name\": name, \"note\": note, \"rows\": out})\n    return groups\n\n\ndef sub_rows",
    "            if r.get(\"v\"):\n                d[\"v\"] = copy.deepcopy(r[\"v\"])\n                for _o in d[\"v\"].values():\n                    if \"_req\" in _o:\n                        _o[\"q\"] = prune(clauses(_o.pop(\"_req\")))\n            out.append(d)\n        groups.append({\"name\": name, \"note\": note, \"rows\": out})\n    return groups\n\n\ndef sub_rows")
sub("build.py", "            if g:\n                d[\"gives\"] = g\n            out.append(d)",
    "            if g:\n                d[\"gives\"] = g\n            if r.get(\"v\"):\n                d[\"v\"] = copy.deepcopy(r[\"v\"])\n                for _o in d[\"v\"].values():\n                    if \"gives\" in _o:\n                        _o[\"gives\"] = [leaf(x) for x in _o[\"gives\"]]\n            out.append(d)")
sub("build.py", "for rk, qid, mode in LINKS:\n    if rk.startswith(\"HP-\"):", "for rk, qid, mode, *_vv in LINKS:\n    if rk.startswith(\"HP-\"):")
sub("build.py", "for rk, qid, mode in LINKS:\n    rid = leaf(rk) if not re.match(r\"^[A-Z]+-\\d+$\", rk) else rk\n    assert rid in ROWIDS and qid in ROWIDS, (rk, qid)\n    LINK_OUT.append({\"r\": rid, \"q\": qid, \"m\": mode})",
    "for rk, qid, mode, *_vv in LINKS:\n    rid = leaf(rk) if not re.match(r\"^[A-Z]+-\\d+$\", rk) else rk\n    assert rid in ROWIDS and qid in ROWIDS, (rk, qid)\n    _l = {\"r\": rid, \"q\": qid, \"m\": mode}\n    if _vv:\n        assert all(x in VKEYS for x in _vv[0]), _vv\n        _l[\"v\"] = list(_vv[0])\n    LINK_OUT.append(_l)")
sub("build.py", "n[\"items\"] == 76, n", "n[\"items\"] == 77, n")
sub("build.py", "== (76 if v == \"sw2\" else 75), v", "== (77 if v == \"sw2\" else 76), v")
print("build ok")

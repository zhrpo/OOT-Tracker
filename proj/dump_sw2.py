import sys, json
sys.argv = ["x"]
import runpy
ns = runpy.run_path("build.py")
payload = ns["payload"]
tab = "skull"
for g in payload[tab]:
    print("==", g["name"], "|", (g.get("note") or "")[:100], "|| VN:", (g.get("vnote") or {}).get("sw2", "")[:160])
    for r in g["rows"]:
        if r.get("only") and "sw2" not in r["only"]:
            continue
        o = (r.get("v") or {}).get("sw2") or {}
        m = dict(r, **o)
        flag = "*" if o else " "
        print(" ", flag, m["id"], "|", m["age"], m["time"], "|", m["where"][:95], "|", m["how"][:80], ("| NOTE: " + m["note"][:140]) if m.get("note") else "")

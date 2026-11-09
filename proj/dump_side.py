import runpy
ns = runpy.run_path("build.py")
payload = ns["payload"]
for tab in ("side",):
    for g in payload[tab]:
        print("==", g["name"])
        for r in g["rows"]:
            o = (r.get("v") or {}).get("sw2") or {}
            m = dict(r, **o)
            print("  ", "*" if o else " ", m["id"], "|", m["name"], "|", m["age"], m["time"], "|", m["kind"], "| R:", m["reward"][:90])

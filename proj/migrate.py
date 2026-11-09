import json, sys, importlib.util
sys.path.insert(0, "/home/claude/build")
# old numbering: ITEMS + SONGS + TRADES from the backup
spec = importlib.util.spec_from_file_location("extra_old", "/home/claude/build/extra.bak7.py"); eo = importlib.util.module_from_spec(spec); spec.loader.exec_module(eo)
old_rows = [r for g in (list(eo.ITEMS) + list(eo.SONGS) + list(eo.TRADES)) for r in g[2]]
OLD = {"IT-%d" % i: r["key"] for i, r in enumerate(old_rows, 1)}
import build as B   # new numbering (re-runs the build, fine)
NEW = B.KEY2ID
got = json.load(open("/tmp/got.json"))
mapped, dropped = [], []
for k in got:
    v, i = k.split(":")
    if i.startswith("IT-"):
        key = OLD[i]
        if key in NEW:
            mapped.append("%s:%s" % (v, NEW[key]))
        else:
            dropped.append((k, key))
    elif i == "DT-4":
        dropped.append((k, "DT-4 (pre-ticked default, needs Boomerang)"))
    else:
        mapped.append(k)
json.dump(sorted(mapped), open("/tmp/mapped.json", "w"))
print("mapped", len(mapped), "dropped", dropped)
print({OLD[k.split(':')[1]]: NEW.get(OLD[k.split(':')[1]]) for k in got if k.split(":")[1].startswith("IT-")})

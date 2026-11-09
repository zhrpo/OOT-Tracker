import sys, json, runpy, re
sys.argv=["x"]
ns = runpy.run_path("build.py")
P = ns["payload"]; LAB = P["lab"]; ADULT = P["adult"]; BOTTLE=set(P["bottle"])
VER = sys.argv[1] if len(sys.argv)>1 else "sw2"
def lab(x):
    if x.startswith("GS:"): return x[3:]+" tokens"
    if x==ADULT: return "MasterSword(adult)"
    return LAB.get(x,x)+"["+x+"]"
def clause(c):
    if len(c)>=3 and all(len(o)==1 and o[0] in BOTTLE for o in c): return "a bottle"
    return " OR ".join(" + ".join(lab(x) for x in o) for o in c)
def req(r):
    q=list(r.get("q") or [])
    if r["age"] in ("Adult","Both") and r["id"]!=ADULT: q.append([[ADULT]])
    return " AND ".join("("+clause(c)+")" for c in q)
tab = sys.argv[2] if len(sys.argv)>2 else None
out=[]
for t in ("main","skull","heart","side","items"):
    out.append("######## "+t)
    for g in P["lists"][t]:
        out.append("== "+g["name"])
        for r in g["rows"]:
            if r.get("only") and VER not in r["only"]: continue
            o=(r.get("v") or {}).get(VER) or {}
            if o.get("hide"): continue
            m=dict(r,**o)
            nm = m.get("name") or m.get("where")
            line = "%s | %s%s %s | %s" % (m["id"], m["age"], ("("+m.get("ages","")+")") if m["age"]=="Both" else "", m["time"], nm)
            out.append(line)
            if t in ("skull","heart"): out.append("     HOW: "+m["how"])
            else:
                out.append("     START: "+m.get("start","")+" || REWARD: "+m.get("reward",""))
            if m.get("note"): out.append("     NOTE: "+m["note"])
            out.append("     REQ: "+req(m))
            if m.get("gives"): out.append("     GIVES: "+", ".join(m["gives"]))
            if m.get("after"): out.append("     AFTER: "+", ".join(m["after"]))
            for s in m.get("subs",[]) or []:
                out.append("       SUB %s | %s %s | %s || %s" % (s["id"], s["age"], s["time"], s["name"], s.get("reward","")))
                out.append("            REQ: "+req(s))
open("dump_%s.txt"%VER,"w").write("\n".join(out))
print(len(out))

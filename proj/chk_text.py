import sys, re, json, runpy
sys.argv=["x"]
ns=runpy.run_path("build.py"); P=ns["payload"]; LAB=P["lab"]; ADULT=P["adult"]
VER="sw2"
KW = [("Boomerang","IT-14"),("Hookshot","IT-16"),("Longshot","IT-17"),(r"\bbomb","IT-35"),("Slingshot","IT-12"),(r"\bbow\b|arrow","IT-13"),
 ("Hammer|Megaton","IT-15"),("Lens","IT-18"),("Iron Boots","IT-10"),("Zora Tunic","IT-9"),("Hover Boots","IT-11"),(r"bottled|bottle|\bbug\b","BOTTLE"),
 (r"\bbean","SQ-23"),("Din.s Fire","IT-22"),("Song of Time","IT-68"),("Song of Storms|Storms","IT-70"),("Scarecrow","IT-69"),("Silver Gauntlets","IT-30"),
 ("Golden Scale","IT-33"),("Epona","SQ-28"),("Membership|Gerudo Token|Gerudo card","IT-53"),("Goron Tunic","IT-8"),("Fire Arrows","IT-26"),("Mirror Shield","IT-7"),
 ("Bolero","IT-72"),("Requiem","IT-75"),("Nocturne","IT-74"),("Minuet","IT-71"),("Sun.s Song","IT-67"),("Saria.s Song","IT-65"),("Zelda.s Lullaby","IT-64"),
 ("Magic Meter|magic","IT-21"),("Goron.s Bracelet|Bomb Flower","IT-29")]
def leaves(q):
    s=set()
    for c in q or []:
        for o in c:
            for x in o: s.add(x)
    return s
for t in ("skull","heart","side"):
    for g in P["lists"][t]:
        for r in g["rows"]:
            if r.get("only") and VER not in r["only"]: continue
            o=(r.get("v") or {}).get(VER) or {}
            if o.get("hide"): continue
            m=dict(r,**o)
            txt=" ".join([m.get("how",""),m.get("note","") or "",m.get("where","") or "",m.get("start","") or "",m.get("name","") or "",m.get("reward","") or ""])
            L=leaves(m.get("q"))
            miss=[]
            for kw,i in KW:
                if re.search(kw,txt,re.I):
                    if i=="BOTTLE":
                        if not (set(P["bottle"])&L): miss.append(kw)
                    elif i not in L:
                        # accept the step-id aliases: map item to step-based gives
                        miss.append(kw)
            print("%-7s %-6s %s | text-mentions-not-in-req: %s" % (m["id"], m["age"], (m.get("where") or m.get("name"))[:46], ", ".join(miss) if miss else "-"))

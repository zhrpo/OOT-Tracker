def sub(path, old, new, count=1):
    s = open(path).read()
    assert s.count(old) == count, (path, s.count(old), old[:70])
    s = s.replace(old, new)
    open(path, "w").write(s)

sub("app.js", "STEPS.forEach(function(s){ (s.gives || []).forEach(function(g){ if (!GIVER[g]) GIVER[g] = s.id; }); });\nvar REWARDS_OF = {}, LINK_OF = {};\nD.links.forEach(function(l){ (REWARDS_OF[l.q] = REWARDS_OF[l.q] || []).push(l); LINK_OF[l.r] = l; });\n",
 """var REWARDS_OF = {}, LINK_OF = {}, LINKS_FOR = null;
/* links and "who hands this over" can differ by game (Switch 2 swaps two Great Fairies), so they are rebuilt whenever the game changes */
function syncLinks(){
  if (LINKS_FOR === state.ver) return;
  LINKS_FOR = state.ver;
  Object.keys(REWARDS_OF).forEach(function(k){ delete REWARDS_OF[k]; });
  Object.keys(LINK_OF).forEach(function(k){ delete LINK_OF[k]; });
  Object.keys(GIVER).forEach(function(k){ delete GIVER[k]; });
  D.links.forEach(function(l){
    if (l.v && l.v.indexOf(state.ver) < 0) return;
    (REWARDS_OF[l.q] = REWARDS_OF[l.q] || []).push(l); LINK_OF[l.r] = l;
  });
  STEPS.forEach(function(s){
    var o = s.v && s.v[state.ver], gv = (o && o.gives) || s.gives || [];
    gv.forEach(function(g){ if (!GIVER[g]) GIVER[g] = s.id; });
  });
}
""")
sub("app.js", "function rowMap(){\n  var k = state.ver;\n", "function rowMap(){\n  syncLinks();\n  var k = state.ver;\n")
print("app ok")

# Round-4 corrections (Switch 2 audit). Imported by build.py; mutates the dicts of vers/gate/links in place.
# Sources: Game8 (great fairy page 618335, Gold Skulltula list), VGC per-area guides, RPG Site, TheGamer, Respec,
# Zelda Dungeon / StrategyWiki / Jegged for the N64 baseline.
from vers import OV, VNOTES, GNOTE
from gate import GATE, GATE_V
from links import LINKS as _L, BOTH, BOTH_V


def ov(i, v, **kw):
    OV.setdefault(i, {}).setdefault(v, {}).update(kw)


# ---------------------------------------------------------------- links (some differ by game)
LINKS = [l for l in _L if l[0] != "i_dins"]
LINKS += [
    ("i_dins", "SQ-20", "full", ["n64", "3ds"]),   # N64/3DS: Hyrule Castle fairy gives Din's Fire
    ("i_spin", "SQ-19", "full", ["n64", "3ds"]),   # N64/3DS: Death Mountain fairy gives Magic Meter + Spin Attack
    ("i_dins", "SQ-19", "full", ["sw2"]),          # Switch 2: Death Mountain fairy gives Magic Meter + Din's Fire
    ("i_spin", "SQ-20", "full", ["sw2"]),          # Switch 2: Hyrule Castle fairy gives the Spin Attack
]

# ---------------------------------------------------------------- requirements, all games
# Tools the text says you use are now listed as requirements, so the chips always show them.
GATE.update({
    "SQ-26": ["s_lullaby", "s_epona", "s_saria", "s_sun", "s_time", "s_storms"],
    "KAK-5": ["i_fairyoc", "i_sling"],
    "ZR-2": ["i_bombs", "i_sling"],
    "GF-2": ["i_longshot", "i_card"],
    "SP-5": ["@spirit", "s_scare", ["i_hookshot", "i_longshot"]],
    "DT-2": ["i_sword", "i_shield", "i_sling"],
    "DC-1": ["i_bracelet", "i_sling"],
    "JB-1": ["king", "i_sling"],
    "JB-2": ["king", "i_boomerang"], "JB-3": ["king", "i_boomerang"],
    "SP-1": ["@spiritchild", "i_boomerang"], "SP-2": ["@spiritchild", "i_boomerang"],
    "GAN-1": ["castle", "i_hookshot"],
    "HW-1": ["i_card", ["i_hover", "i_longshot"], "i_lens", "i_hookshot"],
    "WT-1": ["@water", "i_hookshot"],
    "WT-2": ["@water", "i_longshot", "i_ironboots"],
    "WT-3": ["@water", "i_longshot"], "WT-4": ["@water", "i_longshot"], "WT-5": ["@water", "i_longshot"],
    "ST-4": ["@shadow", "s_scare", "i_longshot"],
    "FIRE-3": ["@fire", "s_scare", "i_hookshot"], "FIRE-4": ["@fire", "s_scare", "i_hookshot"],
    "FIRE-5": ["@fire", "i_hammer"],
    # frogs: the memory game only opens once the Song of Storms prize is paid out AND all five songs were played
    "HP-24": ["s_storms", "s_lullaby", "s_saria", "s_epona", "s_sun", "s_time"],
})
_SCARE = "Child first: at Lake Hylia, play Bonooru any eight-note tune of your own (not a song you already know). Adult second: play the same eight notes for him to learn the song. From then on, playing it calls Pierre for the Hookshot."
BOTH["SQ-12"] = _SCARE
BOTH["IT-69"] = _SCARE
BOTH["CL-1"] = "Adult: learn the Requiem of Spirit at the Colossus. Child: warp back with it and release a bottled bug on the soil."

# ---------------------------------------------------------------- requirements, Switch 2 only
GATE_V.update({
    # Switch 2: the token behind the carpenters' tent falls to the plain Hookshot (confirmed in play); Epona gets you over the bridge
    ("sw2", "GV-3"): ["i_hookshot", ["SQ-28", "i_longshot"]],
    # Switch 2: Big Poes can be beaten without the Fairy Bow (confirmed in play: bottle and Gold Rupee before the Forest Temple)
    ("sw2", "SQ-33"): ["SQ-28", "BOTTLE"],
    # no duplicate Master Sword clause: Both rows get it automatically
    ("sw2", "HP-6"): ["i_bombs"],
    ("sw2", "HP-7"): [],
    # the tree token: roll into it, nothing else
    ("sw2", "HF-1"): ["i_fairyoc"],
    # Switch 2: the east (northeast) courtyard token sits up at a Pierre spot, not by the island chest (VGC; confirmed in play)
    ("sw2", "FT-3"): ["@forest", "s_scare", "i_hookshot"],
    ("sw2", "HF-2"): ["i_bombs"],
    ("sw2", "HF-3"): ["i_bombs", ["i_boomerang", "i_sling"]],
    ("sw2", "DC-4"): ["i_bracelet", "i_bombs"],
    ("sw2", "LLR-2"): ["i_boomerang"],
    ("sw2", "DMT-1"): ["i_bracelet", "BOTTLE"],
    ("sw2", "LH-2"): [["i_boomerang", "i_sling"]],
    ("sw2", "SP-2"): ["@spiritchild"],
    ("sw2", "BW-3"): ["@well", "i_lens", "i_boomerang"],
    ("sw2", "BW-1"): ["@well", "i_lens"],
    ("sw2", "BW-2"): ["@well", "i_lens"],
    ("sw2", "DT-3"): ["i_sword", "i_shield", "i_sling"],
    ("sw2", "CL-2"): ["s_requiem", ["i_hookshot", "i_longshot"]],
    ("sw2", "ZR-1"): ["BOTTLE"],
    ("sw2", "ZR-2"): ["i_bombs"],
    ("sw2", "DT-4"): ["i_sword", "i_shield", "i_sling"],
    ("sw2", "SP-3"): ["@spiritchild", "i_boomerang"],
    ("sw2", "HP-10"): ["SQ-27"],
    ("sw2", "HP-11"): ["i_fairyoc"],
    ("sw2", "SQ-20"): ["i_bombs", "s_lullaby"],
})

# ---------------------------------------------------------------- Switch 2 text
ov("HF-3", "sw2", age="Child",
   how="Bomb the cracked spot, drop into the grotto and kill the spider with the Slingshot or the Boomerang. Use the Boomerang to fetch the token if it ends up out of reach",
   note="A third field token that does not exist on N64. Four guides list it. Game8 and VGC say child Link, and Game8 lists the Boomerang, so the Slingshot or Boomerang is shown.")
ov("DC-4", "sw2", age="Child",
   where="Second floor, center room, behind a rock",
   how="Bomb the rock in the center room on the second floor and kill the spider behind it",
   note="Game8 lists this one as a bombable rock in the second-floor center room with no Boomerang or Hookshot. The N64 token is the alcove at the top of the giant staircase, which needs the Boomerang or Hookshot, and no Switch 2 guide lists that one.")
ov("HF-2", "sw2",
   age="Both",
   how="Bomb the cracked spot in the marsh and drop into the grotto. As child, kill the ordinary Skulltula inside. Come back as adult and roll into the wooden crate: the Gold Skulltula comes out",
   note="Needs both ages: the gold one only appears for adult Link after the ordinary Skulltula was killed there as child (VGC, Nintendo Life, Nintendo Insider, Vertical Slice). Replaces the web-covered grotto near Gerudo Valley.")
ov("LLR-2", "sw2",
   how="Look up inside the tower, kill the spider and fetch the token with the Boomerang")
ov("HC-2", "sw2",
   note="TheGamer also lists the Boomerang for this one. Game8 does not, so only the Song of Storms and bombs are required. Bring the Boomerang if the token is out of reach.")
ov("ZR-1", "sw2",
   note="New on Switch 2: this hole had no token on N64. Game8 puts the soil before the boulders that need bombs, so no bombs are listed. The river-start tree token is not listed in any Switch 2 guide.")
ov("ZR-3", "sw2",
   note="VGC lists this Zora's River token as a bean one: plant a Magic Bean as child, then ride the sprout as adult. If the ladder route does not work for you, use a bean.")
ov("DT-4", "sw2",
   how="Burn the web with a Deku Stick, shoot the spider with the Slingshot and climb the vines. Nothing else is needed",
   note="Switch 2 guides (VGC, Game8, TheGamer) need no bombs and no Boomerang here. The N64 route needs both, so this one can be done on your first visit.")
ov("SP-3", "sw2",
   note="Game8 and TheGamer list the Boomerang for this one, so it is shown as a requirement.")
ov("SP-2", "sw2",
   where="Big statue room on the second floor, northeast corner by the statue",
   how="Use a Bombchu to open the sun-marked wall, climb up, and kill the spider by the statue",
   note="Game8, RPG Site and TheGamer put this token by the giant statue and need a Bombchu, not the Boomerang. The N64 spot is the Bombchu puzzle room.")
ov("DMT-1", "sw2",
   note="Game8: first blow up the boulder at the Dodongo's Cavern entrance with a Bomb Flower, which needs the Goron's Bracelet. Then the soft soil is reachable.")
ov("LH-2", "sw2",
   how="Kill it with the Boomerang or the Slingshot, then collect the token",
   note="Game8 lists the Boomerang or the Slingshot for this one.")
ov("BW-3", "sw2",
   note="Game8 lists the Boomerang and the Lens of Truth for this one, so the Boomerang is shown as a requirement.")
ov("DT-3", "sw2",
   note="Game8 lists the Slingshot for the basement tokens, so it is shown as a requirement.")
ov("CL-2", "sw2",
   where="Wall near the temple entrance, in the northwest corner, with birds nearby",
   how="Climb the wall, then kill the spider and take the token. Game8 lists the Hookshot or Longshot; other guides list no tool",
   age="Adult", time="Night",
   note="Four Switch 2 guides (VGC, RPG Site, TheGamer, Game8) put a token on a wall near the temple entrance at night instead of on the palm tree. The N64 palm tree spot is not listed.")
ov("HP-10", "sw2",
   age="Adult", time="Any",
   how="Finish Dampé's first race in the Graveyard (you win the Hookshot) and you come out in the windmill opposite the heart. Jump across the moving platforms and grab it",
   note="On N64 a child can fetch it with the Boomerang. Game8 says Heart Pieces cannot be picked up with the Boomerang or Hookshot on Switch 2, and Respec lists only the adult way, so the child route is not shown.")
ov("HP-11", "sw2",
   age="Either",
   how="Child: carry a Cucco over the grate at the windmill entrance, climb the ladder behind the windmill, flutter-jump to the roof with a second Cucco and talk to the man. Adult: Hookshot or Longshot onto the roof's vines, then talk to the man",
   note="Switch 2 gives child Link a real route with Cuccos (Respec, RPG Site). N64 needed the Hookshot as adult.")
ov("HP-22", "sw2",
   how="Child: carry a Cucco and flutter-jump to the ledges. Adult: use the Hover Boots, or a Cucco as well",
   note="The Boomerang does not pick up Heart Pieces on Switch 2 (Game8), so it is no longer listed here.")
ov("HP-26", "sw2",
   how="Catch a fish 55 cm or longer, which hangs out by the log, and have the owner measure it",
   note="Switch 2 measures fish in centimeters: 55 cm for the child prize (Respec).")
ov("SQ-10", "sw2",
   guide=["Pay the owner and take a rod.",
          "Catch a fish 55 cm (about 10 lb) or bigger.",
          "Show the catch to the owner for the Heart Piece.",
          "Do not use the Sinking Lure hidden in the pond. It disqualifies record catches."],
   note="Guides give the Switch 2 target as 55 cm (Respec) or 10 lb (FinalBoss), so the game may show either unit. The adult target is 65 cm or 13 lb.")
ov("SQ-32", "sw2",
   guide=["Pay the owner and take a rod.",
          "Catch a fish over 65 cm (about 13 lb), bigger than the child target.",
          "Show it to the owner for the Golden Scale.",
          "Avoid the Sinking Lure, which does not count for record prizes."],
   note="Guides give the Switch 2 target as 65 cm (Respec) or 13 lb (FinalBoss), so the game may show either unit.")

# Great Fairies
ov("SQ-19", "sw2",
   reward="Magic Meter and Din's Fire",
   avail="After Dodongo's Cavern. You also need Zelda's Lullaby and about 25 rupees.",
   guide=["Reach the summit of Death Mountain Trail.",
          "Bomb the wall next to the owl, Kaepora Gaebora, to open the fountain.",
          "Stand on the Triforce mark in the fountain and play Zelda's Lullaby. The fairy asks for a 25-rupee offering and gives you the Magic Meter and Din's Fire."],
   note="Switch 2 moved Din's Fire here from the Hyrule Castle fairy, and the spin attack moved there (Game8).")
ov("SQ-20", "sw2",
   reward="Improved Spin Attack",
   avail="After you have bombs and Zelda's Lullaby, and about 50 rupees. Optional on Switch 2.",
   guide=["From the Market, climb the vines on the cliff beside the main path and jump past the gate.",
          "Head right to the rocky alcove, bomb the boulder and crawl in.",
          "Stand on the Triforce mark and play Zelda's Lullaby. The fairy asks for a 50-rupee offering and gives you the stronger spin attack."],
   note="Switch 2 swapped the rewards: this fairy now gives the spin attack, and Din's Fire is at the Death Mountain Trail fairy. You do not need it to finish the game.")
ov("SQ-25", "sw2", note="Switch 2: the fairy asks for a 100-rupee offering (Game8).")
ov("SQ-40", "sw2", note="Switch 2: the fairy asks for a 200-rupee offering (Game8).")
ov("SQ-42", "sw2", note="Switch 2: the fairy asks for a 300-rupee offering, and Game8 says you need the Lens of Truth to find the cracked wall (Game8).")
ov("SQ-43", "sw2", note="Switch 2: the fairy asks for a 500-rupee offering (Game8).")

# ---------------------------------------------------------------- game notes
VNOTES["side"]["sw2"]["items"] = [
    x for x in VNOTES["side"]["sw2"]["items"] if x != "The Great Fairy fountains are in the same places."]
VNOTES["side"]["sw2"]["items"].insert(1,
    "Great Fairies: the two early ones swapped rewards. Death Mountain Trail gives the Magic Meter and Din's Fire (SQ-19), and Hyrule Castle gives the stronger spin attack (SQ-20, optional). Every fairy now asks for rupees: 25, 50, 100, 200, 300 and 500 (Game8).")
VNOTES["side"]["sw2"]["items"] = [
    x.replace("Your starting wallet holds 200 rupees (N64: 99).",
              "Your starting wallet holds 200 rupees (N64: 99), and the upgrades are 500 and 1,000.")
    for x in VNOTES["side"]["sw2"]["items"]]
VNOTES["skull"]["sw2"]["items"] = [
    x.replace("The Adult's and Giant's Wallet sizes are not confirmed.", "The upgrades are 500 and 1,000 (Respec, How To Video Game).")
    for x in VNOTES["skull"]["sw2"]["items"]]
VNOTES["heart"]["sw2"]["items"].insert(5,
    "The Kakariko windmill piece (HP-10) is adult only. The Boomerang does not pick up Heart Pieces on Switch 2, and the Zora's River pieces now use Cuccos. Granny's roof (HP-11) has a child route with Cuccos.")

# ---------------------------------------------------------------- Round 23: Switch 2 Gold Skulltula audit
# Every sw2 token checked against two Switch 2 guides: VGC's per-area pages and RPG Site's Switch 2 minimalist 100% walkthrough.
# Where both agree with each other and not with us, the row follows them. GameWith's remake map pages repeat the N64 list, so they are not used.
GATE_V.update({
    ("sw2", "WT-1"): ["@water", "i_bombs"],
    ("sw2", "WT-3"): ["@water", "i_ironboots"],
    ("sw2", "ST-3"): ["@shadow", "i_hookshot"],
    ("sw2", "ST-4"): ["@shadow", "s_scare", ["i_hookshot", "i_longshot"]],
    ("sw2", "ST-5"): ["@shadow", "i_bombs"],
})
_A = "Checked against VGC and RPG Site (both Switch 2 guides)."
ov("KF-2", "sw2", where="Soft soil behind the Kokiri Shop")
ov("DT-1", "sw2", where="Compass room, reached from the raised platforms (VGC: on the south wall)")
ov("DT-4", "sw2", where="Torch room with the Gohma Larvae, behind the web in the passage on the left")
ov("FT-2", "sw2", where="Main hall, by the north door: look left as you reach it, on the back of the wall",
   note="RPG Site: at the north door, look left. VGC: on the back of one of the north walls.")
ov("FT-4", "sw2", where="Balcony in the northwest room where you land after the Boss Key drop, on the wall by the south ledge",
   how="After taking the Boss Key you drop out onto the balcony. Go to the south ledge and Hookshot the spider on the wall",
   note="VGC and RPG Site agree on the balcony after the Boss Key.")
ov("HC-1", "sw2", where="Castle grounds, the tree beside the hedge maze and the vine-covered building (right of the vines up to the castle)")
ov("HC-2", "sw2", where="Castle grounds, the tree in the corner where Talon was asleep, facing Castle Town")
ov("KAK-1", "sw2", where="Lone tree in the middle of the village")
ov("KAK-5", "sw2", how="Kill it with the Boomerang (or the Slingshot), then climb the ladder for the token if it stays up")
ov("KAK-6", "sw2", note="RPG Site words it as behind the southernmost house, reached with the Hookshot; GameWith as its roof, via the House of Skulltula roof. Same house.")
ov("GV-1", "sw2", where="Under the first small wooden bridge as you enter the valley")
ov("GF-1", "sw2", where="Outside wall at the far east of the fortress", note=_A)
ov("DMT-3", "sw2", where="Red boulder just outside the Goron City entrance",
   note="VGC and RPG Site both put this hammer boulder at the Goron City entrance, not above Dodongo's Cavern.")
ov("GC-2", "sw2", note="RPG Site: top floor, behind the central rock. VGC: head north from the entrance and look up at the ceiling. Check both spots.")
ov("IC-2", "sw2", where="End of the east corridor, in the Compass room, on the wall (there is no Piece of Heart here on Switch 2)")
ov("IC-3", "sw2", where="Sliding block room, up high near the entrance (VGC: on the ceiling)")
ov("JB-1", "sw2", where="Room with the water switches and the Dungeon Map chest, on the vines opposite the chest")
ov("JB-2", "sw2", where="Wall of the room you drop into after clearing the tentacles")
ov("JB-3", "sw2", where="A little further along the same path, on the ceiling")
ov("WT-1", "sw2", where="Blue-lit east room (Ruto's room), at the middle water level",
   how="Set the water to the middle level, swim into the blue-lit east room, surface and bomb the cracked wall. The spider is inside",
   note="Replaces the N64 token at the end of the south passage. " + _A)
ov("WT-3", "sw2", where="Inside the central pillar, in the basement under the floating block",
   how="With the water at the middle level, sink inside the central pillar with the Iron Boots through the passage below the floating block and follow it to the spider (VGC says the highest level)",
   note="Replaces the N64 token in the falling-platform waterfall room. " + _A)
ov("ST-3", "sw2", where="Fan corridor, just past the gap you Hookshot over",
   how="Hookshot across the gap in the fan corridor, then turn round: the spider is behind you",
   note="Replaces the N64 token behind the single giant skull pot. " + _A)
ov("ST-4", "sw2", how="At the boat dock, move the block on the left, play the Scarecrow's Song and Hookshot up to Pierre and the spider",
   note="The plain Hookshot is enough on Switch 2 (VGC, RPG Site).")
ov("ST-5", "sw2", where="Far west room with the three skull pots",
   how="Throw a bomb into each of the three skull pots and the spider appears", note=_A)
ov("BW-1", "sw2", where="West locked room in the central area",
   how="Unlock it with a Small Key. VGC says the spider hides in a coffin: burn it with a Deku Stick",
   note="VGC and RPG Site both put a token in the west locked room.")
ov("BW-2", "sw2", note="Switch 2 guides differ on this one: VGC says a locked room in the central area, RPG Site a door behind the safe path in the Beamos room. Both need the Lens of Truth to find the way.")

# ---------------------------------------------------------------- Round 23: Switch 2 Heart Piece audit (RPG Site's Switch 2 list and walkthrough, Respec, games.gg)
# FinalBoss's "Switch 2" heart list still has the Ice Cavern piece and the Sun's Song grave, so it repeats the N64 list and is not used.
ov("HP-8", "sw2", where="Crumbling stone building in the back (southwest) corner of the ranch",
   how="Move the crates away from the wall and crawl through the gap to the room with the heart",
   note="RPG Site and games.gg both call it the crumbling building in the back/southwest corner.")
ov("HP-25", "sw2", note="Din's Fire lights them all at once and is the quick way on Switch 2 (RPG Site, games.gg). A Deku Stick still works if you are fast.")
ov("HP-13", "sw2", note="A different grave than on N64, and the Sun's Song is not needed. Guides disagree on which grave it is; RPG Site's Switch 2 walkthrough says the south-east set of graves, at night.")
ov("SQ-37", "sw2", note="Switch 2 guides split on the quiver score: GameWith and FinalBoss say 1,500 (as on N64), RPG Site and InGameNews say 1,400. Aim for 1,500 to be safe.")
GNOTE.update({
    ("skull", "Great Deku Tree"): {"sw2": "All for child Link, and nothing beyond what the dungeon gives you is needed on Switch 2 (VGC), so all four can be done on the first visit."},
    ("skull", "Forest Temple"): {"sw2": "All for adult Link. One (FT-3) needs the Scarecrow's Song with the Hookshot on Switch 2; the Hookshot gets the rest."},
    ("skull", "Shadow Temple"): {"sw2": "All for adult Link. Bring the Lens of Truth, bombs, the Hover Boots, the Hookshot and the Scarecrow's Song. Two tokens moved on Switch 2 (ST-3 to the fan corridor, ST-5 now needs bombs in the skull pots)."},
    ("skull", "Water Temple"): {"sw2": "All for adult Link. Two tokens moved on Switch 2 (WT-1: the blue east room's bomb wall; WT-3: the central pillar basement). Bring bombs, the Iron Boots and the Longshot."},
    ("skull", "Bottom of the Well"): {"sw2": "All for child Link. Drain the well with the Song of Storms in the windmill, and bring the Lens of Truth, Deku Sticks and small keys."},
})
VNOTES["skull"]["sw2"]["lead"] = ("Checked token by token (Nov 8, 2026) against two complete Switch 2 guides: VGC's area pages and RPG Site's Switch 2 100% walkthrough. "
    "Where both put a token somewhere other than N64, the row follows them and is marked. Where they disagree, the row says so in its note. "
    "Still 100 tokens.")
VNOTES["skull"]["sw2"]["items"] = [x for x in VNOTES["skull"]["sw2"]["items"]
    if not x.startswith("Everything else is unconfirmed") and not x.startswith("Moves three guides agree on")]
VNOTES["skull"]["sw2"]["items"].insert(2, "Moved on Switch 2: Hyrule Field (three tokens), Lon Lon Ranch (three), the Lake Hylia cave, the Zora's River bug hole, the Forest Temple Pierre spot (FT-3) and balcony (FT-4), two Water Temple tokens (WT-1, WT-3), two Shadow Temple tokens (ST-3, ST-5), the hammer boulder by Goron City (DMT-3), and several smaller ones. If an area's count on the in-game map does not match this list, trust the map.")
GATE_V[("sw2", "KAK-5")] = ["i_fairyoc", ["i_boomerang", "i_sling"]]

# Round 24: the well tokens sit behind locked doors and hidden paths. The keys and paths need the Lens of Truth (user report;
# VGC: keys hide in alcoves only the Lens shows), so every BW token needs the Lens. N64/3DS spiders are out of reach: Boomerang.
_KEY = " You need a Small Key from this dungeon; some are in alcoves you only see with the Lens of Truth (keys are not tracked here)."
for _b, _h in (("BW-1", "Unlock the door; the spider is along the back wall. Fetch the token with the Boomerang."),
               ("BW-2", "Defeat the Keese, then use the Lens of Truth to reveal the path to the spider. Fetch the token with the Boomerang."),
               ("BW-3", "Unlock the door, avoid the invisible pits, and find the spider on the wall of the Like Like room. Fetch the token with the Boomerang.")):
    pass
ov("BW-1", "sw2", how="Unlock it with a Small Key. VGC says the spider hides in a coffin: burn it with a Deku Stick." + _KEY)
ov("BW-2", "sw2", how="Unlock the room and use the Lens of Truth to find the way to the spider." + _KEY)
ov("BW-3", "sw2", how="Find the hidden way east with the Lens of Truth, unlock the door, avoid the invisible pits, and get the spider behind the Like Like. Fetch the token with the Boomerang." + _KEY)

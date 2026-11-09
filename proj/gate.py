# Story gating for the existing rows: id -> what must be done first, in NORMAL play (no glitches, no tricks).
#
# A requirement list means "all of these". Each entry is one of:
#   "i_bombs"       an item, song or trade row key (extra.py), a story step key (main.py) or a row id such as "SQ-23"
#   "@forest"       everything that must be done before story step "forest" (not the step itself)
#   "GS:50"         50 Gold Skulltula tokens collected on this tab
#   "BOTTLE"        any one bottle from the Items tab
#   ["a", "b+c"]    ANY ONE of these; "b+c" means both b and c
# Adult rows automatically also need the Master Sword (added by the build).
# Alias names are mapped to step keys by ALIAS.

ALIAS = {
    "oc": "ocarina", "brace": "bracelet", "hook": "hookshot", "ztunic": "zoratunic", "gtunic": "gorontunic",
    "farrow": "firearrows", "larrow": "lightarrows", "sgaunt": "spiritchild",
}

BOTTLE = ["b_ruto", "b_anju", "b_talon", "b_poe", "b_potion"]

# crossing the broken Gerudo Valley bridge as an adult: Epona or the Longshot
BRIDGE = ["SQ-28", "i_longshot"]

# The Master Sword is added automatically to every row that needs adult Link.
ADULT = "i_mastersword"

GATE = {
    # ---------------- Gold Skulltulas ----------------
    "KF-1": ["i_sword"], "KF-2": ["BOTTLE"], "KF-3": ["i_hookshot"],
    "LW-1": ["BOTTLE"], "LW-2": ["BOTTLE"], "LW-3": ["SQ-23"], "SFM-1": ["i_hookshot", "s_saria"],
    "HF-1": ["i_bombs", ["i_boomerang", "i_hookshot"]], "HF-2": ["i_bombs", "i_dins"], "HF-3": ["i_bombs"],
    "LLR-1": ["i_fairyoc"], "LLR-2": ["i_fairyoc"], "LLR-3": ["i_boomerang"], "LLR-4": ["i_boomerang"],
    "MKT-1": ["i_fairyoc"], "HC-1": ["i_fairyoc"], "HC-2": ["s_storms", "i_bombs"], "GAN-1": ["castle"],
    "KAK-1": ["i_fairyoc"], "KAK-2": ["i_fairyoc"], "KAK-3": ["i_fairyoc"], "KAK-4": ["i_fairyoc"], "KAK-5": ["i_fairyoc"],
    "KAK-6": ["i_hookshot"],
    "GY-1": ["i_fairyoc", "BOTTLE"], "GY-2": ["i_boomerang"],
    "DMT-1": ["gate", "BOTTLE"], "DMT-2": ["i_bombs"], "DMT-3": ["i_hammer"], "DMT-4": ["i_hammer"],
    "GC-1": ["i_bombs"], "GC-2": ["i_hookshot"],
    "DMC-1": ["i_bombs"], "DMC-2": ["s_bolero", "BOTTLE"],
    "ZR-1": ["i_bombs"], "ZR-2": ["i_bombs"], "ZR-3": ["i_hookshot"], "ZR-4": ["i_hookshot"],
    "ZD-1": ["i_hookshot"],
    "ZF-1": ["king"], "ZF-2": ["i_boomerang"], "ZF-3": ["i_silvergaunt", "i_lens"],
    "LH-1": ["i_fairyoc", "BOTTLE"], "LH-2": ["i_boomerang"], "LH-3": ["i_fairyoc"],
    "LH-4": ["i_zora", "i_ironboots", "i_hookshot"], "LH-5": ["i_longshot"],
    "GV-1": ["i_boomerang"], "GV-2": ["i_fairyoc", "BOTTLE"], "GV-3": ["i_longshot"], "GV-4": ["i_hookshot", BRIDGE],
    "GF-1": ["i_hookshot", BRIDGE], "GF-2": ["i_longshot"], "HW-1": ["i_card", "i_hover", "i_lens"],
    "CL-1": ["s_requiem", "BOTTLE"], "CL-2": ["s_requiem", "i_longshot"], "CL-3": ["s_requiem", "SQ-23"],
    "DT-1": ["i_sword", "i_shield"], "DT-2": ["i_sword", "i_shield"], "DT-3": ["i_sword", "i_shield"],
    "DT-4": ["i_bombs", "i_boomerang"],
    "DC-1": ["i_bracelet"], "DC-2": ["i_bracelet"], "DC-3": ["i_bracelet"], "DC-4": ["i_bracelet", ["i_boomerang", "i_hookshot"]],
    "DC-5": ["i_bracelet", "i_hookshot", "s_scare"],
    "JB-1": ["king"], "JB-2": ["king"], "JB-3": ["king"], "JB-4": ["king"],
    "FT-1": ["@forest"], "FT-2": ["@forest"], "FT-3": ["@forest"], "FT-4": ["@forest"], "FT-5": ["@forest"],
    "FIRE-1": ["@fire"], "FIRE-2": ["@fire"], "FIRE-3": ["@fire", "s_scare"], "FIRE-4": ["@fire", "s_scare"], "FIRE-5": ["@fire"],
    "WT-1": ["@water"], "WT-2": ["@water"], "WT-3": ["@water"], "WT-4": ["@water"], "WT-5": ["@water"],
    "ST-1": ["@shadow"], "ST-2": ["@shadow"], "ST-3": ["@shadow"], "ST-4": ["@shadow", "s_scare"], "ST-5": ["@shadow"],
    "SP-1": ["@spiritchild"], "SP-2": ["@spiritchild"], "SP-3": ["@spiritchild"],
    "SP-4": ["@spirit"], "SP-5": ["@spirit", "s_scare"],
    "BW-1": ["@well", "i_lens", "i_boomerang"], "BW-2": ["@well", "i_lens", "i_boomerang"], "BW-3": ["@well", "i_lens", "i_boomerang"],
    "IC-1": ["@ice", "i_hookshot"], "IC-2": ["@ice", "i_hookshot", "BOTTLE"], "IC-3": ["@ice", "i_hookshot"],
    # ---------------- Heart Pieces ----------------
    "HP-1": ["s_saria"], "HP-2": ["i_fairyoc"], "HP-3": ["i_fairyoc"], "HP-4": ["dodongo"], "HP-5": ["i_fairyoc"],
    "HP-6": ["i_bombs"], "HP-7": ["i_bombs", ["i_goldscale", "i_ironboots"]],
    "HP-8": ["i_fairyoc"], "HP-9": ["i_fairyoc", ["i_bombs", "i_hookshot"]], "HP-10": [["i_boomerang", "i_hookshot"]], "HP-11": ["i_hookshot"],
    "HP-12": ["GS:50"], "HP-13": ["s_sun"], "HP-14": ["i_fairyoc"], "HP-15": [["SQ-23", "i_hookshot"]],
    "HP-16": ["i_hookshot"], "HP-17": ["i_bracelet"], "HP-18": ["i_bracelet"], "HP-19": ["i_bombs"],
    "HP-20": ["s_bolero", "SQ-23"], "HP-37": ["i_bombs"],
    "HP-21": ["i_bombs"], "HP-22": ["i_bombs"],
    "HP-23": ["s_storms"], "HP-24": ["s_storms", "s_epona", "s_sun"],
    "HP-25": ["zora"], "HP-26": ["i_fairyoc"], "HP-27": ["i_goldscale"], "HP-28": [["SQ-23", "s_scare+i_hookshot"]],
    "HP-29": ["i_hookshot"], "HP-30": ["i_zora", "i_ironboots"], "HP-31": ["@ice", "BOTTLE"],
    "HP-32": ["i_fairyoc"], "HP-33": ["i_fairyoc"],
    "HP-34": [["i_longshot", "s_scare+i_hookshot+SQ-28"]],
    "HP-35": ["i_card", "SQ-28", "i_bow"], "HP-36": ["s_requiem", "SQ-23"],
    # ---------------- Side quests ----------------
    "SQ-44": ["i_fairyoc"], "SQ-1": ["s_saria"], "SQ-2": ["i_fairyoc"], "SQ-3": ["i_sling"], "SQ-4": ["i_fairyoc"],
    "SQ-5": ["i_fairyoc"], "SQ-6": ["i_fairyoc"], "SQ-7": ["i_sling", "i_fairyoc"], "SQ-8": ["talon"], "SQ-9": ["talon"],
    "SQ-10": ["i_fairyoc"], "SQ-11": ["i_fairyoc"], "SQ-12": ["i_fairyoc"],
    "SQ-13": ["gate"], "SQ-14": ["t_keaton"], "SQ-15": ["t_truth"], "SQ-16": ["i_fairyoc"], "SQ-17": ["GS:1"],
    "SQ-18": ["i_bombs"], "SQ-19": ["i_bombs", "s_lullaby"], "SQ-20": ["i_bombs", "s_lullaby", "i_magic"],
    "SQ-21": ["dodongo"], "SQ-22": ["i_bombs"], "SQ-23": ["i_bombs"], "SQ-24": ["zora"], "SQ-25": ["king", "i_bombs"],
    "SQ-26": ["i_bombs"],
    "SQ-27": [], "SQ-28": ["s_epona"], "SQ-29": [], "SQ-30": ["i_bombs"], "SQ-31": ["i_bombs"],
    "SQ-32": [["water", "s_scare+i_hookshot"]],
    "SQ-33": ["SQ-28", "i_bow", "BOTTLE"], "SQ-34": ["i_bow"], "SQ-35": ["SQ-28"], "SQ-36": [BRIDGE],
    "SQ-37": ["i_card", "SQ-28", "i_bow"], "SQ-38": ["i_card", "i_bow", "i_hammer", "i_longshot", "i_ironboots", "i_lens", "s_time"], "SQ-39": ["SQ-36"],
    "SQ-40": ["i_hammer", "i_goron"], "SQ-41": ["water", "i_bow"],
    "SQ-42": ["i_card", ["i_hover", "i_longshot"], "i_lens", "i_bombs"], "SQ-43": ["i_goldgaunt"],
}

# Version differences: (version, id) -> replacement requirement list
GATE_V = {
    # Switch 2: two visits, adult first (Fairy Note), then child
    ("sw2", "HP-6"): ["i_bombs", "i_mastersword"],
    ("sw2", "HP-7"): ["i_mastersword"],
    # Switch 2: no Sun's Song needed
    ("sw2", "HP-13"): ["i_fairyoc"],
    # Switch 2: the child shortcut is gone, so a bean (or the Hover Boots) is needed
    ("sw2", "HP-17"): [["SQ-23", "i_hover"]],
}

# Rows that are the same achievement seen from two tabs.
# (reward row key or id, side quest id, mode)
#   "full": tick either one and the other follows. A quest with several linked rewards ticks only when all of them are done.
#   "up":   ticking the quest ticks the reward, but ticking the reward does not finish the quest (it has other prizes).
LINKS = [
    ("HP-1", "SQ-1", "full"), ("HP-2", "SQ-2", "full"), ("HP-3", "SQ-6", "full"), ("HP-4", "SQ-21", "up"),
    ("HP-5", "SQ-16", "full"), ("HP-14", "SQ-11", "full"), ("HP-16", "SQ-27", "full"),
    ("HP-23", "SQ-26", "full"), ("HP-24", "SQ-26", "full"), ("HP-26", "SQ-10", "full"), ("HP-35", "SQ-37", "up"),
    ("i_magic", "SQ-19", "full"), ("i_dins", "SQ-20", "full"), ("i_farore", "SQ-25", "full"),
    ("i_nayru", "SQ-42", "full"), ("i_magic2", "SQ-40", "full"), ("i_defense", "SQ-43", "full"),
    ("i_firearrows", "SQ-41", "full"), ("i_icearrows", "SQ-38", "full"), ("i_knife", "SQ-30", "full"),
    ("i_biggoron", "SQ-29", "full"), ("i_card", "SQ-36", "full"), ("i_hookshot", "SQ-27", "up"),
    ("b_anju", "SQ-5", "full"), ("b_talon", "SQ-9", "full"),
    ("b_poe", "SQ-33", "full", ["n64", "3ds"]), ("b_poe", "SQ-33", "up", ["sw2"]), ("b_potion", "SQ-44", "full"), ("s_epona", "SQ-8", "full"),
    ("s_scare", "SQ-12", "full"), ("i_silverscale", "SQ-24", "full"), ("i_goldscale", "SQ-32", "full"),
    ("i_goron", "SQ-31", "full"), ("i_wallet2", "hs10", "full"), ("i_wallet3", "hs30", "full"), ("HP-12", "hs50", "full"),
    ("i_agony", "hs20", "full", ["n64"]), ("i_agony", "hs20_3ds", "full", ["3ds"]), ("i_agony", "hs20_sw", "full", ["sw2"]),
]

# Upgrade pairs that can be won in either order: (item, [quests], how many of them are needed).
# The first quest you finish gives the middle size (1 of 2), the second gives the biggest (2 of 2).
DERIVED = [
    ("i_bomb2", ["SQ-21", "SQ-22"], 1), ("i_bomb3", ["SQ-21", "SQ-22"], 2),
    ("i_bullet2", ["SQ-3", "SQ-7"], 1), ("i_bullet3", ["SQ-3", "SQ-7"], 2),
    ("i_quiver2", ["SQ-34", "SQ-37"], 1), ("i_quiver3", ["SQ-34", "SQ-37"], 2),
    ("i_stick2", ["SQ-4", "SQ-14"], 1), ("i_stick3", ["SQ-4", "SQ-14"], 2),
    ("i_nut2", ["SQ-18", "SQ-15"], 1), ("i_nut3", ["SQ-18", "SQ-15"], 2),
]

# Hearts that are prizes of a side quest. They move into their own section on the Hearts tab.
HEART_FROM_QUEST = ["HP-1", "HP-2", "HP-3", "HP-4", "HP-5", "HP-12", "HP-14", "HP-16", "HP-23", "HP-24", "HP-26", "HP-35"]

# Rows that need both Links in the normal route: id -> what to do as each Link.
BOTH = {
    "LW-3": "Child: plant a Magic Bean in the soil. Adult: ride the sprout up and kill the spider.",
    "CL-3": "Child: plant a Magic Bean in the soil beside the temple. Adult: ride the sprout to the mound and kill the spider.",
    "DMC-2": "Adult: learn the Bolero of Fire. Child: warp in with it and release a bottled bug on the soil.",
    "HP-15": "Child: plant a Magic Bean in the soft soil. Adult: ride the sprout up (or skip the bean with the Hookshot).",
    "HP-20": "Child: warp in with the Bolero of Fire and plant a Magic Bean. Adult: ride the sprout to the top of the pillar.",
    "HP-28": "Child: plant a Magic Bean outside the lab, or teach Pierre a song. Adult: ride the sprout, or Hookshot to Pierre.",
    "HP-36": "Child: warp in with the Requiem of Spirit and plant a Magic Bean. Adult: ride the sprout and jump to the heart.",
}
BOTH_V = {
    ("sw2", "HF-2"): "Child first: bomb into the marsh grotto and kill the ordinary Skulltula. Adult second: come back and roll into the crate for the gold one.",
    ("sw2", "HP-6"): "Adult first: read the Fairy Note by the tree. Child second: buy the Piece of Heart.",
    ("sw2", "HP-7"): "Adult first: read the Fairy Note beside the chest. Child second: open the chest.",
    ("sw2", "HP-17"): "Child: plant a Magic Bean outside Dodongo's Cavern. Adult: ride the sprout up.",
}

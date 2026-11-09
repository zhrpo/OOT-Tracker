# Version layer for the Ocarina of Time tracker.
# N64 is the baseline. Each override is keyed by row id, then version key.
# Override fields: where, how, age, time, name, kind, avail, start, reward,
#   guide (replace), guide_add (appended steps), note (visible, spoiler-free), hide.
# ONLY lists the versions a row exists in (default: all).

VERS = [
    {"k": "n64", "name": "Nintendo 64"},
    {"k": "3ds", "name": "3DS"},
    {"k": "sw2", "name": "Switch 2"},
]

ONLY = {
    "HF-3": ["sw2"],
    "HP-37": ["sw2"],
    "SQ-44": ["sw2"],
}

FISH_3DS = ("The pond is redesigned on 3DS and the Sinking Lure sits in a different spot "
            "(one wiki reports this and flags it as unverified).")

OV = {
    # ---- Heart Pieces ----
    "HP-6": {"sw2": {
        "where": "Hyrule Field: grotto on the castle side of the moat, right of the castle gate, beside a single tree",
        "how": "Two visits. Bomb the cracked ground by the tree to open the grotto. As adult, read the Fairy Note by the tree to learn the shop password (Sell somethin', will ya?). The shop is sold out then. As child, go back, say the password to the Business Scrub and buy the Piece of Heart for 100 rupees",
        "age": "Child", "time": "Any",
        "note": "A new password shop (100 rupees) replaces the 10-rupee scrub in the fenced square.",
    }},
    "HP-7": {"sw2": {
        "where": "Hyrule Field, Gerudo side: chest under the red rock outcropping near Gerudo Valley",
        "how": "Two visits. As adult the chest is empty and a Fairy Note beside it explains why, so read it. Then come back as child and open the chest for the Piece of Heart. It stays locked as child until you have read the note",
        "age": "Child", "time": "Any",
        "note": "A time-travel chest replaces the underwater grotto piece.",
    }},
    "HP-13": {"sw2": {
        "where": "Kakariko Graveyard: the top-right grave near the graveyard entrance, no longer the flowered one by the Royal Family's Tomb",
        "how": "Pull the grave, drop into the grotto below and take the Piece of Heart. The Sun's Song is not needed. Guides disagree on which grave: one says top-right near the entrance, one says two graves to the left of the old spot, and one says near the tomb. Try those in turn",
        "note": "A different grave than on N64, and the Sun's Song is not needed. Guides disagree on which grave it is.",
    }},
    "HP-14": {"sw2": {
        "note": "Quicker on Switch 2 (Dampé follows you). Same 10-rupee price.",
    }},
    "HP-17": {"sw2": {
        "how": "Plant a Magic Bean in the soil outside Dodongo's Cavern as child, then ride the sprout up as adult. The child backflip shortcut no longer works",
        "age": "Adult",
        "note": "The early child shortcut is gone, so this one needs the bean and adult Link.",
    }},
    "HP-19": {"sw2": {
        "note": "Guides disagree on the route: one says Hookshot from Biggoron's entrance as adult, another says climb down the nets as either age.",
    }},
    "HP-21": {"sw2": {
        "how": "Carry the Cucco from the river entrance and flutter-jump to the vines halfway up, then climb them. Up there, get a second Cucco: Nintendo Life says bomb the cracked hole south of the highest island, Respec says it comes out of the fairy grotto in the long grass. Glide from that ledge to the pillar. Adult can still use the bean plant or the Hover Boots",
        "note": "Changed on Switch 2: the old Cucco jump from the start no longer reaches it. Respec, RPG Site and Nintendo Life all route it through the vines and a second Cucco, but disagree on where that Cucco comes from.",
    }},
    "HP-33": {"sw2": {
        "where": "Chest on the cliff platform left of the bridge",
        "how": "Child: grab the Cucco near the bridge and glide southwest to the platform, then open the chest. Adult: drop to the Hyrule Field side ledge and Longshot over",
        "note": "Respec and Nintendo Life describe a chest here on Switch 2 (N64 and 3DS used a crate; RPG Site just says a ledge).",
    }},
    "HP-26": {"3ds": {"note": FISH_3DS}},
    "HP-31": {"sw2": {"hide": True}},
    "HP-37": {"sw2": {
        "note": "The Ice Cavern piece is gone on Switch 2 (HP-31 is not shown). This scrub takes its place. Three guides agree on the scrub.",
    }},

    # ---- Gold Skulltulas (Switch 2 moves reported by Game8, RPG Site and TheGamer) ----
    "HF-1": {"sw2": {
        "where": "Lone tree at the end of the stream in the southeast of the field, near the Kokiri Forest entrance",
        "how": "Roll into the tree so the spider drops, then kill it. Go at night: RPG Site says it only appears then. If you do not find it, check the other lone trees nearby, since guides differ on which one",
        "age": "Child", "time": "Night",
        "note": "The N64 grotto near the Kakariko entrance is not listed in any Switch 2 guide. This tree is (VGC, RPG Site, Game8, TheGamer).",
    }},
    "HF-2": {"sw2": {
        "where": "Cracked rock circle in the marsh in the southeast, near the Lake Hylia entrance",
        "how": "Bomb the cracked spot in the marsh and drop into the grotto. As child, kill the ordinary Skulltula inside. Come back as adult and roll into the wooden crate: the Gold Skulltula comes out",
        "age": "Both", "time": "Any",
        "note": "Replaces the web-covered grotto near Gerudo Valley, which no Switch 2 guide lists. One guide (RPG Site) puts the marsh in the west of the field instead of the southeast.",
    }},
    "HF-3": {"sw2": {
        "where": "Grotto just west of the Lake Hylia entrance, beside the Deku Scrub woods and a rock wall",
        "how": "Bomb the cracked spot, drop into the grotto and kill the spider, then collect the token with the Boomerang or Hookshot",
        "age": "Child", "time": "Any",
        "note": "A third field token that does not exist on N64. Four guides list it, and VGC says child Link can get it.",
    }},
    "KF-3": {"sw2": {
        "where": "Back side of the roof of the House of the Twins (the house with that name sign, not the one by the sword training area)",
        "how": "As adult at night, walk round behind the House of the Twins and look up at the back of the roof. Hookshot the spider and the token comes back with the hook",
        "note": "Confirmed in play: it sits on the back side of the roof. Easy to mix up with the house by the sword training area, so check the name sign.",
    }},
    "FT-3": {"sw2": {
        "where": "Northeast room with the stream (the east courtyard), up high above where you push the block down for the shortcut",
        "how": "After pushing the block down to make the shortcut, turn round and look up: Navi marks a Pierre spot. Play the Scarecrow's Song and Hookshot up to Pierre, then kill the spider",
        "note": "Needs the Scarecrow's Song on Switch 2 (VGC; confirmed in play). On N64/3DS you Hookshot the small chest on the island instead.",
    }},
    "FT-4": {"sw2": {
        "note": "VGC places it on the wall by the south ledge of the balcony in the northwest room, where you land after dropping down with the Boss Key.",
    }},
    "GV-3": {"sw2": {
        "how": "Hookshot or Longshot the spider. Cross the broken bridge with Epona first if the carpenters have not fixed it yet",
        "note": "Confirmed in play: the regular Hookshot reaches it on Switch 2 (N64 needs the Longshot).",
    }},
    "LLR-1": {"sw2": {
        "note": "Any time of day. VGC and RPG Site give no time for the tree (they mark the other two ranch spiders as night only), and FinalBoss lists it as any time.",
    }},
    "LLR-2": {"sw2": {
        "where": "Ruined tower in the southwest corner of the ranch, on the vines overhead",
        "how": "Look up inside the tower, kill the spider and fetch the token with the Boomerang or Hookshot",
        "age": "Child", "time": "Night",
        "note": "Four guides list only three tokens at the ranch. VGC calls this one the ruined building by the northeast edge of the racetrack, so look at the ruins at either end if you do not see it.",
    }},
    "LLR-4": {"sw2": {"hide": True}},
    "ZR-1": {"sw2": {
        "where": "Soft soil in the bug hole beside the Magic Bean seller's spot",
        "how": "Release a bottled bug next to the soil",
        "age": "Child", "time": "Any",
        "note": "New on Switch 2: this hole had no token on N64. The river-start tree token is not listed in any Switch 2 guide.",
    }},
    "ZR-2": {"sw2": {
        "where": "Far upstream end of the river, on the lowest level behind the stone column",
        "how": "Drop down to the lowest level at the end of the river, look behind the column and kill the spider. VGC also says night, but other guides disagree, so come back after dark if it is missing",
        "age": "Child", "time": "Night",
        "note": "Moved from the waterfall ladder on N64. VGC also puts it at the very bottom of the river near the Zora's Domain waterfall.",
    }},
    "LH-3": {"sw2": {
        "where": "Hidden cave in the cliffs at the far south of the lake",
        "how": "Swim south past the islands to the cliffs and squeeze through the hole guarded by a Blue Tektite. Kill the spider inside",
        "age": "Child", "time": "Any",
        "note": "Replaces the two-pillar island token. Four guides list this cave or tunnel instead and none lists the island. VGC puts it on a small outcrop at the southwest point of the lake.",
    }},
    "HC-1": {"sw2": {
        "time": "Night", "nlabel": "Night first",
        "note": "VGC lists this tree as night only, beside the hedge maze near the vine-covered building. N64 guides disagree, so try it at night first.",
    }},

    # ---- Side quests ----
    "SQ-10": {"3ds": {"note": FISH_3DS}},
    "SQ-32": {"3ds": {"note": FISH_3DS}},
    "SQ-11": {"sw2": {
        "note": "Quicker on Switch 2. Same 10-rupee price per dig.",
        "guide_add": ["Switch 2: Dampé follows you from spot to spot instead of you following him."],
    }},
    "SQ-29": {
        "3ds": {
            "note": "Item descriptions tell you where to go next and the map marks the spot.",
        },
        "sw2": {
            "note": "One timed step gives you about a minute longer than on N64 (details in the spoiler guide).",
            "guide_add": ["Switch 2: the Odd Mushroom timer is about 4 minutes instead of 3, and you cannot Ocarina-warp while it runs."],
        },
    },
    "SQ-13": {"sw2": {
        "note": "Adult Link can also wear masks on Switch 2. One guide reports a change to how one sale pays out (in the spoiler guide).",
        "guide_add": ["Switch 2 (Game8 only, unconfirmed): the Running Man pays a Gold Rupee for the Bunny Hood instead of filling your wallet, and you can talk to him during the day."],
    }},
    "SQ-33": {"sw2": {
        "reward": "An Empty Bottle at 500 points (5 Big Poes), then a Gold Rupee worth 200 at 1,000 points (all 10). Each Big Poe pays 30 rupees and 100 points",
        "note": "Changed on Switch 2: the bottle now comes at 500 points instead of 1,000 (FinalBoss, GrindNStrat), and the Fairy Bow is not needed (confirmed in play).",
        "avail": "As adult, once you have Epona and an empty bottle. No Fairy Bow needed on Switch 2.",
        "guide": ["Ten Big Poes haunt specific spots in Hyrule Field. Most appear when you ride Epona past the spot.",
                  "Look for purple glowing lanterns and a purple haze around Epona's jump spots. They mark the Big Poe spawn points.",
                  "Defeat each Big Poe and catch its soul in an empty bottle. You do not need the Fairy Bow on Switch 2: the bottle and the Gold Rupee can both be won before the Forest Temple.",
                  "Take each soul to the Poe Collector. At 500 points (five Big Poes) you get the bottle; at 1,000 (all ten) a 200-rupee Gold Rupee.",
                  "Rough hotspots: near the Market signpost, the tree by the ranch entrance, bushes by the river west of the Market, and the fork toward Gerudo Valley. Six of the ten sit near Lon Lon Ranch."],
    }},
    "SQ-44": {"sw2": {
        "reward": "A new Empty Bottle (new in the Switch 2 remake), then a Red Potion as thanks",
        "guide": ["Talk to the shopkeeper and agree to help (\"Leave it to me!\"). He hands you an empty bottle.",
                  "Equip the bottle. The loose bug is on the shop floor near the entrance; use the bottle right next to it.",
                  "Talk to him again. He gives you a Red Potion and you keep the bottle."],
        "note": "New on Switch 2. FinalBoss and GrindNStrat both describe this errand.",
    }},
}

# Group-level notes, keyed by (tab, group name) -> version -> text
GNOTE = {
    ("skull", "Hyrule Field"): {
        "sw2": "Four Switch 2 guides list three tokens in the field, not two, and none lists the two N64 grottos. Details differ between guides, so treat these spots as reported rather than confirmed. Grottos now show cracked ground where you should use a bomb, and the Echo Gem also reacts near secret grottos.",
    },
    ("skull", "Lon Lon Ranch"): {
        "sw2": "Four Switch 2 guides list three tokens here, not four: the tree, the house window and a ruined tower. VGC says none of the three appear in the daytime.",
    },
    ("skull", "Zora's River"): {
        "sw2": "Four Switch 2 guides agree the bug hole beside the Magic Bean seller now holds a token and the lowest-level token moved. The river-start tree token is not listed. The total is still four.",
    },
    ("skull", "Kakariko Village"): {
        "sw2": "All night only. One Switch 2 guide lists the tree as any-time and the rest say night. VGC's village and graveyard list has 7 spiders and leaves out the adult rooftop one (KAK-6), which three other guides include.",
    },
    ("skull", "Lake Hylia"): {
        "sw2": "The pillar island token is not listed in four Switch 2 guides. A cave or tunnel in the far south takes its place.",
    },
}


def house_of_skulltula(row, ver):
    """House of Skulltula rewards differ by version; rebuild reward + guide text."""
    base_guide = list(row["guide"])
    out = {}
    if ver == "3ds":
        out["reward"] = row["reward"].replace("Stone of Agony", "Shard of Agony")
        out["guide"] = [s.replace("Stone of Agony", "Shard of Agony") for s in base_guide]
        out["note"] = "The 20-token prize is the Shard of Agony. It chimes and flashes on screen near secret grottos, so no Rumble Pak is needed."
    elif ver == "sw2":
        out["reward"] = "Wallets, the Echo Gem, 20 Bombchus, a Heart Piece and rupees"
        out["guide"] = [
            base_guide[0],
            "10 tokens: Adult's Wallet (500). 20: Echo Gem. 30: Giant's Wallet (1,000). 40: 20 Bombchus. 50: Piece of Heart. 100: a Gold Rupee worth 200, every visit. Your starting wallet now holds 200 rupees (N64: 99), and the upgrades are 500 and 1,000.",
            base_guide[2],
        ]
        out["note"] = "The Echo Gem replaces the Stone of Agony and 40 tokens now gives 20 Bombchus instead of 10."
    return out


# Panel text shown above each list (spoiler-free), by tab then version.
EARLY = ("Early data: this version came out on Nov 5, 2026, and guides are still catching up. ")

VNOTES = {
    "skull": {
        "3ds": {
            "lead": "Same 100 tokens in the same places as the N64 game.",
            "items": [
                "The 20-token prize is the Shard of Agony instead of the Stone of Agony. It chimes and flashes on screen near secret grottos and needs no Rumble Pak.",
                "Bugs you release at a soft-soil patch all burrow in and you cannot scoop one back up, so bring a fresh bug for each patch.",
                "Master Quest, unlocked after you beat the game, moves the dungeon tokens. This tracker covers the normal quest only.",
            ],
        },
        "sw2": {
            "lead": EARLY + "Guides agree there are still 100 tokens and that some moved, but none has a full verified list. Only the moves that several guides (Game8, RPG Site, TheGamer, VGC) agree on are applied here, and those rows are marked. Every other spot is the N64 one.",
            "items": [
                "The 20-token prize is the Echo Gem, which replaces the Stone of Agony. You equip it from the menu and it chimes and glows near Gold Skulltulas.",
                "The 40-token prize is 20 Bombchus instead of 10. Your starting wallet now holds 200 rupees (Game8, Kotaku), up from 99. The Adult's and Giant's Wallet sizes are not confirmed.",
                "The map now shows how many tokens you have found in each area. If an area's count does not match this list, a token probably moved. VGC's area pages give the same per-area counts as this list for Hyrule Field, Lon Lon Ranch, Zora's River, Domain and Fountain together, and Lake Hylia.",
                "Moves three guides agree on: Hyrule Field has three tokens, Lon Lon Ranch three, the Lake Hylia pillar island is replaced by a cave, and Zora's River has a new bug-hole token. Guides still disagree on details and on night flags inside those areas.",
                "Everything else is unconfirmed. Several Switch 2 guides contradict each other on ages and night flags, so if a token is not where this list says, check that area's count on the map.",
                "Night tags: VGC says outdoor spiders only appear at night. Where an N64 guide said any time and a Switch 2 guide said night, the row says night first, since checking at night costs you nothing.",
                "Hidden grottos now show cracked ground where you should bomb, and the Song of Storms and the Echo Gem also reveal them. There are more of them than on N64.",
                "Time now keeps passing in towns and dungeons. The Sun's Song still switches between day and night.",
            ],
        },
    },
    "heart": {
        "3ds": {
            "lead": "Same 36 Heart Pieces in the same places as the N64 game.",
            "items": [
                FISH_3DS,
                "Climbing is a little faster and item swapping uses the touch screen. Neither changes where a piece is.",
            ],
        },
        "sw2": {
            "lead": EARLY + "There are still 36 pieces, but several moved or changed how you get them, and guides have not listed every change.",
            "items": [
                "The Ice Cavern piece is gone (HP-31 is hidden). A new Business Scrub in Death Mountain Crater sells one for 100 rupees (HP-37).",
                "Both Hyrule Field pieces (HP-6, HP-7) are new time-travel puzzles: read a Fairy Note as adult, then come back as child.",
                "The graveyard grave piece (HP-13) is in a different grave and no longer needs the Sun's Song. Guides disagree on which grave.",
                "The Zora's River pillar piece (HP-21) now needs a Cucco from a new grotto.",
                "The Death Mountain Trail piece above Dodongo's Cavern (HP-17) now needs the Magic Bean. The child shortcut is gone.",
                "Dampé's gravedigging tour is quicker (HP-14).",
                "Other pieces may have moved slightly or now sit in chests. No guide lists them all yet.",
                "The map shows how many pieces and tokens remain in each area.",
            ],
        },
    },
    "side": {
        "3ds": {
            "lead": "Same quests and rewards as the N64 game.",
            "items": [
                "The House of Skulltula 20-token prize is the Shard of Agony (SQ-17).",
                "Trade items tell you where to go next and the map marks the spot (SQ-29). Climbing is also a little faster.",
                "The Fishing Pond is redesigned and the Sinking Lure moved (SQ-10, SQ-32). Reported, not verified.",
            ],
        },
        "sw2": {
            "lead": EARLY + "Only the changes below have been reported. Other quests may differ in small ways that guides have not covered yet.",
            "items": [
                "New quest: help the Potion Shop keeper with a bug for a new Bottle (SQ-44). Previews hint at a second new quest involving Granny in Kakariko, which no guide documents yet.",
                "House of Skulltula: the Echo Gem at 20 tokens and 20 Bombchus at 40 (SQ-17).",
                "Dampé's gravedigging tour is quicker (SQ-11).",
                "Biggoron's Sword chain: the Odd Mushroom timer is about a minute longer (SQ-29).",
                "Big Poes are easier to find (SQ-33). One guide also lists different payouts there.",
                "One guide lists Bombchu Bowling at 10 rupees a game instead of 30 (SQ-21). Unconfirmed, so the 30 on N64 is shown.",
                "The Great Fairy fountains are in the same places.",
                "One guide (Game8) also reports: Malon gives you the Weird Egg right after you first meet her and it hatches at once, the Hylian Shield is no longer in the graveyard, bottle locations differ from N64, and the Zora Diving Game pays in scales instead of rupees. None of this is confirmed elsewhere, so the N64 versions are shown.",
                "Your starting wallet holds 200 rupees (N64: 99).",
                "Time now keeps passing in towns and dungeons, so day and night tags matter more. The Sun's Song still switches between them.",
            ],
        },
    },
}

VSOURCES = {
    "3ds": [
        ("Thonky: what is new in Ocarina of Time 3D", "https://www.thonky.com/ocarina-of-time/new-in-ocarina-3d"),
        ("Zelda Dungeon: little changes in OoT3D", "https://www.zeldadungeon.net/little-changes-ive-noticed-in-ocarina-of-time-3d/"),
        ("Zelda Wiki: Ocarina of Time 3D", "https://zelda.gamepedia.com/OoT3D"),
    ],
    "sw2": [
        ("VGC: Switch 2 Gold Skulltulas and what moved", "https://www.videogameschronicle.com/guide/zelda-ocarina-of-time-switch-2-all-gold-skulltula-locations-and-which-have-moved/"),
        ("Respec: Switch 2 100% walkthrough", "https://www.respec.net/guide/276-the-legend-zelda-ocarina-time-remake-walkthrough-100-completion-guide-with-all-switch-2-changes"),
        ("Respec: Switch 2 Heart Pieces", "https://www.respec.net/guide/280-the-legend-zelda-ocarina-time-remake-pieces-heart-list-every-heart-piece-location-including-those-moved-for-switch-2"),
        ("RPG Site: remake minimalist 100% walkthrough", "https://www.rpgsite.net/guide/21671-the-legend-zelda-ocarina-time-remake-minimalist-100-walkthrough-all-items-gold-skulltula-tokens-heart-pieces"),
        ("Game8: remake Gold Skulltulas", "https://game8.co/games/Zelda-Ocarina-of-Time/archives/616213"),
        ("Game8: differences between versions", "https://game8.co/games/Zelda-Ocarina-of-Time/archives/634657"),
        ("VGC: Hyrule Field Gold Skulltulas", "https://www.videogameschronicle.com/guide/all-hyrule-field-gold-skulltulas-in-zelda-ocarina-of-time-switch-2/"),
        ("VGC: Lon Lon Ranch Gold Skulltulas", "https://www.videogameschronicle.com/guide/lon-lon-ranch-gold-skulltulas/"),
        ("VGC: Lake Hylia Gold Skulltulas", "https://www.videogameschronicle.com/guide/all-lake-hylia-gold-skulltula-locations-in-zelda-ocarina-of-time-switch-2/"),
        ("VGC: Zora's River, Domain and Fountain", "https://www.videogameschronicle.com/guide/all-zora-river-domain-and-fountain-gold-skulltulas-in-zelda-ocarina-of-time-switch-2/"),
        ("Kotaku: hands-on previews", "https://kotaku.com/5-things-we-just-learned-about-the-legend-of-zelda-ocarina-of-time-remake-2000745965"),
        ("TheGamer: remake Gold Skulltulas", "https://www.thegamer.com/the-legend-of-zelda-ocarina-of-time-all-gold-skulltula-locations/"),
        ("Shacknews: time keeps moving in towns", "https://www.shacknews.com/article/150646/the-legend-of-zelda-ocarina-of-time-remake-day-night-mechanic"),
    ],
}

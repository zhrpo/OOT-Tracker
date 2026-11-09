# Tab settings, version notes and sources for the Main quest and Items tabs.
EARLY = "Early data: this version came out on Nov 5, 2026, and guides are still catching up. "

TABS_CFG = [
    {"k": "main", "short": "Main", "name": "Main quest", "hash": "mainquest", "kind": "quest", "verb": "done", "ph": "Search steps",
     "lab": ["When", "Where", "You get"],
     "info": "The story in the order most people play it. Tick a step and everything it depends on is ticked too, and the other tabs unlock to match. Later steps stay hidden until you reach them.",
     "foot": "Steps follow the usual route. Where the game lets you choose (Forest or Fire first, Shadow or Spirit first) the tracker only asks for what the game asks for. Locks assume normal play with no glitches or tricks, and a few are cautious, so a locked row may occasionally be doable early. Guides stay hidden until you tap one. The base list is the N64 game; rows with an amber edge differ on the version you picked."},
    {"k": "skull", "short": "Skulls", "name": "Skulltulas", "hash": "skulltulas", "kind": "loc", "verb": "collected", "ph": "Search",
     "info": "",
     "foot": "Some day and night tags differ between guides, so I used the majority view. If a spider is missing, try the other time of day. Night spiders appear after dark; play the Sun's Song to skip ahead. The base list is the N64 game; rows with an amber edge differ on the version you picked."},
    {"k": "heart", "short": "Hearts", "name": "Hearts", "hash": "hearts", "kind": "loc", "verb": "collected", "ph": "Search",
     "info": "",
     "foot": "Day and night only matter where a tag says so. Where guides disagree, the row says so. The base list is the N64 game; rows with an amber edge differ on the version you picked."},
    {"k": "side", "short": "Quests", "name": "Side quests", "hash": "sidequests", "kind": "quest", "verb": "done", "ph": "Search quests",
     "lab": ["Available", "Starts", "Reward"],
     "info": "Where each quest starts is in bold at the top of its row. Guides stay hidden until you tap one.",
     "foot": "Groups show the earliest a quest can start, and most can be done any time after that. Guides are hidden until you tap one, and search does not look inside them. Reloading the page hides them all again. Where sources disagreed I used the majority view. The base list is the N64 game; rows with an amber edge differ on the version you picked."},
    {"k": "items", "short": "Items", "name": "Items", "hash": "items", "kind": "quest", "verb": "collected", "ph": "Search items",
     "lab": ["When", "Where", "What it does"],
     "info": "Permanent items and upgrades: gear, tools, spells, bags and wallets, bottles, quest items and songs. Nothing you use up. Each one says where it comes from, and ticks itself when you finish that story step or quest.",
     "foot": "Ticking an item here unlocks the Skulltulas, Hearts and quests that need it, and ticks the story step or quest that gave it where that is clear. Trade and mask sequences are checklists inside their side quests. The base list is the N64 game; rows with an amber edge differ on the version you picked."},
]

NEW_SOURCES = [
    ("Thonky: mask trading", "https://www.thonky.com/ocarina-of-time/mask-trading-sequence"),
    ("StrategyWiki: Happy Mask Shop", "https://strategywiki.org/wiki/The_Legend_of_Zelda:_Ocarina_of_Time/The_Happy_Mask_Shop"),
    ("Jegged: Happy Mask Shop", "https://jegged.com/Games/Legend-of-Zelda-Ocarina-of-Time/Side-Quests/Happy-Mask-Shop.html"),
    ("Zelda Dungeon: Fairy Fountains", "https://www.zeldadungeon.net/Zelda05FairyFountains.php"),
    ("Zelda Dungeon: bottles", "https://www.zeldadungeon.net/Zelda05Bottle.php"),
    ("GameWith: item trading", "https://gamewith.net/zelda-ocarina-of-time/76393"),
    ("GameWith: item upgrades", "https://gamewith.net/zelda-ocarina-of-time/76404"),
    ("Zelda Dungeon: upgrades", "https://www.zeldadungeon.net/wiki/Deku_Nut_Upgrade_1"),
    ("Thonky: upgrades", "https://www.thonky.com/ocarina-of-time/upgrades"),
    ("Zelda Dungeon: Epona quest", "https://www.zeldadungeon.net/wiki/Ocarina_of_Time_Epona_Quest"),
]

VN_NEW = {
    "main": {
        "3ds": {
            "lead": "The same route as the N64 game.",
            "items": [
                "Sheikah Stones give hint videos for dungeons. They do not change the route.",
                "Master Quest unlocks after you beat the game and changes the dungeons. This tracker covers the normal quest only.",
                "Climbing is a little faster and items are swapped on the touch screen.",
            ],
        },
        "sw2": {
            "lead": EARLY + "The route is the same, and the changes found so far are small. They are noted on the step they touch. Guides have not covered every change yet.",
            "items": [
                "Castle Town: the drawbridge stays down at night.",
                "The Weird Egg hatches at once instead of at sunrise.",
                "Sneaking into the castle: being spotted no longer costs health.",
                "Lost Woods: green notes help you pick the right path.",
                "Great Fairies ask for a rupee offering. You can leave Jabu-Jabu through the mouth at any time.",
                "Dampé's race is reworked and the Fire Temple, Forest Temple and Goron Tunic have small changes. Each is noted on its step.",
                "The Haunted Wasteland is called the Mirage Desert here. Same place.",
                "Other changes may not be documented yet. If a step does not match what you see, trust the game.",
            ],
        },
    },
    "items": {
        "3ds": {
            "lead": "The same items as the N64 game.",
            "items": [
                "The House of Skulltula 20-token prize is the Shard of Agony (it flashes on screen, no Rumble Pak needed).",
                "Items are swapped on the touch screen. Nothing else changes in this list.",
            ],
        },
        "sw2": {
            "lead": EARLY + "Only the changes below are reported so far.",
            "items": [
                "A fifth bottle comes from the Potion Shop in Castle Town (shown as new).",
                "You keep the Fairy Ocarina after getting the Ocarina of Time.",
                "The Echo Gem replaces the Stone of Agony at 20 Skulltula tokens. Your starting wallet holds 200 rupees, and the upgrades are 500 and 1,000.",
                "Guides disagree on where the Hylian Shield is. The N64 grave is shown with a note.",
                "Bottle locations differ in at least one guide. Those are not confirmed, so the N64 ones are shown.",
            ],
        },
    },
}

# Songs, Items and Trades tabs. Same row shape as the side quests.
# key: short alias used in req/gives. req: what must be done first. '@x' = everything that must be done before story step x.
from side import SIDE


def _sq(i):
    for _n, _note, rows in SIDE:
        for r in rows:
            if r["id"] == i:
                return r


def r(key, name, kind, age, time, avail, start, reward, guide, req=(), gives=(), only=None):
    d = dict(key=key, name=name, kind=kind, age=age, time=time, avail=avail, start=start, reward=reward,
             guide=list(guide), req=list(req), gives=list(gives))
    if only:
        d["only"] = only
    return d


SONGS = [
    ("Songs you learn as a child", "Most songs are learned in a fixed order. Warp songs teleport you to their temple once you are an adult.", [
        r("s_lullaby", "Zelda's Lullaby", "Story song", "Child", "Any", "After you meet Zelda",
          "Hyrule Castle courtyard. Impa teaches it as you leave.",
          "Opens the Goron City door, the Zora's River waterfall, Great Fairy fountains and more",
          ["Sneak into the courtyard and meet Zelda.", "Impa teaches you the song as you leave the castle."],
          req=["@zelda"]),
        r("s_saria", "Saria's Song", "Story song", "Child", "Any", "After you meet Zelda",
          "Sacred Forest Meadow, through the Lost Woods.",
          "Wins over Darunia, calms Mido as an adult and pleases the Skull Kid for a Heart Piece",
          ["Follow the music through the Lost Woods until you reach the Meadow.", "Saria teaches you the song there."],
          req=["@saria"]),
        r("s_epona", "Epona's Song", "Optional song", "Child", "Any", "After Talon is back at Lon Lon Ranch",
          "Lon Lon Ranch, in the middle of Hyrule Field. Malon waits in the corral.",
          "Calls Epona. Needed later to win her as an adult",
          list(_sq("SQ-8")["guide"]),
          req=["talon"]),
        r("s_sun", "Sun's Song", "Optional song", "Either", "Any", "After Zelda's Lullaby",
          "Kakariko Graveyard, the Triforce symbol in front of the Royal Family's Tomb.",
          "Switches between day and night and freezes ReDeads",
          ["Stand on the Triforce symbol in front of the Royal Family's Tomb and play Zelda's Lullaby.",
           "Clear the Keese and avoid or outrun the ReDeads, which can freeze you.",
           "Read the song from the wall in the passage. Playing it freezes the ReDeads so you can leave."],
          req=["zelda"]),
        r("s_time", "Song of Time", "Story song", "Child", "Any", "After the three spiritual stones",
          "Hyrule Castle Town. You learn it after you dive for the Ocarina of Time.",
          "Opens the Door of Time and moves blue blocks",
          ["Dive into the moat to the right of the drawbridge for the Ocarina of Time.", "Watch the scene that follows to learn the song."],
          req=["@time"]),
        r("s_scare", "Scarecrow's Song", "Optional song", "Either", "Any", "Any time after you have the Fairy Ocarina",
          "Lake Hylia, the scarecrow Bonooru.",
          "Lets you call Pierre to Hookshot up to high ledges",
          list(_sq("SQ-12")["guide"]),
          req=["ocarina"]),
    ]),
    ("Songs you learn as an adult", "Sheik teaches most of these. The first five warp songs each go with a temple.", [
        r("s_storms", "Song of Storms", "Story song", "Adult", "Any", "After the Master Sword",
          "Kakariko Village windmill. An angry man stands on the floor.",
          "Drains the well, makes it rain and reveals hidden holes",
          ["Go into the windmill and play your Ocarina for the angry man. He teaches you the song."],
          req=["@storms"]),
        r("s_minuet", "Minuet of Forest", "Warp song", "Adult", "Any", "After the Master Sword and Saria's Song",
          "Sacred Forest Meadow. Sheik teaches it.",
          "Warps you to the Sacred Forest Meadow",
          ["Go through the Lost Woods to the Meadow as an adult.", "Fight the Moblin at the stairs. Sheik appears and teaches the song."],
          req=["@minuet"]),
        r("s_bolero", "Bolero of Fire", "Warp song", "Adult", "Any", "After the Goron Tunic and the Hookshot",
          "Death Mountain Crater. Sheik teaches it beyond the broken bridge.",
          "Warps you to Death Mountain Crater",
          ["Pull the statue in Darunia's room, then Hookshot across the broken bridge in the Crater.", "Sheik teaches you the song."],
          req=["@bolero"]),
        r("s_serenade", "Serenade of Water", "Warp song", "Adult", "Any", "After the Ice Cavern",
          "The end of the Ice Cavern. Sheik teaches it after the Iron Boots chest.",
          "Warps you to Lake Hylia",
          ["Cross the Ice Cavern.", "Sheik teaches the song after you take the Iron Boots."],
          req=["@ice"]),
        r("s_nocturne", "Nocturne of Shadow", "Warp song", "Adult", "Any", "After the Water Temple",
          "Kakariko Village. Sheik teaches it after a story scene.",
          "Warps you to the Graveyard and the Shadow Temple entrance",
          ["Go to Kakariko Village after the Water Temple.", "A cutscene plays, then Sheik teaches the song."],
          req=["@nocturne"]),
        r("s_requiem", "Requiem of Spirit", "Warp song", "Adult", "Any", "After the carpenters, Hover Boots and Longshot",
          "The Desert Colossus. Sheik teaches it.",
          "Warps you to the Desert Colossus",
          ["Cross the desert to the Colossus.", "Go inside and back out. Sheik teaches the song."],
          req=["@colossus"]),
        r("s_prelude", "Prelude of Light", "Warp song", "Adult", "Any", "After your first adult temple",
          "The Temple of Time. Sheik waits by the pedestal.",
          "Warps you to the Temple of Time",
          ["Return to the Temple of Time after a temple.", "Sheik teaches the song."],
          req=["@prelude"]),
    ]),
]


"""Area order for the Skulltulas and Hearts tabs: overworld regions in story order, each followed by its own dungeon(s).
Combined areas are split so each place is its own section."""

SPLIT = {
    "Lost Woods and Sacred Forest Meadow": [("Lost Woods", "LW-"), ("Sacred Forest Meadow", "SFM-")],
    "Hyrule Castle Town, castle grounds and Ganon's Castle": [("Hyrule Castle Town", "MKT-"), ("Hyrule Castle", "HC-"), ("Ganon's Castle", "GAN-")],
    "Gerudo Fortress, Haunted Wasteland and Desert Colossus": [("Gerudo Fortress", "GF-"), ("Haunted Wasteland", "HW-"), ("Desert Colossus", "CL-")],
}
# which new section keeps the note of the combined one
NOTE_TO = {
    "Lost Woods and Sacred Forest Meadow": "Lost Woods",
    "Hyrule Castle Town, castle grounds and Ganon's Castle": "Hyrule Castle Town",
    "Gerudo Fortress, Haunted Wasteland and Desert Colossus": "Desert Colossus",
}
RENAME = {"Inside Jabu-Jabu's Belly": "Jabu-Jabu's Belly", "Hyrule Castle Town Market": "Hyrule Castle Town"}

ORDER = [
    "Kokiri Forest", "Lost Woods", "Sacred Forest Meadow", "Great Deku Tree", "Forest Temple",
    "Hyrule Field", "Lon Lon Ranch",
    "Hyrule Castle Town", "Hyrule Castle",
    "Kakariko Village", "Kakariko Graveyard", "Bottom of the Well", "Shadow Temple",
    "Death Mountain Trail", "Goron City", "Dodongo's Cavern", "Death Mountain Crater", "Fire Temple",
    "Zora's River", "Zora's Domain", "Jabu-Jabu's Belly", "Zora's Fountain", "Ice Cavern",
    "Lake Hylia", "Water Temple",
    "Gerudo Valley", "Gerudo Fortress", "Haunted Wasteland", "Desert Colossus", "Spirit Temple",
    "Ganon's Castle",
]


def regroup(groups):
    out = []
    for name, note, rows in groups:
        if name in SPLIT:
            parts = SPLIT[name]
            used = set()
            for pname, prefix in parts:
                prow = [r for r in rows if r[0].startswith(prefix)]
                used.update(r[0] for r in prow)
                if prow:
                    out.append((pname, note if NOTE_TO[name] == pname else "", prow))
            assert used == {r[0] for r in rows}, (name, {r[0] for r in rows} - used)
        else:
            out.append((RENAME.get(name, name), note, rows))
    pos = {n: i for i, n in enumerate(ORDER)}
    unknown = [g[0] for g in out if g[0] not in pos]
    assert not unknown, unknown
    return sorted(out, key=lambda g: pos[g[0]])

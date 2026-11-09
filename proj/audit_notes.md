# AUDIT NOTES (round 4) — Switch 2 correctness pass. Keep updated; survives context compaction.
User request 22:11-22:13: scrape EVERYTHING (esp. sw2) for mistakes/errors/missing logic. Examples given are only symptoms:
 - some rows don't show that BOTH Links (child+adult) are required
 - boomerang/hookshot shown wrongly (hookshot shown where boomerang works / neither shown)
 - Great Fairy rewards wrong (sw2: Din's Fire = DMT fairy w/ Magic Meter; HC fairy = upgraded Spin Attack)
 - worried about correctness after Deku Tree DT-4 incident; check own logic AND cross-check online sources for missing items/quests
 - remove status bar time/cell/battery (DONE: theme2.js status() + theme2.css .sysbar:empty)
## Key sw2 sources: RPG Site minimalist 100% (outline fetched), Zelda Wiki sw2 page (fetch failed; search snippet: Din's Fire swap), games.gg/howtovideogame/Game8 great fairy pages, VGC per-area GS guides.
## FINDINGS
F1 Great Fairies sw2: DMT = Magic Meter + Din's Fire (25 rupees); HC = Spin Attack (50, needs bombs+child, vines past gate); Zora Fountain Farore's Wind; DMC Double Magic (200); Colossus Nayru's Love; Ganon's = Double Defense (500). All fairies charge rupees. Need: sw2 overrides SQ-19/SQ-20/IT-21/IT-22/MQ-14 gives, new item Spin Attack upgrade (all versions).
F2 stale N64 gates on sw2: HF-1 (bombs + boom/hook on a Child row; sw2 text = roll into tree), HF-3 text says boomerang/hookshot but req only bombs, LLR-2 text boomerang but req none, ZR-1/ZR-2 req bombs but text no bombs?
F3 HP-24 frogs: needs Lullaby, Epona, Saria, Sun's, Time (+Storms separate) — req only Storms+Epona+Sun's
F4 wallets: RPG Site says Adult 200 (10 tok), Giant 1000 (sw2); my data says 200/500. Echo Gem threshold: RPG says 22?? mine 20 — verify.
F5 HP-6/HP-7 duplicate MasterSword clause (cosmetic)
## Cross-check results so far (sources: G8=Game8 616213 per-token list, TG=TheGamer list, VGC area pages, RPG=RPG Site, Respec=HP list/walkthrough)
- Counts per area match mine (100 total).
- WALLETS sw2: starting 200; Adult 500 (10 tok); Giant 1000 (30 tok) [Respec,howtovideogame; RPG says adult 200 = probably copy error]; Echo Gem 20 tokens (VGC, G8 say 20; RPG/Respec say 22 = they had 22)
- GREAT FAIRY costs sw2 (G8): 15?/25 DMT Din's+Magic, 50 HC spin, 100 Zora Farore, 200 DMC double magic, 300 Colossus Nayru, 500 Ganon double defense.
- Fish sizes sw2: child 55cm (HP-26/SQ-10), adult 65cm (SQ-32 Golden Scale)  [N64 text uses pounds]
- HP-11 (Granny roof): sw2 = child route w/ Cucco from windmill ladder (RPG, Respec #2); Hookshot is the alternative -> age Either, no Hookshot needed
- G8: sw2 Heart Pieces can't be grabbed with Boomerang/Hookshot ("move near, press A") -> HP-10 (windmill, child boomerang) and HP-22 (child boomerang) text invalid on sw2
- DT-4 sw2: VGC "no special items needed"; G8/TG: burn web (Deku Stick) + Slingshot, climb vines -> NOT bombs+boomerang
- HF: VGC: tree (child, no bombs), south forest grotto (child ok, bombs), marsh grotto (Both: child kills normal spider, adult gets gold; bombs). TG says A for grottos; G8 says Either.
- HF-1 stale N64 gate (bombs+boom/hook).  LLR-2 needs Boomerang (G8,TG,VGC). LLR-3 Boomerang. HC-2 TG: Boomerang too.
- ZR-1 (bug soil by bean seller) no bombs per sources (G8: soil BEFORE the boulders at the gate). Check whether SQ-23 beans need bombs.
- GY-2 location text wrong: behind Dampe's hut (child Boomerang; VGC says Boomerang or Hookshot)
- DMT-1 soil outside DC: needs boulder blown (Goron's Bracelet bomb flower) -> gate MQ-9 not MQ-8
- SP-1/2/3 need Boomerang (child) — add explicit tool chip. SP-2 sw2: right of giant statue (Bombchu opens sun wall).
- CL-2 sw2: wall near temple entrance w/ birds, night (VGC, RPG, TG #15 "wall north of Spirit Temple entrance A night no tool") vs mine "palm tree, Longshot" -> verify
- HP-24 frogs need songs: Lullaby, Epona, Saria, Sun's, Time (+Storms separate)
- NEW POLICY: every row lists the tools truly needed (Boomerang for child token fetch, Hookshot/Longshot for adult), even if implied by story step, so chips show them.
## Round-4 batch 3 results (Game8 618335 great fairy page)
- DMT fairy: bomb wall next to Kaepora Gaebora (child, bombs) -> Din's Fire + Magic Meter, 25 rupees.
- HC fairy: from Market climb vines beside main path, jump past gate, head right to rocky alcove, bomb boulder, crawl in (child, bombs) -> Spin Attack (upgraded), 50.
- Zora Fountain: bomb boulder (child/adult, bombs) -> Farore's Wind, 100.
- DMC: Megaton Hammer on rocks (adult) -> Magic Meter Upgrade (double magic), 200.
- Colossus: cracked wall w/ 3 palms, bomb + Lens of Truth (child/adult) -> Nayru's Love, 300.
- Ganon's Castle: Golden Gauntlets pillar -> Defense Upgrade, 500.
- First fountain must be DMT or HC (story) else Lullaby won't summon fairy elsewhere.
- Windmill HP: N64 = child Boomerang or adult via Dampe; sw2 G8 says boomerang can't grab HP -> adult/ Dampe or climb? (still verify)
- CL (Colossus) N64: palm tree Longshot (adult night), rock bean/hook/longshot adult, soil child bug. sw2: CL-2 conflicting.

## Round 5 (Fri 2026-11-06 23:18-23:20)
- Bag items renamed: Deku Seed Bag (N64 "Bullet Bag"), Deku Stick Bag, Deku Nut Bag as "Big / Biggest ... (holds N)"; quivers "(holds 40/50)".
- Scarecrow's Song (SQ-12, IT-69) now Both Links (child teaches Bonooru, adult replays).
- Era outline: era.py derives "Both" for child rows needing adult-only progress (BW-1..3, HC-2, SP-1..3, HP-23, IT-18, IT-30, SQ-26) with an Adult-first / Child-second hint; Needs chips carry an ADULT tag; Either/other rows get a "Needs adult-era progress first" note.
- SQ-26 (frogs) gate: six songs (bombs dropped).
- Tab bar now uses container queries (icon tiles <700px, short names 700-879px, full names 880px+); area-nav names wrap instead of "..."; test_overflow.py sweeps 25 widths x 3 consoles x 5 tabs.

## Round 6 (area order, collapsed cards, landing, locks, 3DS)
- regroup.py: skull/heart groups follow the user's region order (dungeon after its region); combined areas split (Lost Woods / Sacred Forest Meadow, Hyrule Castle Town / Hyrule Castle / Ganon's Castle, Gerudo Fortress / Haunted Wasteland / Desert Colossus). Quests/items unchanged.
- Cards: art is the header (title, count, chevron and progress line drawn on it). Shut = the whole card is the art (clipped by the card, so shapes always match). Open = same art with the title strip frozen under the page header (sticky h2, negative top offset = bh - bar). Every tab starts shut; Main keeps the current chapter open. Long names wrap (no ellipsis), card grows.
- Landing: first visit = Main quest on N64; last tab + game restored from localStorage and from the DB doc (`tab` field added).
- Locks: locked unticked rows have a disabled checkbox (padlock); the change handler also refuses a forced tick. Ticked rows never lock, so they can always be unticked. Locks off enables everything.
- 3DS rebuilt: flat pearl / charcoal surfaces, outline tiles, glowing cyan cursor for the picked tab/game, no gloss.
- Zelda font not embeddable: no network from the build box, and the font licences are not stated; serif lettering stack instead.
- Tests: test_r6 (new), test_cards (pixel contrast of title/count on art; n64 'Bags' card reads 1.39 in that harness only, the screenshot is fine), pwpatch.py (tests start with areas open via window.__ootOpen and default game via window.__ootDefVer; locked check() flips Locks off for one click). check_user with live DB keys (v137): nothing missing, nothing normalized.

## Round 7 (hearts in places, age-aware art, items scenes, N64 notches, 3DS shell)
- Quest-prize hearts (12) stay in their own location group, tagged "Quest prize", chip links to the quest, ticks both ways. No "Earned through side quests" group. Lost Woods is back in Hearts (both its hearts are quest prizes). Kokiri Forest, Sacred Forest Meadow, Great Deku Tree, Forest Temple have no Pieces of Heart (bosses give Heart Containers, not tracked).
- Tab icons are original generic objects, child until the Master Sword row is ticked (`has(D.adult)`), adult after: clay ocarina / glazed ocarina, golden spider (same), heart quarter / whole heart in a gold ring, carved mask / white hen, slingshot / bow. Three fidelity levels via kit(lvl).
- Items-tab banners: armory, wardrobe, bench, magic, trial, stall (dusk), shelf, relics, songs (child dawn, adult night). KEYS anchored at ^ so they cannot clash with place names.
- N64 .grp: clip-path chamfer (--c:12px) plus ::after diagonal bands to keep the outline; box-shadow dropped (clip would cut it).
- 3DS rebuilt as a console shell (see theme2.css). Selected tile ring overflowed .tabs on the last tab: .tabs now padded 7px and margin -5px. <=320px: bezel shrinks so "Nintendo 64" keeps margins.
- Hide-later bar: `.later.showing [data-hideall]` where the hidden steps would begin, plus the chip near the top.
- Tests: test_r7.py new; test_gate updated; test_r6 checks no field fallback on items/quests/hearts. n64 'Bags…' reads 1.39 only in test_cards harness (visually fine).

## Round 8 (hover motion, fonts, art fidelity, unticking, earlier-steps prompt)
- Unticking mirrors ticking: tickOff follows REWARDS_OF/gives for quests and steps, 'up' links, derived items, and the giver step of an item; symmetry audit (/tmp/sym.py) clean.
- Earlier-steps prompt (#ask): ticking a main step or a quest/trade sub-step with unticked earlier steps asks first; Yes ticks all, No/Esc/backdrop leaves the box empty. Bypass for tests: window.__ootNoAsk (pwpatch sets it unless ASK=1). test_r8.py runs with ASK=1.
- Banner art animates per console (N64 stepped 3-5 frames, 3DS 12-24, SW2 smooth), only for cards on screen (IntersectionObserver), off for reduced motion.
- Tab icons: 3DS = flat 3-band cel + outline, SW2 = smooth gradient + gloss + glow pulse + float, N64 = faceted polygons. Hen is the reference blue (#4b80e8 / #33539e / #21356f). Hearts: child = heart in four quarters with one bright piece, adult = plump glossy heart.
- Fonts: N64 embedded Lora subset ("OoT Serif", ~39KB woff), 3DS rounded system stack + hairline halo, SW2 system sans. Console fonts are proprietary so these are stand-ins.
- Hover: N64 stepped hop + accent plate, 3DS lift + shine sweep, SW2 springy scale + glow. Press states for all. Hover only on hover-capable devices; reduced motion switches it off.
- test_cards: n64 'Bags...' (1.39) and 3ds 'Kakariko Village' (2.49) readings are harness artefacts (a sub-pixel strip of page background in the element screenshot), not text over art.

## Round 9
- "Magic Meter and Din's Fire" removed from the main quest. MQ-14 is retired (RETIRED_MQ in build.py, RETIRED in app.js): every other step keeps its number, and a saved MQ-14 is dropped on load (what it handed over stays ticked). Main quest is 40 steps.
- New step field `needs` (item ids): Shadow Temple needs Magic Meter + Din's Fire. Shown as a "Needs" chip row; ticking the step ticks them and the fairy quest that gives each; unticking either undoes the step (NEEDED_BY), like the old giver step did.
- Console tabs (.vtab) use their own console's hover on every page; SW2 tab art wiggles ("joy") on hover; 3DS tab art floats on stacked shadows and tilts with red/cyan double images ("ds3d") on hover.
- Banner life: SW2 = swaying pines (+ fluttering top tiers on near trees), two rows of grass in clumps with flowers, leaves, butterflies (day), fireflies (night), chimney smoke, flags, embers, water glints, sun rays, rain (Ganon), snow (ice), dust (desert), cave drips. 3DS gets stepped sway, tufts, 3 leaves, two birds, flags, smoke, embers, glints, light rain/snow. N64 unchanged.
- Perf: grass sways in clumps of 4 and only top tiers flutter; headless SW2 page went from 12-21 fps back to ~40 (same as before the new life).
- test_r9.py added; test_gate ready-filter check now ticks MQ-10 first (fairy quests no longer pull in a story step).

## Final pass (Round 11)
- Data: no broken references, no impossible locks, every row reachable on every console; frog heart rows told apart; Dampé spelled consistently.
- Unticking: an item that goes now also takes the quest it fully pays (diving game -> Silver Scale) and the story step that hands it over, unless later steps lean on it. Inferred earlier story steps stay (Undo covers a mistaken tick).
- Keyboard: arrow keys / Home / End move along each row of tabs; tablist labelled.
- Layout: no overflow from 280px to 2560px, live resize, landscape phones (header scrolls away under 520px tall), touch targets on small links, smallest labels 10.5-11px, 3DS blue and red badges darkened for contrast, "1 Skull" singular.
- Hash is #tab-game (e.g. #skulltulas-sw2) via replaceState; old #tab/game links still work.
- Performance: each place picture is a single <img> (blob URL) with its own motion CSS copied in for that console, so the page holds ~1.7k elements instead of ~19k. No SVG filters except the N64 pixel filter; light blur is CSS on the image. Tab switch 4-30ms, tick 10-20ms (cards shut), no long tasks while scrolling. Reduced motion strips motion from the images (note: animation:none !important inside an SVG image did not stop animations in Chrome; declarations are removed instead).
- test_final.py added; test_r6/test_r8 updated for image pictures.

## Round 12
- Story spoiler cover: main-quest steps that are not ready yet (an earlier step still open) render with class `veil`: name and place blurred, details hidden, a "Later step: tap to show" button (data-unveil). Shown steps are remembered in localStorage `oot-reveal`; search results and chip jumps (goRow) are never covered; finishing a step uncovers the next. The box stays usable. Test hook window.__ootNoVeil (pwpatch sets it unless VEIL=1). Note: `.spoil` is the guide box class, hence `veil`.
- Touch: a tap plays each console's motion once (class `tapfx`, pointerType != mouse); the console tabs replay it after a switch redraws them. A passive touchstart listener enables :active on iOS.
- Picked list tab keeps an idle motion (N64 stepped bob, 3DS slow 3D tilt, Switch 2 gentle wiggle) on all devices; mouse hover still plays the full hover motion.
- test_r12.py added.

## Round 13 (checked against the user's real Switch 2 progress)
- Only 4 rows were unlocked-but-unchecked: HF-2, SQ-13 (next is the Mask of Truth payment), IT-20 Ocarina of Time and IT-68 Song of Time (next story step). The last three are genuinely next.
- HF-2 (Switch 2): needs both ages: kill the ordinary Skulltula in the marsh grotto as child, return as adult and roll into the crate (VGC, Nintendo Life, Nintendo Insider, Vertical Slice). Now BOTH_V + Adult lock.
- One-way ("up") quest prizes: ticking the quest ticks the prize only when the prize's own requirement is met (SQ-17 House of Skulltula no longer ticks the 50-token heart at 43 tokens); unticking a one-way prize no longer unticks its quest. The user's save still has HP-12 ticked from before; they need to untick it (we never write their doc).

## Round 14 (two-Link checklists)
- 26 rows that need both Links get a two-step checklist (ids ROW.1 / ROW.2), built in build.py from the "ages" text; version-only ones (HF-2, HP-6, HP-7, HP-17 on Switch 2) sit in v overrides.
- Step 1 "learn Song of Storms / Bolero / Requiem" mirrors the song row both ways (MIRBY). Child halves drop adult-only alternatives.
- One-to-one full links share steps (SQ-12 <-> IT-69). Rows locked on the other age still count as Ready when their next step is doable (halfReady).
- Upgrade items now tick their quests (DERIV_OF in tickOn). HP-24 needs the Song of Storms.
- QA (Round 14b): song-mirror first steps lock like their song; second steps drop the clause the mirror stands for; no era note on steps;
  closed cards show "<age> part done" / "<age> part ready"; Scarecrow step text says the song is learned on the adult visit.
  Reachability sim: every row and step reachable in all three versions. Strict check on live save: only HP-12 (43/50 tokens). test_r14.py added.

## Round 15 (cross-check + confidence report)
- Cross-checked all Switch 2 rows vs RPG Site GS list, Respec/RPG Site/Nintendo Life heart lists, Respec walkthrough, GameWith, VGC.
- Fixed: HP-21 route (vines + second Cucco, both sources), HP-33 chest (Respec, NL), IT-6 Hylian Shield in ReDead grave (Respec).
- Report doc: https://claude.ai/artifact/8CyEESYgdXKEVMW53HbEEb  (280 high / 17 medium / 0 low of 297).
- Round 15b (check again): IT-6 corrected to back-row grave w/ ReDead, no Sun's Song (GameRant, ScreenRant, Shacknews, GamerHour);
  SQ-33 bottle at 500 pts on sw2 + b_poe link 'up' on sw2 and IT-51 sw2 req = SQ-28+bow+other bottle; SQ-44 bug on shop floor;
  LLR-1 sw2 any time; fishing cm/lb. Report: 286 high / 11 medium.
- Round 16: rounded-card art clip via clip-path inset round (iOS Safari ignores overflow+radius on sticky header). Child rows/steps need MQ-22 (Prelude, Sheik in ToT after Forest Temple) once MQ-17 is done and MQ-22 isn't (BACK in reqOf; inferSteps ignores it).
- Round 17 (playthrough test, test_play.py): greedy play of all 3 versions; fixed HF-1/HP-11 sw2 (need leaving the forest), HP-9 (owl needs bombs/summit or Hookshot),
  SQ-39 needs SQ-36, IT-4 needs Claim Check, checklist quests (mask/Biggoron) ready only when their next step is doable. N64 GS list matched Zelda Dungeon 100/100.
- Round 18: test_paths.py (120 random playthroughs x 3 versions, ~51k states) + test_two.py (every two-Link row at child / stuck adult / free stages).
  Fixed: unticking a finished row via its prize now also unticks its last step (SQ-26 frogs case); setRaw invalidates the eff cache.
- Round 19: user confirmed in play: Switch 2 Big Poes need no Fairy Bow (bottle + Gold Rupee before Forest Temple). SQ-33 and IT-51 sw2 now need Epona + a bottle only.
- Round 20: chain subs (TR mask/Biggoron) show only the item (short); Where/You get go into the spoiler guide; steps after the next open one veiled (subSpoiled, data-unveil, REVEAL). Neutral avail/notes on SQ-13/SQ-29. KF-3 sw2 confirmed in play: back side of the House of the Twins roof.
- Round 21: optional dungeon checklists (dungeons.py, DG-n ids, append-only) on MQ-3/10/15/21/25/26/28/30/31/35/39 (trials free order). Toggle #dsteps on Main quest tab (state.dsteps, default off, saved). Forest Temple sw2 entrance: Hookshot target above the door. Publish now verified by sha256 vs list_files.

## Round 22 (in-depth dungeon walkthroughs)
- dungeons.py rewritten: 180 steps over 14 dungeon rows (Deku, DC, Jabu, Forest, Fire, Ice, Water, Well, Shadow, Spirit child + adult, six trials (free order), Ganon's tower, Ganon). DG-1..41 retired (RETIRED in app.js); new ids DG-42..221.
- Sources: jegged chapters (classic); respec.net Switch 2 100% guide, FinalBoss Switch 2 Forest/Fire/Water, retrododo Deku Tree remake changes, GameRiv/G2A (Gohma, Water lattice walls); tower order checked against Zelda Dungeon wiki + zeldaspalace (Boss Key in Stalfos room).
- Version-only steps (only=[...]): Deku Slingshot room + ladder/eye switch, Forest entrance + well drain. after = last step of each version; stepReady ignores steps not in the shown version; subsV() filters checklists per version in tick/untick/normalize; resolveRow filters subs.
- Global "Dungeon steps" pill removed; each dungeon's dropdown has its own Walkthrough toggle (state.dg, saved; old dsteps=true opens all).
- Revealed sub guides now keep Where/You get (subHid) — was dropped on reveal for chain steps too.
- test_dg.py new. All suites pass. Published 1794192220-7516.
- Round 22b: FT-3 on Switch 2 needs Scarecrow's Song + Hookshot (VGC + user); new where/how. FT-4 sw2 note (VGC balcony). Published 1794192834-c485.

## Round 23 (Switch 2 accuracy audit)
- Sources: VGC per-area Switch 2 Gold Skulltula pages (all 20), RPG Site Switch 2 minimalist 100% walkthrough (every GS/HP/item), RPG Site HP list, games.gg, Respec, GameWith/FinalBoss (minigames). GameWith map pages and FinalBoss heart list repeat N64 data -> not used for sw2 locations.
- Skulltulas fixed (sw2): WT-1 (blue east room bomb wall), WT-3 (central pillar basement), ST-3 (fan corridor), ST-4 (Hookshot ok), ST-5 (bombs in 3 skull pots), DMT-3 (boulder by Goron City), FT-2/FT-4 wording, IC-2/IC-3, JB-1..3, BW-1 (west room coffin), BW-2 note, GC-2 note, GF-1, GV-1, KF-2, KAK-1/5/6, HC-1/2, DT-1/4. Group notes for DT/FT/ST/WT/BW. Tab lead rewritten.
- Hearts: HP-8 crumbling building, HP-25 Din's Fire note, HP-13 RPG note. Side: SQ-37 quiver score split note.
- All versions: Poe bottle location (Ghost Shop), Mirror Shield location, DC location text, Water Temple entrance text, Bottom of the Well drain (windmill, not the well).
- Jabu walkthrough: map in the water room on sw2. Published 1794193875-016d.
- Round 24: BW-1..3 need the Lens (+Boomerang on N64/3DS, BW-3 on sw2), Small Key text. Magic bean tracker in the Main tab panel (6 prize soil spots, planted = child step or prize ticked). Published 1794195344-5c18.
- Round 25: SQ-17 reward tiers as an open (unveiled) checklist TR-18..27 (version variants for 20/40/100), full links wallets/agony/HP-12 to tiers, normalize catches up tiers from ticked prizes and drops old SQ-17 ticks under 100 tokens. Side quests grouped by area (SIDE_AREA in build.py). Published 1794197188-72ac.
- Round 26: t_prescription no longer needs beans/Hover Boots (walk up DMT; jegged/VGC/thonky). Requiem avail text fixed. Published 1794202545-9d80.
- Round 27: adult story deps loosened to real requirements: nocturne after forest+fire+water; card after ms (+Epona/Longshot on IT-53); requiem after card+water+well; zoratunic & ice after ms+king; water after ice+zoratunic+hookshot; light arrows after shadow+spirit. GTG/Ice Arrows need bow, hammer, longshot, iron boots, lens, SoT (not Silver Gauntlets). IC GS need hookshot. Nayru/HW-1 hover OR longshot. Published 1794244791-c1e2.

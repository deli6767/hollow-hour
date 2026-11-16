# HOLLOW HOUR: full-game roadmap (Oct 19 – Nov 18, 2026)

Goal: a 4–6 hour original game that still ships as one offline `index.html`. Existing lore stays canon and ambiguous: V. is never named outright, Mopsley is never explained, and 12:01 is a promise, not an answer.

## Architecture plan (read first)
- Source stays modular in `src/` (split further: `src/regions/<chapter>/rooms.js`, `monsters.js`, `bosses.js`, `music.js`, `script.js`). `build.py` concatenates them and inlines everything into a single `index.html`. The build gets a `--min` pass (terser-style whitespace/identifier minify via a vendored pure-Python step), plus a size report.
- Budget: ~1.2 MB unminified / ~600 KB minified is fine for one file. All art stays procedural and all audio stays WebAudio synth, so there are no binary assets. If the map data gets large, compress room maps as RLE strings decoded at load.
- Lazy init: each chapter registers its rooms, enemies and tracks into the global registries (ROOMS, ENEMIES, TRACKS, A) at load. Room caches are built on entry and dropped on exit to keep memory flat on mobile.
- Save format gets a `ver` field and `migrate(save)` steps (v1.3 → v2). The 3 files stay. Per-file flags and global meta (endings, records) are kept separate.
- Tests: route bots (`pwtools/routes.js`) are extended per chapter and run every session. Each chapter also gets dodge-bot fairness checks per attack, a reachability BFS per room, node --check, and zero console errors. Done means green.

## Chapter plan (story)
1. **Ch.1 Rustwood & Bellfall** (expanded): the fall, Tolly, Wicklow. *Arc: memory.*
2. **Ch.2 Gearholm & the Cogworks** (expanded town hub + factory depths): Grit, the Clockmaker's door. *Arc: control.*
3. **Ch.3 The Tidelock** (NEW): a flooded canal district where water runs on a 12-hour tide that never turns. New boss **The Lockkeeper** (a sluice-gate automaton who keeps the tide from turning); finale: the box floods and drains on a timer. *Arc: waiting.*
4. **Ch.4 Hourspire & the Gallery** (expanded): Cuckoo, plus the new **Undercroft** (NEW) beneath the spire: an archive of stopped clocks, with the mid-boss **Archivist Quill** (files your past actions; their bullets are your earlier choices). *Arc: performance/record.*
5. **Finale: The Belfry & Platform 13** (NEW epilogue area): MERIDIAN, plus a secret post-game area reachable only on the 12:01 path. *Arc: rules of time.*

Recurring cast with arcs across chapters: **Tolly** (guide → doubts his own memory), **Sprocket** (apprentice → builds something "not authorized"), **Bun** (innkeeper → Room 3 keeper), **Sgt. Rivet** (guard → deserts his post at midnight), **Mopsley** (everywhere, never explained), new **Ferry** (Tidelock boatman who rows in circles), new **Pell** (a young cuckoo, Madame Cuckoo's understudy).

---

## Milestone 1 (Oct 19 – Oct 25): Foundation + Chapter 1–2 expansion
Summary: Refactor the codebase into chapter modules without changing behaviour, add the save-version migration, and deepen the first two chapters into proper chapters with side content. By the end, Ch.1–2 should play for about 75 minutes, with 2 side quests each, expanded towns, and all v1.3 tests passing on the new structure.
- D1: split `src/` into chapter folders. Build gets the minify and size report. Save `ver` plus migration. Route bots stay green.
- D2: Rustwood expansion: 3 new rooms (Hollow Oak, Bell-Root Cave, Old Rail Cut). 2 new monsters (6 total in the region).
- D3: side quests Ch.1: "Tolly's Lost Hour" (fetch + memory twist), "Wicklow's Candles" (relight 5 candles; differs if Wicklow is killed).
- D4: Gearholm hub: shop tiers, inn upgrade, bulletin board for side quests, NPC schedules (day/"night" are the same minute, but NPCs swap lines).
- D5: Cogworks depths: 3 rooms, a conveyor puzzle, 2 new monsters. Side quest "Sprocket's Unauthorized Project" (begins a 4-chapter arc).
- D6: Grit second form. The finale "The Rules" adds RULE 4, which you must break to pass. New boss music variants.
- D7: playtest pass, balance, mobile check, bot routes for Ch.1–2.

## Milestone 2 (Oct 26 – Nov 1): Chapter 3, The Tidelock (new region)
Summary: Build the first fully new region: a flooded canal district with tide mechanics in the overworld (water level changes which paths exist) and in battle (the box floods and drains). It introduces Ferry and the Lockkeeper, 5 new monsters, 2 side quests, and a new region theme plus a boss theme. This is the milestone that proves the pipeline can produce a whole chapter.
- D1: tile set and procedural art (water, sluices, moored boats). Tide system: global high/low states flip with a lever puzzle.
- D2: 6 rooms + map + reachability. Ferry NPC (rows in circles; secret: count his laps).
- D3: 5 monsters (e.g. Barnaclock, Driftwick, Sluicesnail, Gullbell, Puddlepeep), each with ACT/spare and unique patterns.
- D4: mid-boss **Bilgewater Twins** (two bodies; spare needs both calm; kill one and the other changes).
- D5: boss **The Lockkeeper**: 4 phases; finale "High Water" (box fills from the bottom, telegraphed tide lines, slower movement underwater).
- D6: side quests "Message in a Bottle" (from V.? unsigned) and "Ferry's Fare". Music: region theme + boss theme + emotional variants.
- D7: integration (Gearholm ↔ Tidelock path), route bots extended, fairness bots, playtest.

## Milestone 3 (Nov 2 – Nov 8): Chapter 4 + Undercroft + secrets network 2.0
Summary: Expand Hourspire and the Gallery, add the Undercroft archive and Archivist Quill (whose attacks replay the player's own recorded choices), and grow the secret network: Mopsley's route through every chapter, new V. fragments that contradict each other, and Platform 13 setup. Add two new endings so the choice structure has 7 outcomes, without explaining the core mystery.
- D1: Hourspire expansion (2 rooms, lever-train puzzle) + Pell (understudy) arc start.
- D2: Undercroft (5 rooms): archive shelves that log what *you* did (kills/spares shown as filed clocks).
- D3: Archivist Quill boss: "Your Record" finale. Bullets are drawn from your save's own stats (more kills means denser), with fair caps.
- D4: Cuckoo rework: the Pell duet variant if Pell's quest is done. New spare path.
- D5: secrets 2.0: Mopsley appears in Tidelock/Undercroft; V.'s 3 new fragments (a recipe, a ticket stub with a different date, a lullaby score); a ledger "No. 14".
- D6: new endings: **"THE UNDERSTUDY"** (Pell takes the stage; mixed route + Pell quest) and **"LOW TIDE"** (Lockkeeper spared + tide turned). Ending matrix documented in SECRETS.md.
- D7: Platform 13 epilogue area (12:01 path only), playtest, bots.

## Milestone 4 (Nov 9 – Nov 18): Finale polish, options, music, QA, ship
Summary: Polish MERIDIAN as the culmination of every chapter: phase intros that reference your choices, plus attacks themed on things you did. Finish the music (a distinct theme per region and per boss, plus warm/broken variants). Add difficulty and accessibility options, and do a mobile pass. Then run a full QA and balance sweep with all route bots and fairness bots green. Ship v2.0 as one offline file.
- D1: MERIDIAN finale integration: chapter callbacks (Tide Rewind, Archive Echo), a phase-5 epilogue fight variant per route.
- D2: music pass: unique themes for 5 regions, 7 bosses, 3 mid-bosses; leitmotif quotes (V.'s music box hidden in 3 themes).
- D3: options: difficulty (Story / Normal / Clockwork), damage taken, game speed 70–100%, hitbox display, high-contrast bullets, reduced flashing and shake, colour-blind palettes, remappable keys, text speed, hold-to-confirm.
- D4: mobile: layout for small phones, haptics (vibrate API), joystick dead-zone settings, battery-friendly 60 Hz mode, resume after tab switch.
- D5: content lock. Full route bots (all 7 endings plus 12:01), fairness bots for every attack at full speed (0 forced hits), 60% speed checks.
- D6: QA sweep: save migration from v1.3, all 3 files, softlock search (random-walk bot in every room), performance on low-end devices, minified build check.
- D7–D10 (buffer + ship): bug fixes, final WALKTHROUGH/SECRETS update, credits, v2.0 build, release notes.

## Ongoing rules for every session
Protect existing functionality first. Every new attack gets a telegraph and a bot-verified path. Keep the secret network subtle (no exposition dumps). Update PROGRESS.md after each chunk so a session interrupted partway can resume.

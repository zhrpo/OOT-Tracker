| n64 S1a later step ticks all of its prerequisite steps | empty | tick MQ-41 | every ANCL ancestor ticked | PASS | app.js tickOn L291-304, ANCL L60-69 |
| n64 S1b finishing the game (or the child Spirit Temple) does not leave child rows locked | empty | tick MQ-41; check KF-1. tick MQ-34; check MQ-22 | KF-1 not locked; MQ-34 implies MQ-22 (going back to child ne | FAIL | reqOf L209-213 BACK=MQ-22; main.py after |
| n64 S2 Forest Temple gives Fairy Bow and Forest Medallion | empty | tick MQ-21 | IT-13, IT-58 ticked | PASS | tickOn L307 |
| n64 S3 linked rows: full both ways, up one way | empty | tick HP-1; tick SQ-1; tick IT-16; tick SQ-27 | [true,true,false,true] | PASS | tickOn L310, L334-338 |
| n64 S4/S5 checklist steps <-> parent | empty | tick every step; then tick parent | parent ticked; all version steps ticked; no other-version st | PASS | tickOn L312-313, subsV L54 |
| n64 S6 unticking a step unticks every step after it | story finished | untick MQ-17 | no later step ticked | PASS | tickOff L359 |
| n64 S7 unticking an unrelated row removes nothing else | MQ-21 + KF-1,KF-2,HP-1 | untick KF-1 | only KF-1 removed | PASS | tickOff |
| n64 S10 locked row refuses a tick even if the checkbox is forced | empty, locks on | force change event on FT-1 | [true,false] | PASS | change handler L1241-1248 |
| n64 S17 version isolation | MQ-10 ticked in all versions | tick/untick in n64 | other versions unchanged | PASS | key() L183, setOn L290 |
| n64 S18 child row locked while stuck as adult, open after Prelude | MQ-17 ticked | check KF-1, then tick MQ-22 | [true,false] | PASS | reqOf L209-213, stuckAdult L208 |
| n64 S19 rapid tick/untick churn | MQ-10 | 60x tick/untick SQ-21, IT-36 | state back to MQ-10 only; invariants hold | PASS | tickOn/tickOff |
| n64 R random sequences keep invariants (40 seeds x 120 actions) | empty | random lock-respecting ticks (70%%) and unticks (3 | no invariant broken | PASS | tickOn, tickOff |
| n64 no page errors during tests | - | all of the above | none | PASS | app.js |
| 3ds S1a later step ticks all of its prerequisite steps | empty | tick MQ-41 | every ANCL ancestor ticked | PASS | app.js tickOn L291-304, ANCL L60-69 |
| 3ds S1b finishing the game (or the child Spirit Temple) does not leave child rows locked | empty | tick MQ-41; check KF-1. tick MQ-34; check MQ-22 | KF-1 not locked; MQ-34 implies MQ-22 (going back to child ne | FAIL | reqOf L209-213 BACK=MQ-22; main.py after |
| 3ds S2 Forest Temple gives Fairy Bow and Forest Medallion | empty | tick MQ-21 | IT-13, IT-58 ticked | PASS | tickOn L307 |
| 3ds S3 linked rows: full both ways, up one way | empty | tick HP-1; tick SQ-1; tick IT-16; tick SQ-27 | [true,true,false,true] | PASS | tickOn L310, L334-338 |
| 3ds S4/S5 checklist steps <-> parent | empty | tick every step; then tick parent | parent ticked; all version steps ticked; no other-version st | PASS | tickOn L312-313, subsV L54 |
| 3ds S6 unticking a step unticks every step after it | story finished | untick MQ-17 | no later step ticked | PASS | tickOff L359 |
| 3ds S7 unticking an unrelated row removes nothing else | MQ-21 + KF-1,KF-2,HP-1 | untick KF-1 | only KF-1 removed | PASS | tickOff |
| 3ds S10 locked row refuses a tick even if the checkbox is forced | empty, locks on | force change event on FT-1 | [true,false] | PASS | change handler L1241-1248 |
| 3ds S17 version isolation | MQ-10 ticked in all versions | tick/untick in 3ds | other versions unchanged | PASS | key() L183, setOn L290 |
| 3ds S18 child row locked while stuck as adult, open after Prelude | MQ-17 ticked | check KF-1, then tick MQ-22 | [true,false] | PASS | reqOf L209-213, stuckAdult L208 |
| 3ds S19 rapid tick/untick churn | MQ-10 | 60x tick/untick SQ-21, IT-36 | state back to MQ-10 only; invariants hold | PASS | tickOn/tickOff |
| 3ds R random sequences keep invariants (40 seeds x 120 actions) | empty | random lock-respecting ticks (70%%) and unticks (3 | no invariant broken | PASS | tickOn, tickOff |
| 3ds no page errors during tests | - | all of the above | none | PASS | app.js |
| sw2 S1a later step ticks all of its prerequisite steps | empty | tick MQ-41 | every ANCL ancestor ticked | PASS | app.js tickOn L291-304, ANCL L60-69 |
| sw2 S1b finishing the game (or the child Spirit Temple) does not leave child rows locked | empty | tick MQ-41; check KF-1. tick MQ-34; check MQ-22 | KF-1 not locked; MQ-34 implies MQ-22 (going back to child ne | FAIL | reqOf L209-213 BACK=MQ-22; main.py after |
| sw2 S2 Forest Temple gives Fairy Bow and Forest Medallion | empty | tick MQ-21 | IT-13, IT-58 ticked | PASS | tickOn L307 |
| sw2 S3 linked rows: full both ways, up one way | empty | tick HP-1; tick SQ-1; tick IT-16; tick SQ-27 | [true,true,false,true] | PASS | tickOn L310, L334-338 |
| sw2 S4/S5 checklist steps <-> parent | empty | tick every step; then tick parent | parent ticked; all version steps ticked; no other-version st | PASS | tickOn L312-313, subsV L54 |
| sw2 S6 unticking a step unticks every step after it | story finished | untick MQ-17 | no later step ticked | PASS | tickOff L359 |
| sw2 S7 unticking an unrelated row removes nothing else | MQ-21 + KF-1,KF-2,HP-1 | untick KF-1 | only KF-1 removed | PASS | tickOff |
| sw2 S10 locked row refuses a tick even if the checkbox is forced | empty, locks on | force change event on FT-1 | [true,false] | PASS | change handler L1241-1248 |
| sw2 S17 version isolation | MQ-10 ticked in all versions | tick/untick in sw2 | other versions unchanged | PASS | key() L183, setOn L290 |
| sw2 S18 child row locked while stuck as adult, open after Prelude | MQ-17 ticked | check KF-1, then tick MQ-22 | [true,false] | PASS | reqOf L209-213, stuckAdult L208 |
| sw2 S19 rapid tick/untick churn | MQ-10 | 60x tick/untick SQ-21, IT-36 | state back to MQ-10 only; invariants hold | PASS | tickOn/tickOff |
| sw2 R random sequences keep invariants (40 seeds x 120 actions) | empty | random lock-respecting ticks (70%%) and unticks (3 | no invariant broken | PASS | tickOn, tickOff |
| sw2 no page errors during tests | - | all of the above | none | PASS | app.js |
| sw2 N1 an "up" prize stays as tickOn left it after a reload | sw2: Forest Temple, Epona, no bottle | tick SQ-33 (Big Poes); reload | IT-51 same before and after reload | PASS | tickOn L310 vs normalize L468-473 |
| sw2 N1b reload does not add a prize that tickOn withheld | empty, Locks off (o.tick bypasses locks) | tick SQ-27; reload | IT-16 identical before and after reload | FAIL | tickOn L310 (reqMet) vs normalize L472 ( |
| sw2 D1 (design) untick Fairy Bow after finishing: step stays, bow goes | story finished | untick IT-13 | recorded as observed (design: later steps lean on MQ-21) | PASS | tickOff L386-390 |
| N2 settings survive a load that migrates old progress | saved: lock off, status todo, tab skull, | load page (normalize drops MQ-14 and saves), then  | stored save still holds lock, status, tab and walkthrough se | FAIL | app.js L489 vs saveLocal L1126 |
| N3 start-up with malformed save: not json | {oops | load | page renders, no page error | PASS | app.js L116-136 |
| N3 start-up with malformed save: got not array | {"got": "x"} | load | page renders, no page error | PASS | app.js L116-136 |
| N3 start-up with malformed save: got objects | {"got": [{"a": 1}, 5, null, "sw2:KF-1"]} | load | page renders, no page error | PASS | app.js L116-136 |
| N3 start-up with malformed save: unknown ids | {"got": ["sw2:ZZ-999", "nope", "sw2:MQ-1 | load | page renders, no page error | PASS | app.js L116-136 |
| N3 start-up with malformed save: bad ver/tab | {"got": [], "ver": "x", "tab": "<b>"} | load | page renders, no page error | PASS | app.js L116-136 |
| N4 a brand-new user starts with nothing ticked | no saved data | first load | no checkmarks, no prompt | FAIL | app.js L136, build defaults |
| N5 progress code import validation | empty | import 5 codes | invalid rejected, html rejected, valid added | PASS | app.js L1526-1541 |
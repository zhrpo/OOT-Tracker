| Model | Scenario | Result | Server writes, in arrival order (sw2 ids) | Final server | Lost / wrongly kept |
|---|---|---|---|---|---|
| M1 | A normal: tick on A shows on B, untick propagates, survives reload | PASS | A:KF-1; A:∅ | ∅ | — |
| M1 | B1 simultaneous edits, different rows (A lands first) | FAIL | A:∅; B:LW-1; A:KF-1 | KF-1 | lost LW-1 |
| M1 | B2 simultaneous edits, different rows (B lands first) | FAIL | B:∅; A:KF-1; B:LW-1 | LW-1 | lost KF-1 |
| M1 | B3 overlapping edits: A adds KF-2 while B removes KF-1 | FAIL | A:KF-1,KF-2; B:KF-1; B:∅ | ∅ | lost KF-2 |
| M1 | C offline progress on A, other progress on B, A reconnects | FAIL | B:LW-1,MKT-1 | LW-1,MKT-1 | lost KF-1,KF-2 |
| M1 | D1 failed save, then the page is reopened | FAIL | — | MKT-1 | lost KF-1 |
| M1 | D2 failed save, then an unrelated save succeeds | PASS | A:KF-1,KF-2 | KF-1,KF-2 | — |
| M1 | D3 failed save on A, then B's update reaches A | FAIL | B:LW-1 | LW-1 | lost KF-1 |
| M1 | E1 rapid changes while an earlier save is outstanding | PASS | A:KF-1; A:KF-1,KF-2,LW-1 | KF-1,KF-2,LW-1 | — |
| M1 | E2 late, out-of-date snapshot followed by another change | FAIL | A:KF-1; A:KF-2 | KF-2 | lost KF-1 |
| M1 | F1 reload during an outstanding save | FAIL | — | MKT-1 | lost KF-1 |
| M1 | F2 offline-session progress in local storage, reopened online | FAIL | — | MKT-1 | lost KF-1,KF-2 |
| M1 | G1 versions stay separate through sync | PASS | — | keys: n64:LW-1, sw2:KF-1 | — |
| M2 | A normal: tick on A shows on B, untick propagates, survives reload | PASS | A:KF-1; A:∅ | ∅ | — |
| M2 | B1 simultaneous edits, different rows (A lands first) | FAIL | A:KF-1; B:LW-1 | LW-1 | lost KF-1 |
| M2 | B2 simultaneous edits, different rows (B lands first) | FAIL | B:LW-1; A:KF-1 | KF-1 | lost LW-1 |
| M2 | B3 overlapping edits: A adds KF-2 while B removes KF-1 | FAIL | A:KF-1; B:∅; A:KF-1,KF-2 | KF-1,KF-2 |  kept KF-1 |
| M2 | C offline progress on A, other progress on B, A reconnects | FAIL | B:LW-1,MKT-1; A:KF-1,MKT-1; A:KF-1,KF-2,MKT-1 | KF-1,KF-2,MKT-1 | lost LW-1 |
| M2 | D1 failed save, then the page is reopened | FAIL | — | MKT-1 | lost KF-1 |
| M2 | D2 failed save, then an unrelated save succeeds | PASS | A:KF-1,KF-2 | KF-1,KF-2 | — |
| M2 | D3 failed save on A, then B's update reaches A | FAIL | B:∅; B:LW-1 | LW-1 | lost KF-1 |
| M2 | E1 rapid changes while an earlier save is outstanding | PASS | A:KF-1; A:KF-1,KF-2,LW-1 | KF-1,KF-2,LW-1 | — |
| M2 | E2 late, out-of-date snapshot followed by another change | FAIL | A:KF-1; A:∅; A:KF-2 | KF-2 | lost KF-1 |
| M2 | F1 reload during an outstanding save | FAIL | — | MKT-1 | lost KF-1 |
| M2 | F2 offline-session progress in local storage, reopened online | FAIL | — | MKT-1 | lost KF-1,KF-2 |
| M2 | G1 versions stay separate through sync | PASS | — | keys: n64:LW-1, sw2:KF-1 | — |

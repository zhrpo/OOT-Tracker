# Pre-purge checklist (PREPARED, NOT EXECUTED)

Prepared 2026-11-09 for the owner's final approval. **Nothing in this document has been run.** No history has been rewritten, nothing has been pushed, no tag or setting has changed, no backup has been created yet. This file is untracked and is never part of the purge.

Scope of the purge (owner decision, in principle): remove **only** `proj/got_old.json` and `proj/mig_final.json` from every commit. Everything else, including project content, commit messages and audit findings, is preserved. Visibility plan: Option A (private for the cleanup window only, then public again after verification). Documentation updates are a separate change, made only after the cleanup is resolved, and are never combined with the rewrite.

---

## 1. Full-history scan results (read-only, run locally)

Method: every blob in every commit reachable from any ref was read (227 blobs, 4.8 MB, 250 object paths) and tested by script; only counts and paths were printed, never the contents.

| Item | Result |
|---|---|
| Refs | 3: `main`, `origin/HEAD`, `origin/main`, all at `16ceab4`. No other branches, **no tags**, no stash entries. Local `main` equals the remote head (`git ls-remote`). |
| Commits | 9. The first, `a97c1f2`, is the root and is the only commit that adds the two files; both files are present in **all 9** commits. |
| Files holding a real-looking save (JSON list of 10+ row ids, or a `got` array) | **Exactly two: `proj/got_old.json` (82 ids) and `proj/mig_final.json` (91 ids).** Nothing else in any commit. |
| Other files with 10+ version-prefixed ids | `proj/test_gate.py` (5 ids equal to ids in the two files, no list of 10+), `proj/test_r3.py`, `scripts/test_sync.py`, `testlogs/sync_results.json`, `testlogs/test_ver.log`. Reviewed: none contains a list that matches the two files (zero or five coincidental ids out of 25 in a test script); the sync files are synthetic by construction (Session 3 used synthetic ids and the synthetic user `u_synthetic_1`). **Not part of the purge.** |
| Dense id lists in data/dump files (`DEPENDENCY_MAP.json`, `testlogs/build_state.json`, `data_audit_s5*.json`, `links.py`, etc.) | These list the app's row ids, not a player's progress (0 prefixed ids equal to the two files). Not part of the purge. |
| Save-like path names ever tracked | `proj/got_old.json`, `proj/mig_final.json`, `proj/mig_run.py` (reads `/tmp/mig*.json`, embeds nothing), plus docs and test logs whose names contain "progress". `check_user.py` was **never committed** (consistent with F-006). |
| Email addresses in any blob | 0. |
| Account/user ids | No real-looking value after `data/users/`; only placeholders and the synthetic test user shape. |
| Credential-like strings | 2 pattern hits in `proj/test_side.py`: a word `SECRET`/`secret` followed by a 27–29 character string **containing spaces** (prose, not a key). Not a credential; not part of the purge. |
| Commit metadata | One identity on all 9 commits (`Claude <noreply@anthropic.com>`); no personal name or email. Each commit message carries a `Claude-Session:` link (9 commits). Left as is, since the purge is limited to the two files. |
| Repository size | `.git` 1.4 MB. |

**Conclusion: no other player-save data was found. The purge list stays exactly the two files.** The scan cannot prove that a differently formatted save is absent (for example one split across prose); it covers list-shaped ids, emails, account ids and credential patterns.

---

## 2. What needs your action, and what Claude can prepare

**Your action**
1. Choose the backup location (§3). Suggested: a folder outside the repository, outside `OneDrive` and outside any synced folder, for example `C:\Users\harpz\oot-prepurge-backup\`. It will contain your progress snapshots by design.
2. Approve installing `git-filter-repo` (in a throwaway virtual environment outside the repository). This is a dependency install, so it needs your explicit yes.
3. On the day: switch the repository to **Private**, tell me, and later switch it back to **Public** (Claude never changes visibility).
4. Give the **final execution approval** (§8).
5. After the push: GitHub follow-up outside Git (§9).

**Claude can safely prepare now (no repository change):** this checklist, the exact commands, the verification script (written to the scratchpad, read-only), and the expected-impact table. **Not done:** the backup itself (waiting for the location), the install, any rewrite, any push.

---

## 3. Offline backup procedure

Purpose: the old history can always be restored if the rewrite goes wrong.

1. Create the folder from the chosen location (not inside the repository, not synced). Free space is not a concern (173 GB free, repository 1.4 MB).
2. Mirror the **remote**, not the working folder:
   `git clone --mirror https://github.com/zhrpo/OOT-Tracker.git <backup-folder>\oot-tracker-prepurge.git`
3. Also make a single-file bundle: `git -C <mirror> bundle create <backup-folder>\oot-tracker-prepurge.bundle --all`
4. Verify: `git -C <mirror> fsck --full` exits 0; `git bundle verify <bundle>` reports "okay"; `git -C <mirror> rev-parse main` equals `16ceab46045e08948448dbc0b80994cb430aed34`; `git -C <mirror> rev-list --all --count` is 9.
5. Record the bundle's SHA-256 in the phase report (not in the repository).
6. Handling: the backup contains the two player-data files. Keep it private, never upload or share it, and delete it when you decide. It is not touched by the purge.
7. The working folder `C:\Users\harpz\Documents\GitHub\OOT-Tracker` is a second copy of the old history; it stays until step 10 of §6.

---

## 4. Pre-flight checklist (all must be true before the rewrite)

| # | Check | Who | Status |
|---|---|---|---|
| 1 | Backup mirror and bundle created and verified (§3) | Claude, after location is chosen | Open |
| 2 | Scan results reviewed; purge list is exactly the two files | Owner | Prepared (§1) |
| 3 | Remote `main` is still `16ceab4` (`git ls-remote`) so nothing newer is lost | Claude | Re-run on the day |
| 4 | No open pull requests, no other branches or tags that need rewriting | Claude (`ls-remote`) | Open; none today |
| 5 | Repository set to **Private** and confirmed (public API returns 404) | Owner flips, Claude checks | Open |
| 6 | `git-filter-repo` installed in a throwaway environment, version recorded | Claude, after owner's yes | Open |
| 7 | Local working folder clean apart from the untracked scope and checklist files; these two files copied to a safe place for step 10 | Claude | Open |
| 8 | Final execution approval given in writing | Owner | Open |

---

## 5. Rewrite procedure (to run only after final approval)

All steps happen in a **fresh clone outside the repository folder** (for example `C:\Users\harpz\oot-purge-work\`), never in the current working folder.

1. `git clone https://github.com/zhrpo/OOT-Tracker.git oot-purge-work` and confirm `rev-parse HEAD` is `16ceab4…`.
2. Record before-state: `git rev-list --reverse HEAD` (9 hashes), `git ls-tree -r HEAD --name-only | wc -l` (193), a hash of each remaining file (`git ls-tree -r HEAD` blob ids excluding the two files).
3. `git filter-repo --invert-paths --path proj/got_old.json --path proj/mig_final.json`
   (filter-repo removes the `origin` remote on purpose; it is re-added in step 6.)
4. Run the verification criteria (§7). **Any failure stops the process.**
5. Save the commit map (`.git/filter-repo/commit-map`) next to the backup (and later into `audit/`).
6. Re-add the remote: `git remote add origin https://github.com/zhrpo/OOT-Tracker.git`; `git fetch origin` (to learn the remote head for the lease).
7. Wait for the owner's go-ahead for the push (§8).

---

## 6. Push, visibility and cleanup sequence (Option A)

1. Owner: switch the repository to **Private**. Claude confirms (API returns 404).
2. Push the rewritten `main` with an explicit lease on the old head:
   `git push --force-with-lease=main:16ceab46045e08948448dbc0b80994cb430aed34 origin main`
   Rulesets are not enforced on private repositories on GitHub Free, which is the reason for the private window. **If GitHub rejects the push because the ruleset is enforced, stop; do not edit the ruleset, ask the owner.** There are no other branches or tags to push.
3. Verify the remote: `git ls-remote origin` shows exactly one ref, `main`, equal to the rewritten head; a fresh clone of the remote passes all §7 criteria.
4. Owner: switch the repository back to **Public**, only after step 3 passes. Claude then checks, read-only: `visibility: public`, and the public rules endpoint still lists the four rules of ruleset 26902224 for `main`.
5. **No tag is created and no tag ruleset is created in this procedure** (owner instruction). The baseline tag comes later, on the rewritten commit corresponding to old `16ceab4`.
6. Working copies: copy the scope document and this checklist out of the current folder, then delete the current local folder (it still holds the old history and the two files) and re-clone from the rewritten remote. Any other machine with a clone must do the same. Never `git pull` into an old clone.
7. The offline backup is kept until the owner deletes it.

---

## 7. Exact verification criteria (all must pass)

| # | Criterion | How |
|---|---|---|
| V-1 | The two paths are absent from every commit of the rewritten repository | `git log --all --oneline -- proj/got_old.json proj/mig_final.json` prints nothing; `git rev-list --all --objects | grep -c "got_old.json\|mig_final.json"` is 0 |
| V-2 | The commit count is unchanged | `git rev-list --all --count` is 9 |
| V-3 | The tree of every rewritten commit equals the old tree minus exactly those two paths | for each pair in the commit map: `git diff --name-status <old> <new>` (old from the backup mirror) lists only `D proj/got_old.json` and `D proj/mig_final.json` |
| V-4 | Every other file is byte-identical in the head | the blob ids of all 191 other files in the new head equal the pre-recorded ones |
| V-5 | Commit messages, authors, dates and order are preserved | `git log --format='%an|%ae|%ad|%B'` comparison against the backup mirror shows no difference |
| V-6 | Refs are exactly `main` (no tags, no stray refs) | `git for-each-ref` |
| V-7 | The full-history scan finds no list-shaped save, no email, no account id | rerun the §1 scan on the rewritten repository: the "real-looking save" count is 0 |
| V-8 | The rewritten head still builds the same application | text-compare of every file `build.py` reads against the backup (a rebuild is **not** run in this procedure) |
| V-9 | Remote equals local after the push | `git ls-remote origin` equals `rev-parse main`; a fresh clone repeats V-1 to V-6 |
| V-10 | Repository settings after restoring public | visibility `public`, ruleset 26902224 still listed with its four rules, Pages off |

---

## 8. Expected impact

| Area | Effect |
|---|---|
| Commits | **All 9 hashes change**, because the root commit `a97c1f2` contains the files. There is no unchanged prefix. Old and new hashes are mapped in the commit map. |
| Files | 193 tracked files become 191. Nothing else changes. |
| Content | Project, audit documents, scripts, logs and messages unchanged. |
| Baseline | The hash `16ceab4` cited in the docs becomes obsolete. The new baseline hash is taken from the commit map and the docs are corrected in the **separate** documentation change afterwards. |
| Tags and branches | None exist, so none are lost or rewritten. |
| Pull requests | None open. |
| Clones | Any existing clone becomes incompatible and must be deleted and re-cloned. |
| Copies already made | Clones, forks (0 today), caches or archives from the time the repository was public are not recalled. Making the repository private does not remove them. |
| GitHub-side | Old commit objects stay reachable by their hash on GitHub until garbage collection; removal needs a request to GitHub support. |
| Downtime | The repository is private for the cleanup window; the window ends after V-9. |

---

## 9. After the push (your action, outside Git)

1. Check Settings, Forks and Insights, Forks for any fork made while public (0 forks today).
2. Ask GitHub support to garbage-collect cached objects for the old hashes if you want them gone from GitHub's own cache. They need the repository name and the old commit hashes (`a97c1f2` and the eight later ones).
3. Check old issues, pull requests and release assets for attachments (none known).
4. Confirm to Claude when done, so the phase report can record it.

---

## 10. Rollback

If any criterion fails **before** the push: delete the fresh clone and start again; nothing remote changed.
If a problem is found **after** the push: restore from the backup mirror (`git push --force` of the old `main` from the mirror, with the repository still private and your explicit approval), then investigate.

---

## 11. Approval wording needed for final execution

Please confirm each item you accept:
- Backup location: ______
- Install `git-filter-repo` in a throwaway environment: yes / no
- Execute the rewrite in a fresh clone (§5): yes / no
- Switch to private yourself and tell me, then I may force-push the rewritten `main` with the stated lease (§6): yes / no
- You switch back to public after V-9: yes / no
- Baseline tag and tag ruleset stay out of this procedure: confirmed (owner instruction)
- Documentation updates stay a separate later change: confirmed (owner instruction)

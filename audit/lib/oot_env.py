"""Repository-relative paths and browser location for the audit scripts and the legacy tests.

Introduced in Session 6, Phase 0. Before this, about 70 scripts hard-coded /home/claude/... and
/usr/bin/google-chrome. Everything here is derived from the location of this file, so the repository
can be cloned anywhere. Environment overrides:

  OOT_CHROME   path to a Chrome/Chromium executable (default: first installed browser found)
  OOT_OUT      folder holding the built pages (default: <repo>/out)
  OOT_SCRATCH  folder for screenshots and temporary files (default: <repo>/.scratch, git-ignored)
  OOT_TMP      folder for disposable build copies (default: <scratch>/tmp)
  OOT_LOGS     folder where audit scripts read/write their evidence files (default: <repo>/audit/testlogs;
               run_all.py points it at a scratch copy so runs never rewrite the committed evidence)

All values are strings with forward slashes (valid on Windows, Linux and macOS).
"""
import os
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2].as_posix()
PROJ = ROOT + "/proj"
AUDIT = ROOT + "/audit"
SCRIPTS = AUDIT + "/scripts"
LOGS = os.environ.get("OOT_LOGS", AUDIT + "/testlogs").replace("\\", "/")
OUT = os.environ.get("OOT_OUT", ROOT + "/out").replace("\\", "/")
SCRATCH = os.environ.get("OOT_SCRATCH", ROOT + "/.scratch").replace("\\", "/")
TMP = os.environ.get("OOT_TMP", SCRATCH + "/tmp").replace("\\", "/")
for _d in (SCRATCH, TMP):
    os.makedirs(_d, exist_ok=True)
OUT_URL = pathlib.Path(OUT).as_uri()


def _find_chrome():
    env = os.environ.get("OOT_CHROME")
    if env:
        return env.replace("\\", "/")
    candidates = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"),
        "/usr/bin/google-chrome",
        "/usr/bin/chromium",
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    ]
    for c in candidates:
        if os.path.exists(c):
            return c.replace("\\", "/")
    raise RuntimeError("No Chrome found. Install Chrome or set OOT_CHROME to its executable.")


CHROME = _find_chrome()

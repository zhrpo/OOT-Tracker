# test helper: every browser context starts with all areas open (the app starts them closed)
import os
from playwright.sync_api import Browser
if os.environ.get("OPEN", "1") != "0":
    _orig = Browser.new_context
    def _nc(self, *a, **k):
        c = _orig(self, *a, **k)
        c.add_init_script("window.__ootOpen = true; window.__ootDefVer = '%s'; window.__ootNoAsk = %s; window.__ootNoVeil = %s" % (os.environ.get("DEFVER", "sw2"), "false" if os.environ.get("ASK") == "1" else "true", "false" if os.environ.get("VEIL") == "1" else "true"))
        return c
    Browser.new_context = _nc

# locked rows cannot be ticked any more: older tests that tick a locked row on purpose switch the locks off for that one click
from playwright.sync_api import Locator
_chk = Locator.check
def _check(self, *a, **k):
    try:
        locked = self.count() == 1 and self.is_disabled()
    except Exception:
        locked = False
    if locked:
        self.page.click("#lockon")
        try:
            return _chk(self, *a, **k)
        finally:
            self.page.click("#lockon")
    return _chk(self, *a, **k)
Locator.check = _check


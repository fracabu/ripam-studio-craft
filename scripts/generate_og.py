"""
Genera public/og-image.png (1200x630) da scripts/og-image.html
usando Playwright headless Chromium.
Rilancia con: python scripts/generate_og.py
"""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
HTML = ROOT / "scripts" / "og-image.html"
OUT = ROOT / "public" / "og-image.png"

def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(viewport={"width": 1200, "height": 630}, device_scale_factor=2)
        page = ctx.new_page()
        page.goto(HTML.as_uri(), wait_until="networkidle")
        page.evaluate("document.fonts.ready")
        page.wait_for_timeout(400)
        page.screenshot(path=str(OUT), full_page=False, omit_background=False, clip={"x": 0, "y": 0, "width": 1200, "height": 630})
        browser.close()
    size_kb = OUT.stat().st_size / 1024
    print(f"OK -> {OUT} ({size_kb:.1f} KB)")

if __name__ == "__main__":
    main()
